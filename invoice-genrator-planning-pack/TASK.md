# TASKS.md — Invoice Generator Implementation Plan

## 1. Purpose

This document breaks the Invoice Generator MVP into small, verifiable tasks. It is intended to guide an AI coding tool through implementation in a controlled sequence.

**Important:** Follow the existing PRD, architecture, design, and coding rules. Do not introduce features or change the agreed stack without approval.

## 2. Implementation Principles

- Complete one phase at a time.
- Inspect the existing repository before making changes.
- Plan each task before writing code.
- Avoid implementing unrelated features.
- Keep changes small and easy to review.
- Run relevant tests and checks after each task.
- Do not proceed past a failing check without explaining the failure.
- Update project documentation when implementation decisions change.
- Never claim that a feature works without verifying it.

## 3. Phase 0 — Repository Inspection and Setup

### Tasks

- [ ] Inspect the repository structure and existing files.
- [ ] Identify the current Next.js version, package manager, and dependencies.
- [ ] Check whether TypeScript and Tailwind CSS are configured.
- [ ] Identify existing routes, layouts, components, and styles.
- [ ] Check existing environment-variable handling.
- [ ] Identify any existing authentication or database implementation.
- [ ] Report conflicts between the repository and the project documents.
- [ ] Propose a setup plan before making major changes.
- [ ] Create or update the project documentation structure.
- [ ] Configure environment-variable examples without exposing secrets.
- [ ] Confirm the application starts successfully.

### Completion criteria

- The repository has been inspected.
- Existing functionality and risks have been documented.
- The development environment starts successfully.
- No unnecessary application rewrite has occurred.

## 4. Phase 1 — Foundation and Design System

### Tasks

- [ ] Establish the agreed application structure.
- [ ] Configure global styles and typography.
- [ ] Define reusable colors, spacing, borders, and shadows.
- [ ] Configure the responsive application layout.
- [ ] Build reusable buttons, inputs, labels, cards, dialogs, and notifications.
- [ ] Add loading, empty, error, and disabled states.
- [ ] Establish consistent form validation feedback.
- [ ] Check mobile, tablet, and desktop layouts.

### Completion criteria

- Shared components follow the design document.
- The application is responsive.
- Components can be reused without duplicating styling.
- Existing checks pass.

## 5. Phase 2 — Authentication

### Tasks

- [ ] Configure Better Auth according to the installed version's documentation.
- [ ] Configure the authentication database integration.
- [ ] Implement account registration.
- [ ] Implement sign-in.
- [ ] Implement sign-out.
- [ ] Add appropriate session handling.
- [ ] Protect authenticated application routes.
- [ ] Add appropriate authentication error messages.
- [ ] Validate authentication forms on the client and server.
- [ ] Verify that protected pages cannot be accessed without a valid session.

### Completion criteria

- Users can register, sign in, and sign out.
- Unauthenticated users cannot access protected features.
- Authentication state is handled consistently.
- Secrets remain server-side.

## 6. Phase 3 — MongoDB and Data Access

### Tasks

- [ ] Configure MongoDB Atlas connectivity.
- [ ] Implement a reusable database connection.
- [ ] Define the user, customer, and invoice data structures.
- [ ] Define ownership fields and validation rules.
- [ ] Add appropriate indexes.
- [ ] Implement reusable data-access functions.
- [ ] Ensure database credentials are not exposed to the browser.
- [ ] Add consistent handling for database failures.
- [ ] Verify that records are associated with the authenticated user.

### Completion criteria

- The application can connect to MongoDB Atlas.
- Database access is reusable and server-side.
- Data structures match the architecture document.
- Ownership rules are enforced.

## 7. Phase 4 — Dashboard

### Tasks

- [ ] Build the authenticated dashboard layout.
- [ ] Add navigation for the dashboard and invoice features.
- [ ] Display invoice summary information.
- [ ] Add an invoice list with useful columns.
- [ ] Add search or filtering where specified in the PRD.
- [ ] Implement loading, empty, and error states.
- [ ] Add a clear action to create an invoice.
- [ ] Ensure the layout works on mobile devices.

