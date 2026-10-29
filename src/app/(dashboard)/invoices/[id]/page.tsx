"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Invoice, InvoiceStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Printer, Pencil, Trash2, ArrowLeft } from "lucide-react";

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadInvoice = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) {
        setError("Invoice not found or you are not authorized to view it.");
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      setInvoice(data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (!invoice || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/invoices/${invoice._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoice(data.data);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${invoice._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/invoices");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-400">Loading invoice details...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6 bg-red-50 border border-red-200/80 rounded-xl text-center max-w-md mx-auto">
        <p className="text-xs sm:text-sm text-red-700 font-semibold mb-3">{error || "Invoice not found"}</p>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 hover:text-zinc-700 underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to all invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Action Bar (hidden during printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print border-b border-zinc-200/60 pb-5">
        <div className="flex items-center space-x-3">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Invoices</span>
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="font-mono font-semibold text-zinc-900 text-sm">
            {invoice.invoiceNumber}
          </span>
          <Badge status={invoice.status} size="sm" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <div className="relative">
            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
              disabled={isUpdatingStatus}
              className="text-xs bg-white border border-zinc-300 text-zinc-800 py-1.5 pl-2.5 pr-7 rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors cursor-pointer disabled:opacity-50 appearance-none"
            >
              <option value="draft">Mark Draft</option>
              <option value="sent">Mark Sent</option>
              <option value="paid">Mark Paid</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </Button>

          <Link
            href={`/invoices/${invoice._id}/edit`}
            className="inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors focus:outline-none px-3 py-1.5 text-xs bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 shadow-2xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Invoice Document Paper */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] p-6 sm:p-10 md:p-12 print-page">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-zinc-100 gap-6">
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        description={`Are you sure you want to permanently delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`}
        confirmLabel="Delete Invoice"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}