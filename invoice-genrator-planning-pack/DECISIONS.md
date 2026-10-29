# DECISIONS.md — Invoice Generator Product and Technical Decisions

## 1. Purpose

This document records the decisions that guide the Invoice Generator MVP.

Its purpose is to prevent inconsistent assumptions during development, reduce unnecessary rework, and help the AI coding tool distinguish confirmed requirements from unresolved questions.

**Rule:** Do not silently turn an unresolved decision into a permanent product requirement. Identify the issue and request approval when it affects implementation.

## 2. Confirmed Product Decisions

| Decision | Agreed direction |
|---|---|
| Product | Invoice Generator web application |
| Target users | Individual users |
| Authentication | Required in the MVP |
| Backend | Required in the MVP |
| Database | MongoDB Atlas |
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Authentication library | Better Auth |
| API approach | Next.js Route Handlers |
| Deployment | Vercel |
| Invoice management | Users manage their own invoices |
| Customer management | Users manage their own customer records |
| Currency support | Multiple currencies, including NGN and USD |
| Default currency | NGN recommended as the initial default |
| Currency selection | Users can choose a supported currency for each invoice |
| Currency conversion | Excluded from the MVP |
| Taxes and discounts | Deferred until their rules are explicitly decided |
| PDF generation | Generate invoices as downloadable PDFs |
| PDF storage | Do not store duplicate PDFs by default |
| Logo uploads | Conditional; requires confirmation of scope and storage provider |
| Paid plans and subscriptions | Excluded from the MVP |
| Payment processing | Excluded from the MVP |
| Team workspaces | Excluded from the MVP |

## 3. Confirmed Technical Direction

### Application

Use Next.js with TypeScript and Tailwind CSS.

### Authentication

Use Better Auth, following the documentation for the version installed in the repository.

### Database

Use MongoDB Atlas for application data, including the records required for users, customers, and invoices.

### API

Use Next.js Route Handlers for server-side operations. Protected operations must verify authentication, validate input, and enforce data ownership.

### Deployment

Use Vercel for hosting the application.

### Data security

Every user's customer records and invoices must be isolated from other users. Authorization must be enforced on the server, not merely through frontend navigation.

## 4. Invoice Calculation Decisions

The MVP must calculate invoice totals from validated line items.

The agreed baseline is:

- Line total = quantity × unit price.
- Subtotal = sum of line totals.
- Final total = subtotal when no additional approved calculation applies.

Tax and discount rules remain outside the MVP until explicitly approved.

The application must not introduce automatic exchange-rate conversion.

## 5. Decisions Still Requiring Approval

The following decisions are not yet confirmed. They must be resolved before implementing the affected features.

### Decision 1 — Invoice numbering

**Question:** What format should invoice numbers use?

Possible approaches include:

- Sequential numbering, such as `INV-0001`.
- Date-based numbering, such as `INV-2026-0001`.
- A unique generated identifier displayed in a readable invoice format.

Considerations:
- Uniqueness requirements.
- Concurrent invoice creation.
- Whether numbering is global or per user.
- Whether invoice numbers may be edited.
- Whether deleted invoice numbers can be reused.

**Recommendation:** Use a readable invoice prefix and a numbering strategy that prevents duplicates. Confirm the exact format and uniqueness scope before implementation.

**Status:** Pending approval.

### Decision 2 — Invoice status

**Question:** Which invoice statuses should be supported?

Possible statuses include:
- Draft
- Sent
- Paid
- Overdue
- Cancelled

Considerations:
- Whether users manually change statuses.
- Whether overdue status is calculated from the due date.
- Whether a draft can be exported.
- Whether status changes require an audit trail.

**Recommendation:** Keep the initial workflow simple. Support only statuses required by the approved MVP and avoid implying that payment has been verified when no payment integration exists.

**Status:** Pending approval.

### Decision 3 — PDF template

**Question:** What visual style should the downloadable invoice use?

Possible directions:
- Minimal professional.
- Modern business.
- Traditional formal invoice.

Considerations:
- Business identity and contact information.
- Customer details.
- Invoice number and dates.
- Line-item table and totals.
- Currency formatting.
- Optional logo.
- Long descriptions and multiple pages.

**Recommendation:** Start with one polished, professional template. Defer multiple templates until after the MVP.

**Status:** Pending approval.

### Decision 4 — Logo uploads

**Question:** Should users upload a business logo in the MVP?

If yes, confirm:
- Supported file formats.
- Maximum file size.
- Whether the logo is saved to the user's profile or individual invoice.
- The file-storage provider.
- Whether the logo appears in PDF exports.

**Recommendation:** If logo uploads are not essential to the first release, defer them. If included, use a dedicated storage service rather than storing image files directly in ordinary invoice documents.

**Status:** Pending approval.

### Decision 5 — Reusable customer directory

**Question:** Should users maintain a reusable customer directory?

The current architecture and task plan assume that users can create and manage customer records and select a saved customer when creating an invoice.

Confirm whether the MVP should also allow:
- Creating a customer directly from the invoice form.
- Editing customer details without leaving invoice creation.
- Copying customer information into an invoice as a snapshot.

**Recommendation:** Support reusable customer records. Consider storing the relevant customer details as an invoice snapshot so historical invoices remain consistent when a customer's profile is later edited.

