# TEST_PLAN.md — Invoice Generator Testing Strategy

## 1. Purpose

This document defines the testing strategy for the Invoice Generator MVP.

The goal is to verify that each feature works as intended, that calculations are accurate, that user data remains private, and that the application is stable before deployment.

Testing must be performed throughout development, not only when the application is complete.

## 2. Testing Principles

- Test each feature as it is implemented.
- Prioritize critical user journeys and security-sensitive operations.
- Test expected behavior, invalid inputs, and failure scenarios.
- Verify server-side validation independently of client-side validation.
- Use test data rather than real customer information.
- Never claim a test passed unless it was actually executed.
- Document failing tests and unresolved issues.
- Do not weaken tests simply to make the application pass.
- Use the testing tools already configured in the repository where practical.

## 3. Testing Levels

### Unit testing

Test isolated functions and calculations.

Examples:
- Invoice subtotal calculations.
- Line-item totals.
- Currency formatting.
- Invoice-number generation.
- Input validation.
- Date validation.

### Integration testing

Test interactions between application components and services.

Examples:
- Authentication with the database.
- Customer creation and retrieval.
- Invoice persistence.
- Protected API endpoints.
- PDF generation using saved invoice data.

### End-to-end testing

Test complete user journeys through the interface.

Examples:
- Registering and signing in.
- Creating a customer.
- Creating an invoice for that customer.
- Editing and saving an invoice.
- Downloading the invoice as a PDF.
- Signing out and signing back in to confirm persistence.

### Manual testing

Use manual checks for visual quality, responsive behavior, document layout, accessibility, and workflows that automated tests do not adequately cover.

## 4. Testing Environment

- Use a dedicated test database or isolated test data.
- Keep test credentials and environment variables separate from production.
- Do not run destructive tests against production data.
- Mock external services where appropriate.
- Clean up test records after tests when safe and practical.
- Never commit real credentials or secrets to the repository.

The testing framework should be selected based on the existing repository and documented dependencies. Do not install multiple competing testing frameworks without a clear reason.

## 5. Authentication Tests

| Test | Expected result |
|---|---|
| Register with valid details | Account is created successfully. |
| Register with invalid details | Validation errors are displayed. |
| Register with an existing email | Duplicate registration is rejected appropriately. |
| Sign in with valid credentials | User is authenticated. |
| Sign in with incorrect credentials | Access is denied with a suitable message. |
| Access a protected route while signed out | User is redirected or receives an appropriate unauthorized response. |
| Sign out | The session is invalidated according to the authentication implementation. |
| Access protected data after signing out | The request is rejected. |
| Refresh an authenticated page | Authentication state is handled correctly. |

Verify that authentication behavior matches the installed Better Auth version and the application's configuration.

## 6. Customer Management Tests

| Test | Expected result |
|---|---|
| Create a customer with valid details | Customer is saved and associated with the current user. |
| Submit a customer with missing required fields | The request is rejected with useful validation feedback. |
| Edit an existing customer | Changes are persisted correctly. |
| Delete a customer | The agreed deletion behavior is followed. |
| Refresh the customer list | Saved customers remain available. |
| Request a nonexistent customer | A safe not-found response is returned. |
| User A requests User B's customer | Access is denied without exposing private data. |
| User A attempts to edit or delete User B's customer | The operation is rejected. |
| Submit malformed or unexpected fields | The server validates the input and does not permit protected fields to be overwritten. |

## 7. Invoice Calculation Tests

Invoice calculations are business-critical. They must be tested independently of the user interface.

Assume an invoice contains the following line items:

| Description | Quantity | Unit price | Line total |
|---|---:|---:|---:|
| Web design | 2 | 25,000.00 | 50,000.00 |
| Hosting setup | 1 | 10,000.00 | 10,000.00 |
| **Subtotal** | | | **60,000.00** |

Expected result: the subtotal and final total are both 60,000.00 when no approved taxes or discounts apply.

### Required calculation tests