### Completion criteria

- Users can navigate the main application.
- Dashboard figures are derived from actual saved data.
- Empty accounts display helpful guidance.
- Dashboard data is limited to the authenticated user's records.

## 8. Phase 5 — Customer Management

### Tasks

- [ ] Build the customer list.
- [ ] Implement customer creation.
- [ ] Implement customer editing.
- [ ] Implement customer detail viewing where required.
- [ ] Implement customer deletion with appropriate confirmation.
- [ ] Validate customer fields on the server.
- [ ] Associate each customer with its owner.
- [ ] Prevent users from accessing or modifying another user's customers.
- [ ] Handle customers that are referenced by existing invoices according to the PRD's chosen deletion policy.

### Completion criteria

- Users can manage their own customer records.
- Customer data persists after refreshing the application.
- Ownership is checked on every relevant server operation.
- Validation and error messages are understandable.

## 9. Phase 6 — Invoice Creation and Management

### Tasks

- [ ] Build the invoice creation form.
- [ ] Add invoice issuer/business details.
- [ ] Add customer selection.
- [ ] Add invoice date and due date fields.
- [ ] Add invoice line items.
- [ ] Support adding and removing line items.
- [ ] Add quantity, unit price, and line-total calculations.
- [ ] Support the agreed invoice currency options.
- [ ] Apply the agreed default currency while allowing the user to choose another supported currency.
- [ ] Display subtotal and final total accurately.
- [ ] Validate required fields and numerical values.
- [ ] Generate invoice numbers according to the approved numbering strategy.
- [ ] Save invoices to MongoDB.
- [ ] Build the invoice details view.
- [ ] Implement invoice editing.
- [ ] Implement invoice deletion with confirmation.
- [ ] Add the agreed invoice status workflow, once confirmed in the decisions document.
- [ ] Ensure all invoice operations enforce ownership.

### Completion criteria

- Users can create, view, edit, and delete their own invoices.
- Invoice data persists correctly.
- Calculations are performed and validated on the server.
- One invoice uses one currency.
- No automatic currency conversion is performed.
- Tax and discount calculations are not introduced unless explicitly approved.
- Invoice numbers follow the agreed uniqueness rules.

## 10. Phase 7 — Invoice Preview and PDF Export

### Tasks

- [ ] Design a professional invoice document template.
- [ ] Display issuer, customer, invoice number, dates, line items, currency, and totals.
- [ ] Ensure the preview reflects saved invoice data.
- [ ] Implement PDF generation using the approved library.
- [ ] Generate PDFs on the server.
- [ ] Provide a download action.
- [ ] Check page breaks, text wrapping, and multi-page invoices.
- [ ] Verify currency symbols and number formatting.
- [ ] Test PDF output on representative invoice data.
- [ ] Avoid storing duplicate PDF files unless the product requirements change.

### Completion criteria

- The downloaded PDF matches the invoice preview.
- Important invoice information is readable and complete.
- PDF generation handles long descriptions and multiple line items.
- Users can export only invoices they are authorized to access.

## 11. Phase 8 — Logo Uploads (Conditional)

This phase depends on whether logo uploads are approved for the MVP.

### Tasks

- [ ] Confirm the approved file-storage provider.
- [ ] Configure the required environment variables.
- [ ] Validate file type and size.
- [ ] Restrict uploads to supported image formats.
- [ ] Store only the necessary file reference in MongoDB.
- [ ] Ensure users cannot modify another user's logo settings.
- [ ] Display the logo in the invoice preview and exported PDF.
- [ ] Handle missing, invalid, or unavailable images.

### Completion criteria

- Logo uploads work securely if included.
- Uploaded assets are accessible only as intended.
- The invoice remains usable when no logo is provided.

## 12. Phase 9 — API Validation and Security Review

### Tasks

