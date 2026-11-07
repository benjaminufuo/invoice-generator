import { PDFDocument, rgb, StandardFonts, PageSizes, PDFPage, PDFFont } from "pdf-lib";
import { Invoice, PublicInvoice, SupportedCurrency } from "@/types";
import { formatDate } from "@/lib/calculations";

// A4 Dimensions in points (72 points = 1 inch)
const PAGE_WIDTH = PageSizes.A4[0]; // 595.28
const PAGE_HEIGHT = PageSizes.A4[1]; // 841.89
const MARGIN = 45;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 505.28

// Colors (RGB normalized 0-1)
const COLOR_PRIMARY = rgb(0.09, 0.09, 0.11); // zinc-950 (#18181b)
const COLOR_MUTED = rgb(0.44, 0.44, 0.48); // zinc-500 (#71717a)
const COLOR_BORDER = rgb(0.89, 0.89, 0.91); // zinc-200 (#e4e4e7)
const COLOR_HEADER_BG = rgb(0.96, 0.96, 0.97); // zinc-100 (#f4f4f5)
const COLOR_ACCENT = rgb(0.2, 0.25, 0.85); // subtle indigo

/**
 * Format currency for PDF output.
 * Uses 'NGN ' for Nigerian Naira because the Helvetica WinAnsi font
 * does not encode the Unicode ₦ (U+20A6) glyph.
 */
