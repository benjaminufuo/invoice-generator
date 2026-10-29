"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DashboardOverviewPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await fetch("/api/invoices");
        if (!res.ok) {
          throw new Error("Failed to load invoice records");
        }
        const data = await res.json();
        setInvoices(data.data || []);
      } catch (err: unknown) {
        console.error(err);
        setError("Unable to load invoices. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    }
    loadInvoices();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-400">Loading your metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200/80 rounded-xl text-xs sm:text-sm text-red-700 font-medium">
        {error}
      </div>
    );
  }

  // Calculate real summaries from user data
  const totalInvoices = invoices.length;
  const draftCount = invoices.filter((i) => i.status === "draft").length;
  const sentCount = invoices.filter((i) => i.status === "sent").length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;

  const totalNgn = invoices
    .filter((i) => i.currency === "NGN")
    .reduce((sum, i) => sum + (i.total || 0), 0);

  const totalUsd = invoices
    .filter((i) => i.currency === "USD")
    .reduce((sum, i) => sum + (i.total || 0), 0);

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl">
      {/* Page Heading & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Overview of your invoice records and real-time revenue summary.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center justify-center min-h-[38px] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-all shadow-2xs border border-zinc-800 self-start sm:self-auto active:scale-[0.99]"
        >
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Invoice
        </Link>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4.5 sm:p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            Total Invoices
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-950 tracking-tight font-mono">
            {totalInvoices}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {paidCount} paid • {sentCount} sent • {draftCount} draft
          </div>
        </div>

        <div className="bg-white p-4.5 sm:p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            Invoiced (NGN)
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-950 tracking-tight font-mono truncate">
            {formatCurrency(totalNgn, "NGN")}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {invoices.filter((i) => i.currency === "NGN").length} NGN records
          </div>
        </div>

        <div className="bg-white p-4.5 sm:p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            Invoiced (USD)
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-950 tracking-tight font-mono truncate">
            {formatCurrency(totalUsd, "USD")}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {invoices.filter((i) => i.currency === "USD").length} USD records
          </div>
        </div>

        <div className="bg-white p-4.5 sm:p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            Collection Rate
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 tracking-tight font-mono">
            {totalInvoices > 0
              ? `${Math.round((paidCount / totalInvoices) * 100)}%`
              : "0%"}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {paidCount} marked as paid
          </div>
        </div>
      </div>

      {/* Recent Invoices Section */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
            Recent Invoices
          </h2>
          {invoices.length > 0 && (
            <Link
              href="/invoices"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all invoices &rarr;
            </Link>
          )}
        </div>

        {recentInvoices.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No invoices created yet"
              description="Get started by creating your first professional invoice. It takes less than a minute."
              actionLabel="Create Invoice"
              actionHref="/invoices/new"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-100 text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50/75 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Invoice #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3 hidden md:table-cell">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-zinc-900 font-mono text-xs">
                      <Link
                        href={`/invoices/${inv._id}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-800 font-medium">
                      {inv.customer?.name || "No Customer"}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 hidden md:table-cell text-xs">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={inv.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-medium text-zinc-900">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/invoices/${inv._id}`}
                        className="text-xs font-medium text-zinc-600 hover:text-zinc-950 px-2 py-1 rounded-md hover:bg-zinc-100"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