- [ ] A single line item calculates correctly.
- [ ] Multiple line items calculate correctly.
- [ ] Changing a quantity updates the relevant line total.
- [ ] Changing a unit price updates the relevant line total.
- [ ] Removing a line item updates the subtotal.
- [ ] Decimal quantities or prices are handled according to the approved input rules.
- [ ] Zero quantity is handled according to the validation rules.
- [ ] Negative quantities and prices are rejected unless explicitly supported.
- [ ] Missing or non-numeric values are rejected.
- [ ] Very large values are validated against reasonable limits.
- [ ] Rounding behavior is consistent.
- [ ] The server recalculates totals rather than trusting client-submitted totals.
- [ ] Editing an invoice produces consistent updated totals.

### Calculation rules

The basic calculation is:

`Line total = Quantity × Unit price`

`Subtotal = Sum of all line totals`

For the MVP, the final total equals the subtotal unless additional rules are explicitly approved.

Use a documented monetary precision strategy. Do not rely on inconsistent floating-point calculations for financial amounts.

## 8. Currency Tests

The application supports multiple invoice currencies, including NGN and USD.

- [ ] The default currency is applied correctly.
- [ ] The user can choose another supported currency.
- [ ] The selected currency is saved with the invoice.
- [ ] Currency symbols and amounts display correctly in the invoice preview.
- [ ] Currency formatting is correct in downloaded PDFs.
- [ ] Editing an invoice preserves its selected currency unless changed by the user.
- [ ] One invoice cannot accidentally mix currencies across its line items.
- [ ] Changing the currency does not automatically convert monetary amounts.
- [ ] Unsupported currency values are rejected.
- [ ] Amounts remain consistent between the dashboard, invoice details, and PDF.

Do not introduce exchange-rate calculations as part of these tests.

## 9. Invoice Management Tests

| Test | Expected result |
|---|---|
| Create an invoice with valid data | Invoice is saved successfully. |
| Create an invoice without required fields | Validation prevents invalid submission. |
| Add multiple line items | Each item appears correctly in the saved invoice. |
| Select a customer | The correct customer information is associated with the invoice. |
| Set invoice and due dates | Dates are saved and displayed correctly. |
| Generate an invoice number | Number follows the approved numbering strategy. |
| Edit an invoice | Changes are saved and totals are recalculated. |
| Delete an invoice | The agreed deletion behavior is applied. |
| View an existing invoice | Correct saved data is displayed. |
| Refresh the invoice list | Saved invoices remain available. |
| Request an invoice that does not exist | A safe not-found response is returned. |
| User A requests User B's invoice | Access is denied. |
| User A edits or deletes User B's invoice | The operation is rejected. |
| User A requests User B's invoice PDF | The PDF is not disclosed. |

## 10. Invoice Numbering Tests

The numbering strategy must be approved before these tests are finalized.

Once the strategy is selected, verify that:

- [ ] Invoice numbers follow the agreed format.
- [ ] Numbers do not conflict where uniqueness is required.
- [ ] Concurrent invoice creation does not produce duplicate numbers.
- [ ] Failed invoice creation does not leave inconsistent numbering state.
- [ ] Editing an invoice does not unexpectedly change its number.
- [ ] Invoice numbering remains correct across application restarts.

Do not assume a numbering format that has not been approved.

## 11. PDF Export Tests

- [ ] PDF generation works for a valid saved invoice.
- [ ] The PDF contains the issuer's details.
- [ ] The PDF contains the customer's details.
- [ ] Invoice number and dates appear correctly.
- [ ] Every line item appears with the correct quantity and price.
- [ ] Subtotal and final total match the saved invoice calculations.
- [ ] Currency symbols and amounts display correctly.
- [ ] Long descriptions wrap without hiding information.
- [ ] Invoices with many line items paginate correctly.
- [ ] Text and totals remain readable.
- [ ] Optional logo behavior works if logo uploads are included.
- [ ] Missing optional information does not break PDF generation.
- [ ] Unauthorized users cannot export another user's invoice.
- [ ] Invalid or nonexistent invoice IDs produce a safe response.

The downloaded PDF must be consistent with the saved invoice data and the invoice preview.

## 12. Dashboard Tests