export function formatPdfCurrency(amount: number, currency: SupportedCurrency = "NGN"): string {
  const prefix = currency === "NGN" ? "NGN " : "$";
  const formatted = Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${prefix}${formatted}`;
}

/**
 * Wraps text into lines that fit within a maximum width in points.
 */
function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  if (!text) return [];
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    const words = para.split(/\s+/);
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = `${currentLine} ${word}`;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Safe image fetch & embedder.
 * Works in both browser and server environments.
 * Converts WebP to PNG via canvas if in browser.
 */
async function embedLogoSafe(
  pdfDoc: PDFDocument,
  logoUrl?: string
): Promise<{ image: unknown; width: number; height: number } | null> {
  if (!logoUrl) return null;

  try {
    let resolvedUrl = logoUrl;
    if (typeof window !== "undefined") {
      if (logoUrl.startsWith("/")) {
        resolvedUrl = `${window.location.origin}${logoUrl}`;
      }
    } else {
      if (logoUrl.startsWith("/")) {
        const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        resolvedUrl = `${base}${logoUrl}`;
      }
    }

    // Try canvas-assisted conversion if in browser and image might be WebP or need standardization
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = (e) => reject(e);
          img.src = resolvedUrl;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const embedded = await pdfDoc.embedPng(bytes);
          const dims = embedded.scale(1);
          return { image: embedded, width: dims.width, height: dims.height };
        }
      } catch (browserErr) {
        console.warn("Browser canvas conversion failed, falling back to raw fetch:", browserErr);
      }
    }

    // Direct fetch fallback (Node or if canvas failed)
    const response = await fetch(resolvedUrl);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Check magic bytes: PNG starts with 0x89 0x50 0x4E 0x47, JPG with 0xFF 0xD8
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8;

    if (isPng) {
      const embedded = await pdfDoc.embedPng(bytes);
      const dims = embedded.scale(1);
      return { image: embedded, width: dims.width, height: dims.height };
    } else if (isJpg) {
      const embedded = await pdfDoc.embedJpg(bytes);
      const dims = embedded.scale(1);
      return { image: embedded, width: dims.width, height: dims.height };
    }
  } catch (err) {
    console.warn("Could not embed logo image in PDF:", err);
  }

  return null;
}

/**
 * Generates an authoritative, professional vector A4 PDF for an invoice.
 */
export async function generateInvoicePdf(
  invoice: Invoice | PublicInvoice
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Embed standard clean typography
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Attempt to embed business logo snapshot
  const embeddedLogo = await embedLogoSafe(pdfDoc, invoice.logoUrl);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = PAGE_HEIGHT - MARGIN;

  // Helper to start a new page if needed
  const ensureSpace = (neededHeight: number): void => {
    if (cursorY - neededHeight < MARGIN + 40) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursorY = PAGE_HEIGHT - MARGIN;
    }
  };

  // ==========================================
  // 1. HEADER SECTION (Logo, Title, Metadata)
  // ==========================================
  const headerTopY = cursorY;
  let logoBottomY = headerTopY;

  // Draw Logo if available
  if (embeddedLogo) {
    const maxLogoW = 140;
    const maxLogoH = 55;
    const scale = Math.min(maxLogoW / embeddedLogo.width, maxLogoH / embeddedLogo.height, 1);
    const renderW = embeddedLogo.width * scale;
    const renderH = embeddedLogo.height * scale;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    page.drawImage(embeddedLogo.image as any, {
      x: MARGIN,
      y: headerTopY - renderH,
      width: renderW,
      height: renderH,
    });
    logoBottomY = headerTopY - renderH;
  }

  // Right-aligned Invoice Title & Metadata
  const titleText = "INVOICE";
  const titleSize = 22;
  const titleWidth = fontBold.widthOfTextAtSize(titleText, titleSize);
  page.drawText(titleText, {
    x: PAGE_WIDTH - MARGIN - titleWidth,
    y: headerTopY - 18,
    size: titleSize,
    font: fontBold,
    color: COLOR_PRIMARY,
  });

  // Invoice Number
  const invNumberText = `# ${invoice.invoiceNumber}`;
  const invNumSize = 11;
  const invNumWidth = fontBold.widthOfTextAtSize(invNumberText, invNumSize);
  page.drawText(invNumberText, {
    x: PAGE_WIDTH - MARGIN - invNumWidth,
    y: headerTopY - 34,
    size: invNumSize,
    font: fontBold,
    color: COLOR_MUTED,
  });

  // Metadata block on right: Issue Date, Due Date, Status
  let metaY = headerTopY - 50;
  const drawMetaRow = (label: string, val: string) => {
    const full = `${label}:  ${val}`;
    const fullW = fontRegular.widthOfTextAtSize(full, 9);
    page.drawText(label + ":", {
      x: PAGE_WIDTH - MARGIN - fullW,
      y: metaY,
      size: 9,
      font: fontRegular,
      color: COLOR_MUTED,
    });
    const labelW = fontRegular.widthOfTextAtSize(label + ":  ", 9);
    page.drawText(val, {
      x: PAGE_WIDTH - MARGIN - fullW + labelW,
      y: metaY,
      size: 9,
      font: fontBold,
      color: COLOR_PRIMARY,
    });
    metaY -= 13;
  };

  drawMetaRow("Issue Date", formatDate(invoice.issueDate));
  if (invoice.dueDate) {
    drawMetaRow("Due Date", formatDate(invoice.dueDate));
  }
  drawMetaRow("Status", (invoice.status || "DRAFT").toUpperCase());

  cursorY = Math.min(logoBottomY, metaY) - 20;

  // Header separator line
  page.drawLine({
    start: { x: MARGIN, y: cursorY },
    end: { x: PAGE_WIDTH - MARGIN, y: cursorY },
    thickness: 1,
    color: COLOR_BORDER,
  });

  cursorY -= 20;

  // ==========================================
  // 2. SENDER & CUSTOMER DETAILS
  // ==========================================
  const detailsY = cursorY;

  // Left column: From (Issuer)
  page.drawText("FROM", {
    x: MARGIN,
    y: detailsY,
    size: 8,
    font: fontBold,
    color: COLOR_MUTED,
  });

  let fromY = detailsY - 14;
  page.drawText(invoice.sender.name || "Business", {
    x: MARGIN,
    y: fromY,
    size: 11,
    font: fontBold,
    color: COLOR_PRIMARY,
  });
  fromY -= 13;

  if (invoice.sender.email) {
    page.drawText(invoice.sender.email, {
      x: MARGIN,
      y: fromY,
      size: 9,
      font: fontRegular,
      color: COLOR_MUTED,
    });
    fromY -= 12;
  }
  if (invoice.sender.phone) {
    page.drawText(invoice.sender.phone, {
      x: MARGIN,
      y: fromY,
      size: 9,
      font: fontRegular,
      color: COLOR_MUTED,
    });
    fromY -= 12;
  }
  if (invoice.sender.address) {
    const addressLines = wrapText(invoice.sender.address, 220, fontRegular, 9);
    for (const line of addressLines) {
      page.drawText(line, {
        x: MARGIN,
        y: fromY,
        size: 9,
        font: fontRegular,
        color: COLOR_MUTED,
      });
      fromY -= 12;
    }
  }

  // Right column: Billed To (Client)
  const clientColX = MARGIN + 260;
  page.drawText("BILLED TO", {
    x: clientColX,
    y: detailsY,
    size: 8,
    font: fontBold,
    color: COLOR_MUTED,
  });

  let toY = detailsY - 14;
  page.drawText(invoice.customer.name || "Client", {
    x: clientColX,
    y: toY,
    size: 11,
    font: fontBold,
    color: COLOR_PRIMARY,
  });
  toY -= 13;

  if (invoice.customer.email) {
    page.drawText(invoice.customer.email, {
      x: clientColX,
      y: toY,
      size: 9,
      font: fontRegular,
      color: COLOR_MUTED,
    });
    toY -= 12;
  }
  if (invoice.customer.phone) {
    page.drawText(invoice.customer.phone, {
      x: clientColX,
      y: toY,
      size: 9,
      font: fontRegular,
      color: COLOR_MUTED,
    });
    toY -= 12;
  }
  if (invoice.customer.address) {
    const addressLines = wrapText(invoice.customer.address, 220, fontRegular, 9);
    for (const line of addressLines) {
      page.drawText(line, {
        x: clientColX,
        y: toY,
        size: 9,
        font: fontRegular,
        color: COLOR_MUTED,
      });
      toY -= 12;
    }
  }

  cursorY = Math.min(fromY, toY) - 20;

  // ==========================================
  // 3. LINE ITEMS TABLE
  // ==========================================
  ensureSpace(100);

  // Column definitions
  const colDescX = MARGIN + 8;
  const colDescW = 260;
  const colQtyX = MARGIN + 280;
  const colQtyW = 40;
  const colPriceX = MARGIN + 330;
  const colPriceW = 80;
  const colAmountX = MARGIN + 420;
  const colAmountW = 75;

  const drawTableHeader = (y: number) => {
    // Header background fill
    page.drawRectangle({
      x: MARGIN,
      y: y - 18,
      width: CONTENT_WIDTH,
      height: 22,
      color: COLOR_HEADER_BG,
    });

    page.drawText("DESCRIPTION", {
      x: colDescX,
      y: y - 12,
      size: 8,
      font: fontBold,
      color: COLOR_MUTED,
    });
    page.drawText("QTY", {
      x: colQtyX,
      y: y - 12,
      size: 8,
      font: fontBold,
      color: COLOR_MUTED,
    });
    page.drawText("UNIT PRICE", {
      x: colPriceX + colPriceW - fontBold.widthOfTextAtSize("UNIT PRICE", 8),
      y: y - 12,
      size: 8,
      font: fontBold,
      color: COLOR_MUTED,
    });
    page.drawText("AMOUNT", {
      x: colAmountX + colAmountW - fontBold.widthOfTextAtSize("AMOUNT", 8),
      y: y - 12,
      size: 8,
      font: fontBold,
      color: COLOR_MUTED,
    });
  };

  drawTableHeader(cursorY);
  cursorY -= 28;

  // Draw Table Rows
  for (const item of invoice.items) {
    const descLines = wrapText(item.description, colDescW - 10, fontRegular, 9);
    const rowHeight = Math.max(descLines.length * 13 + 10, 24);

    if (cursorY - rowHeight < MARGIN + 100) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursorY = PAGE_HEIGHT - MARGIN;
      drawTableHeader(cursorY);
      cursorY -= 28;
    }

    // Row description
    let itemY = cursorY;
    for (const dLine of descLines) {
      page.drawText(dLine, {
        x: colDescX,
        y: itemY,
        size: 9,
        font: fontRegular,
        color: COLOR_PRIMARY,
      });
      itemY -= 13;
    }

    // Qty
    page.drawText(String(item.quantity), {
      x: colQtyX,
      y: cursorY,
      size: 9,
      font: fontRegular,
      color: COLOR_PRIMARY,
    });

    // Unit Price (right aligned)
    const priceText = formatPdfCurrency(item.unitPrice, invoice.currency);
    const priceW = fontRegular.widthOfTextAtSize(priceText, 9);
    page.drawText(priceText, {
      x: colPriceX + colPriceW - priceW,
      y: cursorY,
      size: 9,
      font: fontRegular,
      color: COLOR_PRIMARY,
    });

    // Amount (right aligned)
    const amountText = formatPdfCurrency(item.lineTotal, invoice.currency);
    const amountW = fontBold.widthOfTextAtSize(amountText, 9);
    page.drawText(amountText, {
      x: colAmountX + colAmountW - amountW,
      y: cursorY,
      size: 9,
      font: fontBold,
      color: COLOR_PRIMARY,
    });

    cursorY -= rowHeight;

    // Row underline
    page.drawLine({
      start: { x: MARGIN, y: cursorY + 4 },
      end: { x: PAGE_WIDTH - MARGIN, y: cursorY + 4 },
      thickness: 0.5,
      color: COLOR_BORDER,
    });
  }

  cursorY -= 10;

  // ==========================================
  // 4. TOTALS SECTION
  // ==========================================
  ensureSpace(80);

  const totalsBoxW = 200;
  const totalsBoxX = PAGE_WIDTH - MARGIN - totalsBoxW;

  // Subtotal
  page.drawText("Subtotal:", {
    x: totalsBoxX,
    y: cursorY,
    size: 9,
    font: fontRegular,
    color: COLOR_MUTED,
  });
  const subtotalStr = formatPdfCurrency(invoice.subtotal, invoice.currency);
  const subtotalW = fontRegular.widthOfTextAtSize(subtotalStr, 9);
  page.drawText(subtotalStr, {
    x: PAGE_WIDTH - MARGIN - subtotalW,
    y: cursorY,
    size: 9,
    font: fontRegular,
    color: COLOR_PRIMARY,
  });

  cursorY -= 18;

  // Divider above Total
  page.drawLine({
    start: { x: totalsBoxX, y: cursorY + 6 },
    end: { x: PAGE_WIDTH - MARGIN, y: cursorY + 6 },
    thickness: 1,
    color: COLOR_BORDER,
  });

  // Total Due
  page.drawText("Total Due:", {
    x: totalsBoxX,
    y: cursorY - 4,
    size: 12,
    font: fontBold,
    color: COLOR_PRIMARY,
  });
  const totalStr = formatPdfCurrency(invoice.total, invoice.currency);
  const totalW = fontBold.widthOfTextAtSize(totalStr, 12);
  page.drawText(totalStr, {
    x: PAGE_WIDTH - MARGIN - totalW,
    y: cursorY - 4,
    size: 12,
    font: fontBold,
    color: COLOR_PRIMARY,
  });

  cursorY -= 35;

  // ==========================================
  // 5. PAYMENT INSTRUCTIONS & NOTES
  // ==========================================
  if (invoice.paymentInstructions || invoice.notes) {
    ensureSpace(80);

    const notesWidth = (CONTENT_WIDTH - 20) / 2;

    if (invoice.paymentInstructions) {
      let py = cursorY;
      page.drawText("PAYMENT INSTRUCTIONS", {
        x: MARGIN,
        y: py,
        size: 8,
        font: fontBold,
        color: COLOR_MUTED,
      });
      py -= 12;

      const pLines = wrapText(invoice.paymentInstructions, notesWidth, fontRegular, 8.5);
      for (const pl of pLines) {
        page.drawText(pl, {
          x: MARGIN,
          y: py,
          size: 8.5,
          font: fontRegular,
          color: COLOR_PRIMARY,
        });
        py -= 11;
      }
    }

    if (invoice.notes) {
      const notesX = MARGIN + notesWidth + 20;
      let ny = cursorY;
      page.drawText("NOTES / TERMS", {
        x: notesX,
        y: ny,
        size: 8,
        font: fontBold,
        color: COLOR_MUTED,
      });
      ny -= 12;

      const nLines = wrapText(invoice.notes, notesWidth, fontRegular, 8.5);
      for (const nl of nLines) {
        page.drawText(nl, {
          x: notesX,
          y: ny,
          size: 8.5,
          font: fontRegular,
          color: COLOR_PRIMARY,
        });
        ny -= 11;
      }
    }
  }

  // ==========================================
  // 6. FOOTER
  // ==========================================
  const totalPages = pdfDoc.getPageCount();
  const pages = pdfDoc.getPages();
  for (let idx = 0; idx < totalPages; idx++) {
    const p = pages[idx];
    const footerText = "Thank you for your business.";
    p.drawText(footerText, {
      x: MARGIN,
      y: MARGIN - 15,
      size: 8,
      font: fontRegular,
      color: COLOR_MUTED,
    });

    const pageNumText = `Page ${idx + 1} of ${totalPages}`;
    const pageNumW = fontRegular.widthOfTextAtSize(pageNumText, 8);
    p.drawText(pageNumText, {
      x: PAGE_WIDTH - MARGIN - pageNumW,
      y: MARGIN - 15,
      size: 8,
      font: fontRegular,
      color: COLOR_MUTED,
    });
  }

  return await pdfDoc.save();
}

/**
 * Triggers a direct client-side download of the invoice as a PDF file.
 */
export async function downloadInvoicePdf(
  invoice: Invoice | PublicInvoice
): Promise<void> {
  const pdfBytes = await generateInvoicePdf(invoice);
  const uint8 = new Uint8Array(pdfBytes);
  const blob = new Blob([uint8], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const cleanNumber = (invoice.invoiceNumber || "INVOICE").replace(
    /[^a-zA-Z0-9_-]/g,
    "_"
  );
  const filename = `Invoice-${cleanNumber}.pdf`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
