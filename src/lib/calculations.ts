import { SupportedCurrency } from "@/types";

/**
 * Calculates line total with 2-decimal monetary precision.
 * Rounds to integer cents/kobo to eliminate floating-point arithmetic errors.
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  if (isNaN(quantity) || isNaN(unitPrice) || quantity <= 0 || unitPrice < 0) {
    return 0;
  }
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Calculates subtotal across all line items with 2-decimal precision.
 */
export function calculateSubtotal(items: Array<{ quantity: number; unitPrice: number }>): number {
  const sumInCents = items.reduce((sum, item) => {
    const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
    return sum + Math.round(lineTotal * 100);
  }, 0);

  return Math.round(sumInCents) / 100;
}

/**
 * Formats a currency amount with the appropriate symbol and grouping.
 */
export function formatCurrency(amount: number, currency: SupportedCurrency): string {
  const symbol = currency === "NGN" ? "₦" : "$";
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

/**
 * Formats date for display (e.g., "Oct 28, 2026")
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
