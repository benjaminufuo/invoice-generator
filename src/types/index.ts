// =============================================
// Core Types — Invoice Generator
// =============================================

export type SupportedCurrency = "NGN" | "USD";

export interface InvoiceSender {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface InvoiceCustomer {
  customerId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid";

export interface Invoice {
  _id: string;
  ownerId: string;
  invoiceNumber: string;
  issueDate: string; // ISO string
  dueDate?: string; // ISO string
  currency: SupportedCurrency;
  sender: InvoiceSender;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  notes?: string;
  paymentInstructions?: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  ownerId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// API response shapes
export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

// Form types (without server-computed fields)
export interface InvoiceFormData {
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  currency: SupportedCurrency;
  sender: InvoiceSender;
  customer: InvoiceCustomer;
  items: Array<{
    description: string;
    quantity: number | string;
    unitPrice: number | string;
  }>;
  notes?: string;
  paymentInstructions?: string;
  status: InvoiceStatus;
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}
