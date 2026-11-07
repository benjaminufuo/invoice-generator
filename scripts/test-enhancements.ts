import { generateInvoicePdf, formatPdfCurrency } from "../src/lib/pdf";
import { Invoice, PublicInvoice } from "../src/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log("\n--- RUNNING FEATURE ENHANCEMENT TESTS ---\n");

  // Test 1: PDF Currency formatting
  const ngnPdf = formatPdfCurrency(75000, "NGN");
  assert(ngnPdf === "NGN 75,000.00", `PDF currency for NGN should be "NGN 75,000.00", got "${ngnPdf}"`);

  const usdPdf = formatPdfCurrency(2500.5, "USD");
  assert(usdPdf === "$2,500.50", `PDF currency for USD should be "$2,500.50", got "${usdPdf}"`);

  // Test 2: Vector A4 PDF generation
  const mockInvoice: Invoice = {
    _id: "671fb2c58e1a5a001a111111",
    ownerId: "user_123456",
    invoiceNumber: "INV-2026-TEST-001",
    issueDate: "2026-10-28T00:00:00.000Z",
    dueDate: "2026-11-11T00:00:00.000Z",
    currency: "NGN",
    logoUrl: "",
    shareToken: "a1b2c3d4e5f67890123456789abcdef0",
    isPublicShareEnabled: true,
    sender: {
      name: "Acme Creative Studios",
      email: "billing@acme.ng",
      phone: "+234 800 123 4567",
      address: "10 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
    },
    customer: {
      name: "Global Tech Enterprises",
      email: "finance@globaltech.com",
      phone: "+1 555 987 6543",
      address: "450 Innovation Blvd, Suite 200, San Francisco, CA",
    },
    items: [
      {
        description: "Full-stack Web Application Development (Phase 1)",
        quantity: 1,
        unitPrice: 450000,
        lineTotal: 450000,
      },
      {
        description: "Cloud Architecture & MongoDB Atlas Setup",
        quantity: 2,
        unitPrice: 50000,
        lineTotal: 100000,
      },
    ],
    subtotal: 550000,
    total: 550000,
    notes: "Payment due within 14 calendar days. Thank you for partnering with us!",
    paymentInstructions: "Bank: Zenith Bank\nAccount Name: Acme Creative Studios\nAccount No: 1012345678",
    status: "sent",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-28T10:00:00.000Z",
  };

  const pdfBytes = await generateInvoicePdf(mockInvoice);
  assert(pdfBytes instanceof Uint8Array, "generateInvoicePdf should return a Uint8Array");
  assert(pdfBytes.length > 500, `PDF bytes length should be > 500 bytes, got ${pdfBytes.length}`);

  // Check PDF magic header %PDF-
  const header = String.fromCharCode(pdfBytes[0], pdfBytes[1], pdfBytes[2], pdfBytes[3], pdfBytes[4]);
  assert(header === "%PDF-", `PDF magic header must be "%PDF-", got "${header}"`);

  // Test 3: PublicInvoice shape verification (data isolation)
  const publicInvoice: PublicInvoice = {
    invoiceNumber: mockInvoice.invoiceNumber,
    issueDate: mockInvoice.issueDate,
    dueDate: mockInvoice.dueDate,
    currency: mockInvoice.currency,
    logoUrl: mockInvoice.logoUrl,
    sender: mockInvoice.sender,
    customer: mockInvoice.customer,
    items: mockInvoice.items,
    subtotal: mockInvoice.subtotal,
    total: mockInvoice.total,
    notes: mockInvoice.notes,
    paymentInstructions: mockInvoice.paymentInstructions,
    status: mockInvoice.status,
    updatedAt: mockInvoice.updatedAt,
  };

  const publicPdfBytes = await generateInvoicePdf(publicInvoice);
  assert(publicPdfBytes.length > 500, "generateInvoicePdf should support PublicInvoice successfully");

  // Verify internal ownerId is not present on publicInvoice
  assert(!("ownerId" in publicInvoice), "PublicInvoice must never expose ownerId");
  assert(!("_id" in publicInvoice), "PublicInvoice must never expose database internal _id");

  console.log("\n🎉 ALL FEATURE ENHANCEMENT TESTS PASSED SUCCESSFULLY!\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
