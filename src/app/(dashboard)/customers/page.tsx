"use client";

import React, { useEffect, useState } from "react";
import { Customer } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const loadCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setEmail(c.email || "");
    setPhone(c.phone || "");
    setAddress(c.address || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Customer name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      };

      const url = editingCustomer
        ? `/api/customers/${editingCustomer._id}`
        : "/api/customers";
      const method = editingCustomer ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to save customer");
        setIsSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      loadCustomers();
    } catch (err) {
      console.error(err);
      setFormError("An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${isDeleting._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleting(null);
        loadCustomers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
            Customers
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Manage your client contacts for fast invoice auto-completion.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          size="sm"
          className="self-start sm:self-auto min-h-[38px]"
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
          Add Customer
        </Button>
      </div>

      {/* Search Input */}
      <div className="w-full sm:w-80">
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={search ? "No matching customers" : "No customers saved yet"}
              description={
                search
                  ? "Try adjusting your search criteria."
                  : "Save your frequent clients to quickly prefill their billing details on future invoices."
              }
              actionLabel={search ? undefined : "Add First Customer"}
              onAction={openCreateModal}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-100 text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50/75 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Customer Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3 hidden sm:table-cell">Phone</th>
                  <th className="px-5 py-3 hidden md:table-cell">Address</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCustomers.map((c) => (
                  <tr key={c._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-zinc-900">
                      {c.name}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {c.email || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 hidden sm:table-cell">
                      {c.phone || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 hidden md:table-cell truncate max-w-xs text-xs">
                      {c.address || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(c)}
                        className="text-xs font-medium text-zinc-700 hover:text-zinc-950 px-2.5 py-1 rounded-md hover:bg-zinc-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setIsDeleting(c)}
                        className="text-xs font-medium text-red-600 hover:text-red-700 px-2.5 py-1 rounded-md hover:bg-red-50 transition-colors"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-zinc-200/90 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                  {formError}
                </div>
              )}

              <Input
                label="Customer / Company Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corporation or John Smith"
                disabled={isSubmitting}
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@example.com"
                disabled={isSubmitting}
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                disabled={isSubmitting}
              />

              <Textarea
                label="Billing Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Business Way, Lagos, Nigeria"
                rows={2}
                disabled={isSubmitting}
              />

              <div className="pt-2 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  {editingCustomer ? "Save Changes" : "Create Customer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete ${isDeleting?.name}? Any existing invoices will preserve their customer snapshots.`}
        confirmLabel="Delete Customer"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
