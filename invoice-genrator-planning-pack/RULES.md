# Coding Rules and AI Implementation Guidelines
## Invoice Generator

## 1. Purpose

This document defines the coding standards, implementation constraints, and behavioral rules for any AI coding tool working on the Invoice Generator project.

The AI must follow these rules throughout planning, implementation, debugging, refactoring, and testing.

The product requirements in `docs/PRD.md` define what the application must do. The architecture in `docs/ARCHITECTURE.md` defines how it should be structured. This document defines how the implementation should be carried out.

## 2. Mandatory Technology Stack

Use the following technologies:

- Next.js.
- TypeScript.
- Tailwind CSS.
- Better Auth.
- MongoDB Atlas.
- Next.js Route Handlers.
- Vercel for deployment.

Use compatible, stable versions and follow the official documentation for the installed versions.

Do not replace these technologies without explicit approval.

## 3. Repository Inspection

Before making changes:

1. Inspect the existing project structure.
2. Read `README.md` and the relevant documents in `docs/`.
3. Review `package.json` and existing configuration.
4. Identify the current framework version and installed dependencies.
5. Check whether relevant components, utilities, or features already exist.
6. Identify potential conflicts before introducing new files or packages.

Do not assume the repository is empty or recreate the application unnecessarily.

If the repository already contains work, preserve valid functionality unless a change is explicitly required.

## 4. Planning Before Implementation

Before implementing a substantial feature:

- Explain the intended changes briefly.
- Identify the files likely to be created or modified.
- Check dependencies and integration requirements.
- Break the work into small, verifiable steps.
- Identify security implications.
- Define how the result will be tested.

Do not attempt to implement the entire application in one oversized operation.

For small, straightforward fixes, avoid unnecessary planning overhead.

## 5. TypeScript Standards

- Use TypeScript throughout the application.
- Define appropriate types for important data structures and function parameters.
- Avoid `any` unless there is a documented and justified reason.
- Prefer `unknown` when handling data whose type has not been established.
- Validate external input at runtime.
- Avoid unsafe type assertions that conceal errors.
- Handle optional values explicitly.
- Keep types consistent across forms, services, API handlers, and database operations.

TypeScript types alone do not validate incoming requests at runtime.

## 6. Next.js Standards

- Follow the App Router conventions used by the project.
- Use Server Components by default where appropriate.
- Add Client Components only when browser interactivity or client-side state requires them.
- Keep database operations and secrets on the server.
- Use Route Handlers for the agreed backend API operations.
- Avoid unnecessary client-side fetching when server-side loading is more appropriate.
- Keep page components focused on presentation and composition.
- Place reusable business logic in suitable server-side modules.
- Handle loading, error, and not-found states deliberately.

Do not expose server-only modules to Client Components.

## 7. Tailwind CSS Standards

- Use Tailwind CSS as the primary styling system.
- Follow the installed version's configuration and syntax.
- Use responsive utility classes for different viewport sizes.
- Reuse consistent spacing, typography, color, and layout patterns.
- Avoid repeated arbitrary values when a shared design token is appropriate.
- Keep class combinations understandable.
- Extract repeated UI patterns into reusable components when beneficial.
- Avoid introducing another styling framework without approval.
- Use custom CSS only when it provides a clear advantage or Tailwind cannot reasonably handle the requirement.

The application must follow `docs/DESIGN.md`.

## 8. Component Standards

Components should have clear responsibilities.

- Keep components small enough to understand and maintain.
- Separate reusable UI from business logic when appropriate.
- Use clear names for components, props, and handlers.
- Avoid duplicating the same form, button, or layout implementation across multiple screens.
- Keep state close to where it is needed.
- Do not create excessive abstractions for trivial one-off elements.
- Ensure interactive components provide meaningful feedback.

## 9. Authentication Rules

Use Better Auth for the approved authentication implementation.

- Follow the supported Better Auth integration and configuration.
- Verify sessions on protected server-side operations.
- Keep authentication secrets in environment variables.
- Do not implement a separate custom password system alongside Better Auth.
- Do not trust a user ID supplied by the browser as proof of identity.
- Handle expired or invalid sessions safely.
- Ensure logout invalidates the relevant session according to the authentication library's behavior.
- Do not expose private authentication records unnecessarily.

Protecting a page in the interface does not replace backend authentication checks.

## 10. Authorization and Data Ownership

Every user's invoices and customer records are private.

For every operation involving an existing private record:

1. Authenticate the requester.
2. Obtain the user identity from the verified server-side session.
3. Find the requested record using both its identifier and its ownership condition.
4. Reject the request if the record does not belong to that user.
5. Avoid revealing another user's private data in error responses.

For example, invoice lookups should conceptually filter by both invoice ID and owner ID.

Never retrieve a private invoice by its ID alone and assume that the identifier makes access safe.

Apply the same principle to editing, deleting, downloading, and accessing customer records.

## 11. MongoDB Rules

- Use MongoDB Atlas for persistent application data.
- Keep database credentials server-side.
- Reuse a properly configured database connection rather than creating unnecessary connections for every operation.
- Validate data before writing it.
- Add indexes based on access patterns and uniqueness requirements.
- Handle missing records and database failures safely.
- Avoid unnecessary database queries.
- Do not expose internal database errors to users.
- Keep database access in server-side modules.
- Follow the approved data model in `docs/ARCHITECTURE.md`.