**Status:** Core customer management is planned; snapshot behavior requires approval.

### Decision 6 — Authentication methods

**Question:** Which sign-in methods should be available?

Possible options:
- Email and password.
- Google sign-in.
- Both.

**Recommendation:** Begin with email and password unless Google sign-in is a specific MVP requirement. Additional methods can be added later.

**Status:** Pending approval.

### Decision 7 — MongoDB data-access approach

**Question:** Should the application use the native MongoDB driver or Mongoose?

Options:
- Native MongoDB Node.js driver.
- Mongoose.

**Recommendation:** Choose one approach and use it consistently. The native driver is a reasonable fit for a relatively small application with explicit data-access functions. Mongoose is an alternative if schema and model abstractions are preferred.

The choice must also be compatible with the Better Auth database integration.

**Status:** Pending technical confirmation.

### Decision 8 — PDF generation library

**Question:** Which library should generate PDFs?

The choice should be based on:
- Compatibility with the deployed Next.js runtime.
- Support for page breaks and multiple pages.
- Reliable currency and text rendering.
- Ease of styling.
- Server-side compatibility.
- Maintenance and dependency quality.

**Recommendation:** Evaluate a small number of suitable libraries before committing to one. Test the chosen library with long descriptions and large invoices.

**Status:** Pending technical confirmation.

### Decision 9 — Monetary precision

**Question:** How should monetary values be represented and rounded?

Considerations:
- Currency decimal precision.
- Quantity precision.
- Unit-price precision.
- Rounding line totals versus the final subtotal.
- Consistent formatting across MongoDB, calculations, and PDFs.

**Recommendation:** Define one monetary precision strategy before invoice calculations are implemented. Use decimal arithmetic or an appropriate integer-minor-unit representation where suitable. Avoid relying on inconsistent floating-point arithmetic.

**Status:** Pending technical confirmation.

### Decision 10 — Customer and invoice deletion

**Question:** What should happen when a customer associated with existing invoices is deleted?

Possible approaches:
- Prevent deletion while invoices reference the customer.
- Allow deletion but preserve the customer details in existing invoices.
- Use another explicitly defined archival policy.

**Recommendation:** Preserve historical invoice information. Avoid deleting customer details needed to render previously created invoices.

Also confirm whether invoice deletion is permanent or uses a soft-delete approach.

**Status:** Pending approval.

### Decision 11 — Account deletion and data retention

**Question:** What happens when a user deletes their account?

Confirm:
- Whether their invoices and customers are deleted or retained.
- Whether they can export their records before deletion.
- How backups and retained copies are handled.
- Whether deletion is immediate or follows a defined retention period.

**Recommendation:** Define the policy before launch and apply it consistently to related records.

**Status:** Pending approval.

## 6. Deferred Features

The following features must not be introduced into the MVP without separate approval:

- Subscription billing.
- Paid plans.
- Payment processing.
- Team workspaces.
- Automatic currency conversion.
- Advanced tax calculations.
- Discount rules.
- Multiple invoice templates.
- Other major features not required by the approved PRD.

A future feature may be documented for a later release, but it must not expand the current implementation scope without authorization.

## 7. Decision Change Process

When a requirement or technical choice needs to change:

1. Identify the existing decision.
2. Explain why a change is needed.
3. Describe the effect on scope, architecture, security, and testing.
4. Recommend an option.
5. Obtain approval before making a material change.
6. Update this document and any affected documents.
7. Verify that implementation and tests reflect the approved decision.

Do not change the stack or add a dependency merely because an AI coding tool prefers a different approach.

## 8. Instructions for the AI Coding Tool

Before implementing any feature affected by an unresolved decision:

- Check this document.
- Identify the missing decision.
- Explain the available options when necessary.
- Recommend a practical option.
- Request approval for decisions that materially affect product behavior, security, data integrity, or architecture.
- Do not represent a recommendation as an already-approved requirement.

Small implementation details may be chosen pragmatically when they do not conflict with the confirmed requirements. Record consequential technical choices here.

## 9. Decision Log

Use this section to record approved resolutions.

| Date | Decision | Resolution | Approved by |
|---|---|---|---|
| 2026-10-28 | Invoice numbering | `INV-YYYY-NNNN` sequential per user | Approved |
| 2026-10-28 | Invoice statuses | Draft, Sent, Paid | Approved |
| 2026-10-28 | PDF template | Minimal clean professional print/PDF layout | Approved |
| 2026-10-28 | Logo uploads | Excluded from MVP (deferred) | Approved |
| 2026-10-28 | Authentication methods | Email and password via Better Auth | Approved |
| 2026-10-28 | MongoDB data-access approach | Native MongoDB Node.js driver | Approved |
| 2026-10-28 | PDF generation | High-fidelity clean print stylesheet + browser PDF export | Approved |
| 2026-10-28 | Monetary precision | 2-decimal rounding to integer cents/kobo | Approved |
| 2026-10-28 | Deletion and retention policies | Customer deletion retains invoice snapshots; invoice deletion with confirmation | Approved |

## 10. Final Rule

Confirmed requirements take precedence over unapproved suggestions. When an unresolved choice materially affects implementation, ask for approval rather than silently guessing.

