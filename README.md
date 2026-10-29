# Invoice Generator — Project Planning Pack

## 1. Project Overview

This project is a web-based invoice generator that allows individual users to create, manage, and export professional invoices.

The application will support multiple currencies, including Nigerian Naira (NGN) and US Dollars (USD). Users will have private accounts and will only be able to access their own invoices and associated customer data.

The goal is to build a reliable, secure, responsive, and easy-to-use invoice generation tool with a polished user interface.

## 2. Technology Stack

- **Framework:** Next.js
- **Programming language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Better Auth
- **Database:** MongoDB Atlas
- **Backend:** Next.js Route Handlers
- **Deployment:** Vercel
- **PDF generation:** A suitable PDF generation library selected during implementation
- **File storage:** A dedicated storage service such as Vercel Blob if logo uploads are included

## 3. MVP Features

The initial release should include:

1. User registration, login, logout, and session management.
2. A protected dashboard.
3. Invoice creation and editing.
4. Invoice listing, viewing, and deletion.
5. Support for multiple currencies, including NGN and USD.
6. Invoice line items, quantities, unit prices, subtotals, and totals.
7. Customer details on invoices.
8. Professional invoice PDF generation and download.
9. Responsive layouts for desktop, tablet, and mobile.
10. Secure storage of invoice data in MongoDB Atlas.
11. User-specific authorization to prevent access to another user's records.

## 4. Features Excluded from the MVP

The following features are deferred:

- Paid plans and subscriptions.
- Payment processing.
- Automatic currency conversion.
- Team workspaces and shared invoices.
- Advanced tax and discount calculations until their requirements are finalized.
- Email or WhatsApp invoice delivery unless explicitly added to the requirements.
- Advanced analytics and reporting.

## 5. Data Privacy and Security

Every invoice must be associated with its owner.

The application must verify ownership on the server for every invoice operation. Hiding another user's invoice in the interface is not sufficient; unauthorized access must also be prevented at the backend.

Authentication secrets, database credentials, and other sensitive environment variables must never be exposed in client-side code or committed to source control.

## 6. Development Approach

The AI coding tool should follow these principles:

1. Read the project documentation before making changes.
2. Inspect the existing repository before creating or modifying files.
3. Plan the architecture and implementation sequence.
4. Build the application in small, verifiable stages.
5. Reuse shared components and consistent design tokens.
6. Use TypeScript and Tailwind CSS consistently.
7. Test each major feature before proceeding.
8. Review security, accessibility, responsiveness, and error handling.
9. Avoid adding unapproved features or unnecessary dependencies.
10. Document important implementation decisions.

## 7. Recommended Implementation Order

1. Project setup and configuration.
2. Authentication and protected routes.
3. MongoDB connection and data models.
4. Authorization and user data isolation.
5. Dashboard layout and navigation.
6. Invoice creation and editing.
7. Invoice listing and management.
8. Multi-currency formatting and invoice calculations.
9. PDF generation and download.
10. Validation, error handling, responsive testing, and security review.
11. Deployment configuration and production verification.

## 8. Planning Pack Contents

The complete planning pack is organized into the following documents:

- `README.md` — Project overview and guide.
- `docs/PRD.md` — Product Requirements Document.
- `docs/ARCHITECTURE.md` — Technical architecture and database design.
- `docs/DESIGN.md` — Design system and UI/UX requirements.
- `docs/RULES.md` — Coding standards and AI implementation constraints.
- `docs/TASKS.md` — Implementation checklist.
- `docs/TEST_PLAN.md` — Testing strategy and acceptance checks.
- `docs/SECURITY.md` — Authentication, authorization, and data protection.
- `docs/DECISIONS.md` — Confirmed decisions and deferred questions.
- `docs/MEMORY.md` — Persistent context for the AI coding tool.
- `PROMPTS.md` — Copy-and-paste prompts for planning, implementation, testing, and review.
- `.env.example` — Example environment variable names without real credentials.

## 9. Instructions for the AI Coding Tool

Before implementing any feature, read the relevant documents in this pack.

Treat the PRD as the source of truth for product requirements, the architecture document as the technical guide, and the coding rules as implementation constraints.

If a requirement is unclear, identify it and request clarification rather than silently inventing a product decision.

Do not implement pricing, subscriptions, payment processing, shared workspaces, or other deferred features without explicit approval.

The application is not considered complete merely because the interface looks correct. Authentication, persistence, invoice calculations, authorization, PDF output, and error handling must work and be tested.

## 10. Completion Criteria

The MVP is ready for release when users can register, log in, create and manage their own invoices, use supported currencies, download professional PDFs, and reliably access their saved data without being able to access another user's records.

The application must also pass its essential functional, security, and responsive-design checks before production deployment.