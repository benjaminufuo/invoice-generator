"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleDelete = async () => {
    if (!deletingInvoice) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${deletingInvoice._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeletingInvoice(null);
        loadInvoices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === "all" || inv.status === statusFilter;

    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer?.name &&
        inv.customer.name.toLowerCase().includes(search.toLowerCase())) ||
      (inv.customer?.email &&
        inv.customer.email.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
            Invoices
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Manage, export, and track your invoice records.
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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search invoice # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex rounded-lg border border-zinc-200/90 bg-white p-1 text-xs font-medium shadow-2xs self-start sm:self-auto">
          {["all", "draft", "sent", "paid"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md capitalize transition-all min-h-[32px] ${
                statusFilter === status
                  ? "bg-zinc-900 text-white font-medium shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400">Loading your invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={
                search || statusFilter !== "all"
                  ? "No matching invoices found"
                  : "No invoices created yet"
              }
              description={
                search || statusFilter !== "all"
                  ? "Try resetting your filter or search query."
                  : "Create your first professional invoice to send to your clients."
              }
              actionLabel={
                search || statusFilter !== "all"
                  ? undefined
                  : "Create Invoice"
              }
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
                  <th className="px-5 py-3 hidden sm:table-cell">Issue Date</th>
                  <th className="px-5 py-3 hidden md:table-cell">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredInvoices.map((inv) => (
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
                      {inv.customer?.name || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 hidden sm:table-cell text-xs">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 hidden md:table-cell text-xs">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={inv.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-medium text-zinc-900">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <Link
                        href={`/invoices/${inv._id}`}
                        className="text-xs font-medium text-zinc-700 hover:text-zinc-950 px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors inline-block"
                      >
                        View
                      </Link>
                      <Link
                        href={`/invoices/${inv._id}/edit`}
                        className="text-xs font-medium text-zinc-700 hover:text-zinc-950 px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors inline-block"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeletingInvoice(inv)}
                        className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors inline-block"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deletingInvoice}
        onClose={() => setDeletingInvoice(null)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        description={`Are you sure you want to permanently delete invoice ${deletingInvoice?.invoiceNumber}? This action cannot be undone.`}
        confirmLabel="Delete Invoice"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
