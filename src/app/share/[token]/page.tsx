"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PublicInvoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { downloadInvoicePdf } from "@/lib/pdf";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Printer, Download, AlertCircle, FileText } from "lucide-react";

export default function PublicShareInvoicePage() {
  const params = useParams();
  const token = params?.token as string;

  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    async function loadPublicInvoice() {
      if (!token) return;
      try {
        const res = await fetch(`/api/invoices/share/${token}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(
            errData.error ||
              "This invoice is either private, no longer active, or the link is invalid."
          );
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setInvoice(data.data);
      } catch (err) {
        console.error("Failed to load invoice:", err);
        setError("Failed to load invoice. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPublicInvoice();
  }, [token]);

  const handleDownloadPdf = async () => {
    if (!invoice || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await downloadInvoicePdf(invoice);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to generate PDF. Please try printing or refreshing.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="InvoiceGen" className="w-12 h-12 object-contain animate-pulse mb-3" />
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-zinc-500 font-medium">Loading invoice...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-900">Invoice Unavailable</h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2 leading-relaxed">
              {error || "The link you followed has expired, been disabled, or is invalid."}
            </p>
          </div>
          <p className="text-[11px] text-zinc-400">
            If you believe this is an error, please contact the issuer directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Floating Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-zinc-900 text-sm">
                  {invoice.invoiceNumber}
                </span>
                <Badge status={invoice.status} size="sm" />
              </div>
              <p className="text-[11px] text-zinc-500">
                Issued by {invoice.sender.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPdf}
              isLoading={isDownloadingPdf}
              className="gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </Button>
          </div>
        </div>

        {/* Invoice Document Paper */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] p-6 sm:p-10 md:p-12 print-page">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-zinc-100 gap-6">
            <div className="space-y-4">
              {invoice.logoUrl && (
                <div className="max-w-[180px] max-h-[64px] flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={invoice.logoUrl}
                    alt={`${invoice.sender.name} Logo`}
                    className="max-h-16 max-w-full object-contain rounded-xs"
                  />
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Commercial Invoice
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 font-mono mt-0.5">
                  {invoice.invoiceNumber}
                </h1>
                <div className="mt-2">
                  <Badge status={invoice.status} size="sm" />
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 text-xs sm:text-sm">
              <div className="text-zinc-500">
                <span className="text-zinc-400">Issue Date:</span>{" "}
                <span className="font-medium text-zinc-900">{formatDate(invoice.issueDate)}</span>
              </div>
              {invoice.dueDate && (
                <div className="text-zinc-500">
                  <span className="text-zinc-400">Due Date:</span>{" "}
                  <span className="font-medium text-zinc-900">{formatDate(invoice.dueDate)}</span>
                </div>
              )}
              <div className="text-zinc-500">
                <span className="text-zinc-400">Currency:</span>{" "}
                <span className="font-mono font-medium text-zinc-900">{invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Sender & Customer details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-zinc-100 text-xs sm:text-sm">
            <div>
              <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                From (Issuer)
              </h2>
              <div className="font-bold text-zinc-950 text-sm sm:text-base">
                {invoice.sender.name}
              </div>
              {invoice.sender.email && (
                <div className="text-zinc-600 mt-1">{invoice.sender.email}</div>
              )}
              {invoice.sender.phone && (
                <div className="text-zinc-600 mt-0.5">{invoice.sender.phone}</div>
              )}
              {invoice.sender.address && (
                <div className="text-zinc-500 mt-1.5 whitespace-pre-line leading-relaxed">
                  {invoice.sender.address}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Billed To (Client)
              </h2>
              <div className="font-bold text-zinc-950 text-sm sm:text-base">
                {invoice.customer.name}
              </div>
              {invoice.customer.email && (
                <div className="text-zinc-600 mt-1">{invoice.customer.email}</div>
              )}
              {invoice.customer.phone && (
                <div className="text-zinc-600 mt-0.5">{invoice.customer.phone}</div>
              )}
              {invoice.customer.address && (
                <div className="text-zinc-500 mt-1.5 whitespace-pre-line leading-relaxed">
                  {invoice.customer.address}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-8 border-b border-zinc-100">
            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    <th className="pb-3 text-zinc-500">Description</th>
                    <th className="pb-3 text-center text-zinc-500 w-16 sm:w-20">Qty</th>
                    <th className="pb-3 text-right text-zinc-500 w-28 sm:w-36">Unit Price</th>
                    <th className="pb-3 text-right text-zinc-500 w-28 sm:w-36">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 text-zinc-900 font-medium pr-4">
                        {item.description}
                      </td>
                      <td className="py-3.5 text-center text-zinc-600 font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 text-right text-zinc-600 font-mono">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </td>
                      <td className="py-3.5 text-right font-semibold font-mono text-zinc-950">
                        {formatCurrency(item.lineTotal, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subtotal & Total */}
          <div className="py-6 flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-zinc-800">
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold text-zinc-950 pt-3 border-t border-zinc-200">
                <span>Total Due</span>
                <span className="font-mono text-zinc-950">
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Instructions & Notes */}
          {(invoice.paymentInstructions || invoice.notes) && (
            <div className="pt-8 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-zinc-600">
              {invoice.paymentInstructions && (
                <div className="bg-zinc-50/60 p-4 rounded-lg border border-zinc-100">
                  <h3 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px] mb-1.5">
                    Payment Instructions
                  </h3>
                  <p className="whitespace-pre-line leading-relaxed text-zinc-600">
                    {invoice.paymentInstructions}
                  </p>
                </div>
              )}
              {invoice.notes && (
                <div className="bg-zinc-50/60 p-4 rounded-lg border border-zinc-100">
                  <h3 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px] mb-1.5">
                    Notes / Terms
                  </h3>
                  <p className="whitespace-pre-line leading-relaxed text-zinc-600">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