- [ ] Review all Route Handlers.
- [ ] Validate incoming request data on the server.
- [ ] Confirm authentication and ownership checks for every protected operation.
- [ ] Prevent mass assignment of protected fields.
- [ ] Review MongoDB queries for ownership enforcement.
- [ ] Review error responses for accidental disclosure.
- [ ] Check rate-limiting needs for sensitive endpoints.
- [ ] Verify that environment variables and secrets are not exposed.
- [ ] Test unauthorized and cross-user requests.
- [ ] Review file-upload handling if uploads are included.

### Completion criteria

- All protected operations enforce server-side authorization.
- Invalid requests are rejected safely.
- Sensitive implementation details are not leaked.
- Security tests pass.

## 13. Phase 10 — Testing and Quality Assurance

### Tasks

- [ ] Add unit tests for invoice calculations.
- [ ] Test quantity and unit-price validation.
- [ ] Test currency formatting.
- [ ] Test invoice-number generation.
- [ ] Test authentication-protected routes.
- [ ] Test customer CRUD operations.
- [ ] Test invoice CRUD operations.
- [ ] Test ownership isolation.
- [ ] Test PDF generation.
- [ ] Test form validation and error states.
- [ ] Test responsive layouts.
- [ ] Run TypeScript checks.
- [ ] Run linting.
- [ ] Run production build.
- [ ] Fix all critical and high-priority defects.

### Completion criteria

- Automated checks pass, or remaining failures are clearly documented.
- Core user journeys have been tested.
- Cross-user access tests pass.
- No known critical defects remain.

## 14. Phase 11 — Deployment

### Tasks

- [ ] Configure the production environment in Vercel.
- [ ] Add required environment variables securely.
- [ ] Confirm MongoDB Atlas network and access settings.
- [ ] Configure production authentication URLs and secrets.
- [ ] Confirm database connectivity from the deployed application.
- [ ] Deploy to a preview environment.
- [ ] Run smoke tests against the preview deployment.
- [ ] Fix deployment-specific issues.
- [ ] Deploy to production after approval.
- [ ] Verify registration, sign-in, customer management, invoice creation, and PDF download in production.
- [ ] Document known limitations and operational steps.

### Completion criteria

- The production application builds and deploys successfully.
- Required environment variables are configured.
- Core features work in the deployed environment.
- No secrets are committed to the repository.

## 15. Suggested Task Execution Order

Follow this order unless repository inspection reveals a necessary dependency change:

1. Repository inspection and setup.
2. Foundation and design system.
3. Authentication.
4. Database connection and data access.
5. Dashboard.
6. Customer management.
7. Invoice creation and management.
8. Invoice preview and PDF export.
9. Logo uploads, if approved.
10. Security review and testing.
11. Preview deployment.
12. Production deployment.

Testing should happen throughout development, not only at the end.

## 16. Instructions for the AI Coding Tool

At the beginning of each phase:

1. Read `README.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, and `docs/RULES.md`.
2. Inspect the relevant repository files.
3. State the phase objective and the files likely to change.
4. Identify dependencies and potential risks.
5. Implement only the agreed phase.
6. Run the relevant checks.
7. Summarize files changed, checks performed, results, and unresolved issues.
8. Wait for approval before beginning the next major phase.

Do not mark a task complete merely because code was written. Mark it complete only after appropriate verification.

## 17. Definition of MVP Completion

The MVP is ready for release when:

- Authentication works.
- Each user can manage their own customers and invoices.
- Invoice data is persisted in MongoDB Atlas.
- Invoice totals are calculated and validated correctly.
- Supported currencies are handled consistently.
- Invoice previews and PDF downloads work.
- Ownership isolation has been tested.
- Responsive layouts and error states are in place.
- TypeScript, linting, tests, and production build checks have been run.
- The production deployment has been smoke-tested.
- Known limitations and any deferred decisions are documented.

Subscriptions, paid plans, payment processing, team workspaces, and other deferred features must remain out of scope unless separately approved.