Use the chosen database driver or modeling library consistently.

## 12. Invoice Calculation Rules

Invoice calculations must be accurate and consistent.

- Calculate line totals on the server.
- Calculate subtotals from validated line items.
- Recalculate totals whenever invoice items change.
- Do not trust totals submitted by the browser.
- Use a deliberate monetary precision strategy.
- Apply the selected currency's formatting rules.
- Ensure the invoice preview and PDF use the same authoritative values.
- Test rounding, large values, and invalid inputs.

Until tax and discount requirements are finalized, the invoice total must equal the subtotal.

Do not invent tax rates, discounts, or automatic currency conversion.

## 13. Multi-Currency Rules

- Support NGN and USD in the MVP.
- Store standardized currency codes.
- Use the selected currency consistently within an invoice.
- Format monetary values appropriately.
- Do not mix currencies within a single invoice.
- Do not convert between currencies automatically.
- Keep currency handling extensible for future additions.

## 14. Validation and Error Handling

Validate all untrusted input on the server.

Validation should cover:

- Required fields.
- Field lengths.
- Email formats where applicable.
- Valid dates and date relationships.
- Supported currency codes.
- Positive quantities.
- Valid monetary amounts.
- Valid invoice and customer identifiers.
- Ownership of referenced records.

Return appropriate error responses without exposing stack traces, database connection strings, secrets, or private records.

The UI should display understandable messages and preserve valid user input when practical.

## 15. API Standards

- Use appropriate HTTP methods.
- Use consistent response structures.
- Return suitable status codes.
- Validate request bodies and route parameters.
- Authenticate and authorize protected operations.
- Avoid accepting fields the user is not permitted to change.
- Prevent mass assignment of protected properties such as owner IDs.
- Recalculate derived financial fields on the server.
- Handle malformed JSON and unexpected failures.

Do not treat hidden form fields or disabled buttons as security controls.

## 16. Security and Secrets

- Never commit real credentials.
- Keep `.env` files containing secrets out of version control.
- Maintain a safe `.env.example` containing placeholder values only.
- Do not prefix server-only secrets with public environment variable prefixes.
- Do not log passwords, session tokens, connection strings, or sensitive customer information.
- Validate and restrict file uploads if logo uploads are implemented.
- Follow secure deployment and database access practices.
- Review authorization whenever a new private resource or API endpoint is added.

## 17. PDF Generation Rules

- Generate PDFs from validated, authoritative invoice data.
- Use the same calculation rules as the rest of the application.
- Display the selected currency correctly.
- Handle long descriptions and multiple pages.
- Avoid clipping totals or important invoice details.
- Use safe download filenames.
- Return the correct content type.
- Enforce invoice ownership before generating or downloading a PDF.

Do not assume that access to a PDF endpoint is safe simply because the user is logged in.

## 18. Dependency Management

Before adding a dependency:

1. Check whether an existing dependency already provides the required functionality.
2. Confirm that the package is compatible with the project's versions.
3. Prefer well-maintained packages appropriate for the use case.
4. Explain why a new dependency is needed.
5. Avoid unnecessary libraries that increase complexity or bundle size.

Do not change major dependency versions without evaluating compatibility.

## 19. Testing Requirements

After implementing a feature:

- Run the relevant tests.
- Run TypeScript checks.
- Run linting where configured.
- Test normal and invalid input.
- Verify authentication and authorization.
- Test responsive behavior for UI changes.
- Confirm that existing functionality still works.
- Report checks that could not be completed.

Never claim that tests passed unless they were actually run and their results support that claim.

## 20. Git and Change Management

- Keep changes focused on the task.
- Avoid unrelated refactoring.
- Do not overwrite user work without checking its purpose.
- Review the final diff before completing a substantial change.
- Never commit secrets.
- Document important architectural or product decisions.
- Ask before making destructive changes or materially expanding scope.

## 21. Prohibited Unapproved Scope

Do not introduce the following into the MVP without explicit approval:

- Subscription plans.
- Payment gateway integration.
- Paid access restrictions.
- Automatic currency conversion.
- Shared workspaces.
- Team collaboration.
- Unapproved tax calculations.
- Unapproved discount calculations.
- Unrequested external services.
- Invented customer testimonials or business statistics.

## 22. AI Communication Rules

When working on the project, the AI coding tool should:

- State its understanding of the task.
- Identify meaningful assumptions.
- Explain relevant implementation decisions.
- Ask for clarification when a decision materially affects security, financial accuracy, or product behavior.
- Avoid repeatedly asking about decisions already documented.
- Report files changed and checks performed.
- Clearly distinguish completed work from suggested future work.
- Never claim that a feature is complete when only its interface has been implemented.

## 23. Definition of Done

A feature is complete only when:

- Its approved requirements are implemented.
- The implementation follows the project architecture.
- Inputs are validated.
- Authentication and authorization are enforced where required.
- Error and loading states are handled.
- Relevant tests and checks have been run.
- The UI follows the design system where applicable.
- No unapproved functionality has been introduced.
- The AI provides an accurate summary of the changes and remaining limitations.