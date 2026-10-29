import { z } from "zod";

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0").max(1000000, "Quantity is too large"),
  unitPrice: z.coerce.number().min(0, "Unit price must be non-negative").max(1000000000, "Unit price is too large"),
});

export const invoiceSenderSchema = z.object({
  name: z.string().min(1, "Sender name is required").max(100),
  email: z.string().email("Invalid sender email").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(250).optional().or(z.literal("")),
});

export const invoiceCustomerSchema = z.object({
  customerId: z.string().optional().or(z.literal("")),
  name: z.string().min(1, "Customer name is required").max(100),
  email: z.string().email("Invalid customer email").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(250).optional().or(z.literal("")),
});

export const invoiceCreateSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required").max(50),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().optional().or(z.literal("")),
  currency: z.enum(["NGN", "USD"]),
  sender: invoiceSenderSchema,
  customer: invoiceCustomerSchema,
  items: z.array(lineItemSchema).min(1, "At least one line item is required"),
  notes: z.string().max(1000).optional().or(z.literal("")),
  paymentInstructions: z.string().max(1000).optional().or(z.literal("")),
  status: z.enum(["draft", "sent", "paid"]).default("draft"),
});

export const invoiceUpdateSchema = invoiceCreateSchema.partial();

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(250).optional().or(z.literal("")),
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
