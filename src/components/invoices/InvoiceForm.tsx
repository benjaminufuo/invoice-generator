"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Customer, Invoice, SupportedCurrency, InvoiceStatus } from "@/types";
import { calculateLineTotal, calculateSubtotal, formatCurrency } from "@/lib/calculations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

interface InvoiceFormProps {
  initialInvoice?: Invoice;
  isEdit?: boolean;
}

interface FormLineItem {
  id: string;
  description: string;
  quantity: number | string;
  unitPrice: number | string;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialInvoice,
  isEdit = false,
}) => {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialInvoice?.invoiceNumber || ""
  );
  const [issueDate, setIssueDate] = useState(
    initialInvoice?.issueDate
      ? initialInvoice.issueDate.split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    initialInvoice?.dueDate ? initialInvoice.dueDate.split("T")[0] : ""
  );
  const [currency, setCurrency] = useState<SupportedCurrency>(
    initialInvoice?.currency || "NGN"
  );
  const [status, setStatus] = useState<InvoiceStatus>(
    initialInvoice?.status || "draft"
  );

  // Sender details
  const [senderName, setSenderName] = useState(
    initialInvoice?.sender.name || ""
  );
  const [senderEmail, setSenderEmail] = useState(
    initialInvoice?.sender.email || ""
  );
  const [senderPhone, setSenderPhone] = useState(
    initialInvoice?.sender.phone || ""
  );
  const [senderAddress, setSenderAddress] = useState(
    initialInvoice?.sender.address || ""
  );

  // Customer details
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialInvoice?.customer.customerId || ""
  );
  const [customerName, setCustomerName] = useState(
    initialInvoice?.customer.name || ""
  );
  const [customerEmail, setCustomerEmail] = useState(
    initialInvoice?.customer.email || ""
  );
  const [customerPhone, setCustomerPhone] = useState(
    initialInvoice?.customer.phone || ""
  );
  const [customerAddress, setCustomerAddress] = useState(
    initialInvoice?.customer.address || ""
  );

  // Line items
  const [items, setItems] = useState<FormLineItem[]>(
    initialInvoice?.items && initialInvoice.items.length > 0
      ? initialInvoice.items.map((item, idx) => ({
          id: `item-${idx}`,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      : [
          {
            id: "item-1",
            description: "",
            quantity: 1,
            unitPrice: 0,
          },
        ]
  );

  // Notes & Payment instructions
  const [notes, setNotes] = useState(initialInvoice?.notes || "");
  const [paymentInstructions, setPaymentInstructions] = useState(
    initialInvoice?.paymentInstructions || ""
  );

  // Load existing customers and fetch next invoice number if new
  useEffect(() => {
    async function loadInitialData() {
      try {
        const custRes = await fetch("/api/customers");
        if (custRes.ok) {
          const custData = await custRes.json();
          setCustomers(custData.data || []);
        }

        if (!isEdit && !invoiceNumber) {
          const numRes = await fetch("/api/invoices/next-number");
          if (numRes.ok) {
            const numData = await numRes.json();
            if (numData.data?.nextInvoiceNumber) {
              setInvoiceNumber(numData.data.nextInvoiceNumber);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadInitialData();
  }, [isEdit, invoiceNumber]);

  // When customer is selected from dropdown, populate details
  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    if (!id) return;
    const found = customers.find((c) => c._id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerEmail(found.email || "");
      setCustomerPhone(found.phone || "");
      setCustomerAddress(found.address || "");
    }
  };

  // Line item manipulation
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (
    id: string,
    field: "description" | "quantity" | "unitPrice",
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  // Live calculations
  const calculatedItems = items.map((i) => {
    const q = Number(i.quantity) || 0;
    const p = Number(i.unitPrice) || 0;
    return {
      ...i,
      lineTotal: calculateLineTotal(q, p),
    };
  });

  const subtotal = calculateSubtotal(
    calculatedItems.map((i) => ({
      quantity: Number(i.quantity) || 0,
      unitPrice: Number(i.unitPrice) || 0,
    }))
  );
  const total = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    if (!invoiceNumber.trim()) {
      setError("Invoice number is required.");
      return;
    }
    if (!senderName.trim()) {
      setError("Sender name is required.");
      return;
    }
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (items.length === 0 || !items.some((i) => i.description.trim())) {
      setError("At least one line item with a description is required.");
      return;
    }

    for (const item of items) {
      if (Number(item.quantity) <= 0) {
        setError(`Quantity for "${item.description || "item"}" must be greater than 0.`);
        return;
      }
      if (Number(item.unitPrice) < 0) {
        setError(`Unit price for "${item.description || "item"}" cannot be negative.`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload = {
        invoiceNumber: invoiceNumber.trim(),
        issueDate,
        dueDate: dueDate || undefined,
        currency,
        status,
        sender: {
          name: senderName.trim(),
          email: senderEmail.trim() || undefined,
          phone: senderPhone.trim() || undefined,
          address: senderAddress.trim() || undefined,
        },
        customer: {
          customerId: selectedCustomerId || undefined,
          name: customerName.trim(),
          email: customerEmail.trim() || undefined,
          phone: customerPhone.trim() || undefined,
          address: customerAddress.trim() || undefined,
        },
        items: items.map((i) => ({
          description: i.description.trim(),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
        notes: notes.trim() || undefined,
        paymentInstructions: paymentInstructions.trim() || undefined,
      };

      const url = isEdit
        ? `/api/invoices/${initialInvoice?._id}`
        : "/api/invoices";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save invoice.");
        setIsLoading(false);
        return;
      }

      router.push(`/invoices/${data.data._id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while saving the invoice.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200/80 rounded-xl text-xs sm:text-sm text-red-700 font-medium flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Top Invoice Metadata Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4 tracking-tight">
          Invoice Parameters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <Input
            label="Invoice Number"
            required
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="INV-2026-0001"
            disabled={isLoading}
          />

          <Input
            label="Issue Date"
            type="date"
            required
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            disabled={isLoading}
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isLoading}
          />

          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
            disabled={isLoading}
            options={[
              { value: "NGN", label: "NGN (₦) — Nigerian Naira" },
              { value: "USD", label: "USD ($) — US Dollar" },
            ]}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
            disabled={isLoading}
            options={[
              { value: "draft", label: "Draft" },
              { value: "sent", label: "Sent" },
              { value: "paid", label: "Paid" },
            ]}
          />
        </div>
      </div>

      {/* Sender and Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sender Box */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
            From (Issuer Details)
          </h2>
          <Input
            label="Your Business / Individual Name"
            required
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Jane Doe Design Studio"
            disabled={isLoading}
          />
          <Input
            label="Email Address"
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="contact@yourbusiness.com"
            disabled={isLoading}
          />
          <Input
            label="Phone Number"
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
            placeholder="+234 801 234 5678"
            disabled={isLoading}
          />
          <Textarea
            label="Business Address"
            value={senderAddress}
            onChange={(e) => setSenderAddress(e.target.value)}
            placeholder="Victoria Island, Lagos, Nigeria"
            rows={2}
            disabled={isLoading}
          />
        </div>

        {/* Customer Box */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
              Billed To (Customer Details)
            </h2>
            {customers.length > 0 && (
              <div className="w-full sm:w-52">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full text-xs py-1.5 px-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  disabled={isLoading}
                >
                  <option value="">-- Choose saved client --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Input
            label="Customer Name / Company"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Acme Corporation"
            disabled={isLoading}
          />
          <Input
            label="Email Address"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="billing@acmecorp.com"
            disabled={isLoading}
          />
          <Input
            label="Phone Number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            disabled={isLoading}
          />
          <Textarea
            label="Billing Address"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="123 Corporate Blvd, Suite 400"
            rows={2}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Line Items Section */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
            Line Items
          </h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addItem}
            disabled={isLoading}
          >
            + Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const lineTotal = calculateLineTotal(
              Number(item.quantity) || 0,
              Number(item.unitPrice) || 0
            );

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 bg-zinc-50/70 rounded-lg border border-zinc-200/70"
              >
                <div className="flex-1 w-full sm:w-auto">
                  <Input
                    placeholder="Description of service or deliverable"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, "description", e.target.value)
                    }
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0.01"
                      step="any"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", e.target.value)
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="w-32 sm:w-36">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, "unitPrice", e.target.value)
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="w-28 text-right font-mono font-medium text-zinc-900 text-xs sm:text-sm px-1 shrink-0">
                    {formatCurrency(lineTotal, currency)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1 || isLoading}
                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-600 disabled:opacity-25 transition-colors shrink-0"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Calculation Totals */}
        <div className="pt-4 border-t border-zinc-100 flex justify-end">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-zinc-500">
              <span>Subtotal:</span>
              <span className="font-mono text-zinc-800">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm sm:text-base font-bold text-zinc-950 pt-2.5 border-t border-zinc-200">
              <span>Total ({currency}):</span>
              <span className="font-mono text-indigo-600">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes & Payment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <h2 className="text-sm font-semibold text-zinc-900 mb-3 tracking-tight">
            Payment Instructions
          </h2>
          <Textarea
            value={paymentInstructions}
            onChange={(e) => setPaymentInstructions(e.target.value)}
            placeholder="Bank Name: Example Bank&#10;Account Name: Your Business&#10;Account Number: 0123456789"
            rows={3}
            helperText="Include bank account or payment details to be printed on the invoice document."
            disabled={isLoading}
          />
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <h2 className="text-sm font-semibold text-zinc-900 mb-3 tracking-tight">
            Notes / Terms
          </h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Thank you for your business! Payment is due within 14 calendar days."
            rows={3}
            helperText="Optional notes or terms that will appear at the bottom of the invoice document."
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200/80">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
          {isEdit ? "Update Invoice" : "Save Invoice"}
        </Button>
      </div>
    </form>
  );
};
