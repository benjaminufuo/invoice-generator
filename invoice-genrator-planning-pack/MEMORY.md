# MEMORY.md — Invoice Generator Project Context

## 1. Purpose

This file provides a concise, persistent reference for AI coding sessions working on the Invoice Generator project.

The AI coding tool should read this file at the beginning of a session, alongside the relevant project documents.

Update it when important decisions, implementation details, or project status change.

**This file records project context. It does not override the PRD, architecture, design, security requirements, or approved decisions.**

## 2. Project Overview

The Invoice Generator is a web application that allows individual users to create, manage, preview, and download professional invoices as PDFs.

The MVP includes authentication, persistent database storage, customer management, invoice management, invoice calculations, multiple currencies, and PDF export.

The application must be secure, responsive, maintainable, and suitable for deployment.

## 3. Confirmed Technology Stack

| Area | Technology |
|---|---|
| Framework | Next.js |
| Programming language | TypeScript |
| Styling | Tailwind CSS |
| Authentication | Better Auth |
| Database | MongoDB Atlas |
| API | Next.js Route Handlers |
| Hosting | Vercel |

Use the versions and package manager established in the repository. Check official documentation relevant to those installed versions before implementing integrations.

Do not replace the agreed stack without approval.

## 4. Product Scope

### Included in the MVP

- User registration and sign-in.
- Protected application routes.
- Individual user accounts.
- Dashboard and invoice list.
- Customer creation and management.
- Invoice creation, viewing, editing, and deletion.
- Invoice line items and calculations.
- Multiple supported currencies, including NGN and USD.
- Invoice preview.
- Downloadable PDF invoices.
- Server-side validation and authorization.
- Responsive interface.
- Testing and Vercel deployment.

### Excluded unless separately approved

- Paid subscriptions and billing.
- Payment processing.
- Team workspaces.
- Automatic currency conversion.
- Tax and discount rules.
- Multiple invoice templates.
- Other features not included in the approved MVP scope.

Logo uploads remain conditional on approval.

## 5. Core Business Rules

### User ownership

Every customer and invoice belongs to a specific user.

- Derive the user ID from the authenticated server-side session.
- Never trust a client-submitted owner ID.
- Enforce ownership in all protected database operations.
- Do not allow users to view, edit, delete, or export another user's records.

### Invoice calculations

- Line total = quantity × unit price.
- Subtotal = sum of line totals.
- Final total equals the subtotal unless additional calculation rules are explicitly approved.
- Recalculate totals on the server.
- Use a consistent monetary precision strategy.
- Do not introduce unapproved tax or discount calculations.

### Currency

- NGN is the recommended default.
- Users can select another supported currency for an invoice.
- Each invoice uses one currency.
- Currency selection does not automatically convert monetary amounts.
- Currency formatting must remain consistent across the interface and PDF.

### PDF generation

- Generate PDFs from authorized invoice data.
- Ensure exported totals match the saved invoice.
- Generate PDFs on demand by default.
- Do not store duplicate PDFs unless the requirements change.

## 6. Architecture Rules

- Keep database access on the server.
- Use Next.js Route Handlers for server-side operations.
- Separate reusable UI components from business logic.
- Validate data before persistence.
- Use consistent error handling.
- Keep secrets in server-side environment variables.
- Avoid unnecessary dependencies and duplicate abstractions.
- Preserve existing repository functionality unless an approved change requires otherwise.

Refer to `docs/ARCHITECTURE.md` for the detailed structure and data models.

## 7. Design Direction

The application should have a polished, professional interface suitable for business use.

Prioritize:

- Clear information hierarchy.
- Simple navigation.
- Consistent spacing and typography.
- Reusable components.
- Accessible forms and controls.
- Helpful loading, empty, success, and error states.
- Responsive layouts for mobile, tablet, and desktop.
- A clean invoice document suitable for downloading and sharing.

Refer to `docs/DESIGN.md` for the full design requirements.

## 8. Security Priorities

The highest-priority security requirements are:

1. Authentication for protected features.
2. Server-side authorization.
3. Strict ownership isolation.
4. Server-side input validation.
5. Server-side financial calculations.
6. Secure database access.
7. Protection of environment variables and secrets.
8. Safe PDF generation and export.
9. Controlled error handling.
10. Appropriate account-deletion and data-retention behavior.

Refer to `docs/SECURITY.md` for detailed requirements.

## 9. Current Outstanding Decisions

The following choices must not be treated as finalized until approved:

- Invoice numbering format and uniqueness scope.
- Invoice status workflow.
- PDF template details.
- Whether logo uploads are included.
- Authentication methods beyond the confirmed Better Auth direction.
- Native MongoDB driver versus Mongoose.
- PDF generation library.
- Monetary precision implementation.
- Customer deletion behavior when invoices reference that customer.
- Account deletion and data-retention policy.

Refer to `docs/DECISIONS.md` for the complete decision register.

## 10. Project Documentation

The project documentation includes:

- `README.md` — project overview and working instructions.
- `docs/PRD.md` — product requirements and acceptance criteria.
- `docs/ARCHITECTURE.md` — application structure and technical design.
- `docs/DESIGN.md` — interface and visual requirements.
- `docs/RULES.md` — coding standards and AI coding rules.
- `docs/TASKS.md` — phased implementation plan.
- `docs/TEST_PLAN.md` — testing strategy.
- `docs/SECURITY.md` — security requirements.
- `docs/DECISIONS.md` — confirmed decisions and unresolved questions.
- `docs/MEMORY.md` — persistent project context.
- `PROMPTS.md` — prompts for guiding the AI coding tool.
- `.env.example` — required environment-variable names with placeholder values.

Read the relevant documents before modifying related features.

## 11. Session Startup Instructions

At the beginning of a new coding session:

1. Read this file.
2. Read `README.md`.
3. Read the relevant requirements and technical documents.
4. Inspect the current repository and Git status.
5. Identify the current implementation state.
6. Check for unresolved decisions that affect the requested task.
7. State the intended changes before making substantial modifications.

Do not assume that a task is incomplete simply because it appears in the original task plan. Inspect the repository and verify its actual state.

## 12. End-of-Session Instructions

At the end of a coding session:

- Summarize what changed.
- List the files created or modified.
- Report tests and checks actually run.
- Record any failures or unresolved issues.
- Identify the next recommended task.
- Update this file if the project state or an important decision changed.

Do not mark unfinished work as complete.

## 13. Current Project Status

**Planning and documentation stage.**

The product requirements, technical direction, implementation phases, testing strategy, and security requirements are being documented before implementation begins.

The next step is to complete the remaining planning documents, review unresolved decisions, and then use the approved prompts to guide the AI coding tool through implementation in controlled phases.

This file should be updated as implementation progresses.

## 14. Final Instruction

Treat this file as a quick project reference, not as a substitute for reading the detailed documentation.

When information conflicts, follow the latest explicitly approved decision and update the affected documents. Never silently expand the MVP or weaken security requirements.