- [ ] The dashboard loads for an authenticated user.
- [ ] Summary figures use the current user's saved invoices.
- [ ] Empty accounts display a useful empty state.
- [ ] Invoice counts and totals reflect the underlying data.
- [ ] Loading states appear when appropriate.
- [ ] Errors are displayed clearly when data cannot be loaded.
- [ ] Navigation links lead to the correct pages.
- [ ] Mobile layouts remain usable.
- [ ] Dashboard information does not expose another user's data.

Do not display invented figures or hard-coded sample statistics in production.

## 13. Validation and Error Handling Tests

Test both client-side feedback and server-side enforcement.

- [ ] Required fields are validated.
- [ ] Invalid email formats are rejected where email is required.
- [ ] Invalid dates are rejected.
- [ ] Unsupported currency codes are rejected.
- [ ] Invalid line items are rejected.
- [ ] Malformed request bodies are handled safely.
- [ ] Invalid identifiers do not crash the application.
- [ ] Database failures produce controlled error responses.
- [ ] Authentication failures are handled appropriately.
- [ ] Users receive useful messages without seeing stack traces or secrets.
- [ ] Duplicate submissions do not create unintended duplicate records where prevention is required.

## 14. Security Tests

- [ ] Every protected server operation checks authentication.
- [ ] Every customer and invoice operation enforces ownership.
- [ ] Changing an ID in a request does not expose another user's record.
- [ ] Client-submitted ownership fields cannot override the authenticated user.
- [ ] Client-submitted totals cannot bypass server-side calculations.
- [ ] Secrets are not included in client-side bundles or API responses.
- [ ] Database connection strings are not exposed.
- [ ] Uploaded files are validated if uploads are supported.
- [ ] Error messages do not disclose sensitive implementation details.
- [ ] Production data is not used in destructive automated tests.

Refer to `docs/SECURITY.md` for the full security requirements.

## 15. Responsive and Accessibility Tests

Test the interface at representative mobile, tablet, and desktop viewport sizes.

- [ ] Navigation remains usable at smaller widths.
- [ ] Forms fit within the available screen width.
- [ ] Invoice tables remain readable or provide an appropriate mobile layout.
- [ ] Dialogs fit on smaller screens.
- [ ] Buttons and form controls are keyboard accessible.
- [ ] Inputs have appropriate labels.
- [ ] Focus indicators are visible.
- [ ] Text has sufficient contrast.
- [ ] Validation messages are understandable.
- [ ] Important information is not communicated by color alone.
- [ ] Reduced-motion preferences are respected where animation is used.

## 16. End-to-End User Journey

At minimum, verify the following complete workflow:

1. A new user registers.
2. The user signs in.
3. The user creates a customer.
4. The user creates an invoice for that customer.
5. The user adds multiple line items.
6. The user selects an invoice currency.
7. The application calculates and displays the correct subtotal and final total.
8. The user saves the invoice.
9. The invoice appears in the dashboard and invoice list.
10. The user opens and edits the invoice.
11. The user downloads the invoice as a PDF.
12. The user signs out and signs back in.
13. The saved customer and invoice are still available.
14. A separate user cannot access the first user's invoice or customer records.

## 17. Release Checks

Before approving a release:

- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Critical end-to-end journeys pass.
- [ ] TypeScript checks pass.
- [ ] Linting passes.
- [ ] The production build succeeds.
- [ ] Security and ownership tests pass.
- [ ] PDF export has been verified.
- [ ] Responsive layouts have been reviewed.
- [ ] Environment variables are configured correctly.
- [ ] Preview deployment smoke tests pass.
- [ ] Remaining defects and limitations are documented.

If a check cannot run, record the reason. Do not report it as passed.

## 18. Test Report Format

After each implementation phase, the AI coding tool should provide:

**Phase:** Name of the completed phase.

**Tests run:** Commands and test cases actually executed.

**Results:** Passed, failed, or blocked.

**Issues found:** Defects, risks, and relevant error messages.

**Files changed:** Main files added or modified.

**Outstanding work:** Any remaining tasks or decisions.

**Recommendation:** Whether the phase is ready for review or needs more work.

## 19. Definition of Test Readiness

The MVP is ready for release consideration when all critical user journeys work, financial calculations are verified, ownership isolation is confirmed, PDF exports are correct, and required quality checks have been completed.

Passing tests does not replace a final manual review of the application.
