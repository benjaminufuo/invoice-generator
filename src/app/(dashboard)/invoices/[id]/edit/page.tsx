"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Invoice } from "@/types";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export default function EditInvoicePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      if (!id) return;
      try {
        const res = await fetch(`/api/invoices/${id}`);
        if (!res.ok) {
          setError("Invoice not found or access denied.");
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
    }
    loadInvoice();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-400">Loading invoice editor...</p>
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
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/invoices/${invoice._id}`}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to preview
          </Link>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
          Edit Invoice <span className="font-mono text-zinc-600">#{invoice.invoiceNumber}</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Modify invoice details, customer information, line items, and terms.
        </p>
      </div>

      <InvoiceForm initialInvoice={invoice} isEdit={true} />
    </div>
  );
}