import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Create New Invoice
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in your invoice details and line items below.
        </p>
      </div>

      <InvoiceForm />
    </div>
  );
}
