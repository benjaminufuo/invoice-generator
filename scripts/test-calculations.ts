import {
  calculateLineTotal,
  calculateSubtotal,
  formatCurrency,
  formatDate,
} from "../src/lib/calculations";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("\n--- RUNNING INVOICE CALCULATION TESTS ---\n");

// Test 1: Single line item
const item1 = calculateLineTotal(2, 25000);
assert(item1 === 50000, `Single item (2 * 25,000) should be 50,000, got ${item1}`);

// Test 2: Multiple line items from PRD test plan (2 * 25,000 + 1 * 10,000 = 60,000)
const items = [
  { quantity: 2, unitPrice: 25000 },
  { quantity: 1, unitPrice: 10000 },
];
const subtotal = calculateSubtotal(items);
assert(subtotal === 60000, `Subtotal should be 60,000, got ${subtotal}`);

// Test 3: Decimal floating point precision (0.1 + 0.2 precision problem)
// 3 items at 0.10, 0.20, 0.30
const decimalTotal = calculateSubtotal([
  { quantity: 1, unitPrice: 0.1 },
  { quantity: 1, unitPrice: 0.2 },
]);
assert(decimalTotal === 0.3, `Decimal precision (0.1 + 0.2) should be 0.3, got ${decimalTotal}`);

// Test 4: Fractional quantities
const fractionalItem = calculateLineTotal(1.5, 100);
assert(fractionalItem === 150, `Fractional quantity (1.5 * 100) should be 150, got ${fractionalItem}`);

// Test 5: Negative or invalid values should yield 0
assert(calculateLineTotal(-1, 50) === 0, "Negative quantity should return 0");
assert(calculateLineTotal(5, -10) === 0, "Negative unit price should return 0");
assert(calculateLineTotal(0, 50) === 0, "Zero quantity should return 0");
assert(calculateLineTotal(NaN, 50) === 0, "NaN quantity should return 0");

// Test 6: Currency formatting NGN
const formattedNgn = formatCurrency(60000, "NGN");
assert(formattedNgn === "₦60,000.00", `NGN format should be ₦60,000.00, got ${formattedNgn}`);

// Test 7: Currency formatting USD
const formattedUsd = formatCurrency(1250.5, "USD");
assert(formattedUsd === "$1,250.50", `USD format should be $1,250.50, got ${formattedUsd}`);

// Test 8: Date formatting
const formattedDate = formatDate("2026-10-28");
assert(formattedDate.includes("2026"), `Formatted date should contain 2026, got ${formattedDate}`);

console.log("\n🎉 ALL FINANCIAL & CALCULATION TESTS PASSED!\n");
