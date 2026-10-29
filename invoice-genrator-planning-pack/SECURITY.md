# SECURITY.md — Invoice Generator Security Requirements

## 1. Purpose

This document establishes the minimum security requirements for the Invoice Generator MVP.

The application stores customer information, business details, and invoices. These records must be protected against unauthorized access, accidental exposure, and unauthorized modification.

The AI coding tool must follow these requirements throughout implementation, testing, and deployment.

## 2. Core Security Principles

- Enforce authentication for all protected application features.
- Enforce authorization on the server, not only in the user interface.
- Apply the principle of least privilege.
- Validate all untrusted input on the server.
- Keep secrets and database credentials out of client-side code.
- Return only the data required for each operation.
- Fail safely when authentication, validation, or database operations fail.
- Avoid collecting or storing unnecessary personal information.
- Never assume that an ID supplied by a client belongs to the authenticated user.
- Do not introduce security-sensitive dependencies or services without a clear reason.

## 3. Authentication and Sessions

The application uses Better Auth for authentication.

### Requirements

- Use Better Auth according to the documentation for the installed version.
- Protect all authenticated routes and operations.
- Verify the current session on the server before accessing protected data.
- Implement registration, sign-in, and sign-out securely.
- Use the authentication library's supported password and session handling.
- Do not implement custom password storage or password hashing when the authentication library already handles these responsibilities.
- Use secure cookie settings appropriate to the deployment environment.
- Configure trusted origins and authentication URLs correctly.
- Handle expired or invalid sessions safely.
- Do not expose session secrets or sensitive authentication data to the browser.
- Apply appropriate rate limits to sensitive authentication operations where supported.

### Acceptance criteria

- Unauthenticated users cannot access protected records.
- Invalid sessions cannot authorize protected requests.
- Signing out invalidates the applicable session.
- Authentication failures do not reveal unnecessary information.

## 4. User Data Ownership and Authorization

Every customer and invoice must belong to an authenticated user.

This is one of the application's most important security requirements.

### Requirements

- Associate each customer and invoice with its owner's user ID.
- Derive the owner ID from the verified server-side session.
- Never trust a client-submitted owner ID.
- Enforce ownership in every relevant database query.
- Apply authorization to reading, creating, editing, deleting, and exporting records.
- Do not rely solely on hidden buttons or protected frontend routes.
- Do not return another user's record before checking authorization.

### Example

A request to retrieve an invoice must verify both the invoice identifier and the authenticated user's ownership.

Conceptually, the database lookup should match:

- The requested invoice ID.
- The current authenticated user's ID.

The same principle applies to customer records and PDF exports.

### Required security tests

- User A cannot retrieve User B's invoice.
- User A cannot modify or delete User B's invoice.
- User A cannot download User B's invoice PDF.
- User A cannot access, modify, or delete User B's customer.
- Changing an identifier in the URL or request body does not bypass authorization.

### Acceptance criteria

All ownership checks are performed on the server for every protected operation.

## 5. Input Validation

All client-submitted data must be treated as untrusted.

### Requirements

- Validate incoming data on the server.
- Use a consistent validation approach, such as Zod, if approved for the project.
- Validate required fields, data types, lengths, dates, and numerical ranges.
- Validate currency codes against the application's supported currencies.
- Validate invoice line items before saving them.
- Reject malformed request bodies.
- Reject unexpected or protected fields.
- Apply reasonable limits to text fields and request sizes.
- Do not rely exclusively on browser-side form validation.

### Invoice-specific validation

Validate at least:

- Customer reference.
- Invoice number, according to the approved numbering strategy.
- Invoice and due dates.
- Currency.
- Line-item descriptions.
- Quantities.
- Unit prices.
- Required issuer and customer details.

Do not accept client-submitted totals as authoritative. Recalculate invoice totals on the server from validated line items.

### Acceptance criteria

Invalid data cannot be persisted merely because a request bypasses frontend validation.

## 6. Financial Data Integrity

Invoice amounts must remain consistent and trustworthy.

### Requirements

- Use the approved monetary precision strategy.
- Avoid inconsistent floating-point arithmetic for financial calculations.
- Validate quantities and prices before calculation.
- Recalculate line totals and invoice totals on the server.
- Prevent unauthorized modification of saved invoice data.
- Store the selected currency with each invoice.
- Do not silently convert amounts between currencies.
- Do not add taxes or discounts unless their rules have been explicitly approved.
- Keep calculations consistent between the invoice form, saved record, preview, and PDF.

### Acceptance criteria

A client cannot manipulate the displayed total or submit a fabricated total to override the server's calculation.

## 7. MongoDB Security

The application uses MongoDB Atlas.

### Requirements

- Keep the MongoDB connection string in server-side environment variables.
- Never expose database credentials in browser code.
- Use a database account with only the permissions required by the application.
- Configure MongoDB Atlas access controls appropriately.
- Avoid unnecessarily broad network access rules.
- Validate and normalize identifiers before database operations.
- Apply ownership filters to protected queries.
- Use database indexes where appropriate.
- Handle database failures without returning internal credentials or sensitive implementation details.
- Keep production and test data appropriately separated.

### Acceptance criteria

Only authorized server-side application code can access the database, and protected records cannot be accessed across user accounts.

## 8. API and Route Handler Security

Next.js Route Handlers must enforce the same security rules as the rest of the application.

### Requirements

- Verify authentication for protected operations.
- Verify ownership before accessing existing records.
- Validate request bodies, parameters, and query strings.
- Use appropriate HTTP status codes.
- Return consistent and safe error responses.
- Avoid exposing stack traces, database errors, secrets, or internal implementation details.
- Prevent mass assignment of protected fields.
- Apply suitable request-size limits.
- Consider rate limiting for sensitive or abuse-prone endpoints.
- Do not assume that a request originating from the application's own interface is trustworthy.

### Acceptance criteria

Direct API requests cannot bypass application authorization or validation.

## 9. Cross-Site Request Forgery and Cross-Site Scripting

### Requirements

- Follow Better Auth's supported protections for authentication-related requests.
- Configure trusted origins and cookie settings appropriately.
- Use the framework's standard protections for rendering user-provided text.
- Avoid rendering untrusted HTML directly.
- Sanitize content when HTML rendering is genuinely required.
- Avoid unsafe DOM manipulation.
- Do not disable framework security protections to resolve styling or integration issues.
- Review any rich-text or custom HTML feature separately before introducing it.

### Acceptance criteria

User-provided descriptions and customer details cannot execute arbitrary scripts in another user's browser.

## 10. Environment Variables and Secrets

### Requirements

- Maintain an `.env.example` containing placeholder values only.
- Keep actual secrets in local environment files excluded from version control or in the deployment platform's secret configuration.
- Never commit database credentials, authentication secrets, API keys, or private tokens.
- Never use a `NEXT_PUBLIC_` variable for a secret.
- Validate required environment variables during application startup or through an appropriate server-side configuration check.
- Use separate credentials for development and production where practical.
- Rotate any secret that is accidentally exposed.

### Acceptance criteria

A repository review and client-bundle review do not reveal application secrets.

## 11. PDF Generation and Export Security

### Requirements

- Generate PDFs only from authorized invoice data.
- Verify the authenticated user's ownership before generating an export.
- Validate invoice identifiers before processing requests.
- Avoid passing arbitrary untrusted HTML into a PDF renderer.
- Escape or safely render user-provided invoice and customer text.
- Apply reasonable limits to document size and the number of line items.
- Return an appropriate error when PDF generation fails.
- Do not expose server file paths or internal error traces in responses.
- Ensure temporary files, if used, are handled and cleaned up appropriately.

### Acceptance criteria

PDF generation cannot be used to retrieve another user's invoice or access unrelated server resources.

## 12. Logo Upload Security (Conditional)

This section applies only if logo uploads are approved for the MVP.

### Requirements

- Use the approved storage provider.
- Allow only supported image formats.
- Validate file type and size on the server.
- Do not trust a filename or client-provided MIME type as the only validation.
- Generate safe storage names instead of relying on arbitrary user filenames.
- Prevent uploaded content from being treated as executable application code.
- Restrict who can change a user's logo settings.
- Store only the necessary asset reference in MongoDB.
- Avoid exposing storage credentials in client-side code.
- Handle missing or unavailable assets gracefully.

### Acceptance criteria

Users cannot upload unsupported content or change another user's logo configuration.

## 13. Privacy and Data Minimization

### Requirements

- Store only information needed for the product's stated purpose.
- Do not collect payment information in the MVP, since subscriptions and payment processing are out of scope.
- Do not log passwords, authentication secrets, session tokens, or complete sensitive customer records.
- Avoid placing customer information in URLs unnecessarily.
- Keep application logs free of unnecessary personal information.
- Document what information is stored and why.
- Establish an appropriate approach to account deletion and associated customer and invoice records before release.
- Review backups and retention behavior as part of deployment planning.

### Acceptance criteria

The application does not collect unnecessary information or expose private records through routine logging and error reporting.

## 14. Error Handling and Logging

### Requirements

- Use controlled error responses.
- Log useful operational information without recording secrets.
- Avoid returning stack traces to end users.
- Distinguish validation failures, authentication failures, authorization failures, missing records, and server failures.
- Do not disclose whether another user's private records exist when doing so would reveal sensitive information.
- Keep production debugging details out of public responses.

### Acceptance criteria

Errors are useful for troubleshooting without disclosing sensitive application information.

## 15. Deployment Security

### Requirements

- Configure environment variables securely in Vercel.
- Configure MongoDB Atlas access rules for the deployed application.
- Use HTTPS in production.
- Configure authentication origins and cookies for the production domain.
- Ensure debugging features and verbose error output are not unnecessarily exposed.
- Review dependencies for known vulnerabilities.
- Run production build and security checks before release.
- Test access control against the deployed preview environment.
- Avoid using real customer records in test environments.

### Acceptance criteria

The deployed application follows the same authentication, authorization, and data-protection rules as the development environment.

## 16. Security Review Checklist

Before release, verify the following:

- [ ] Authentication is correctly configured.
- [ ] Protected routes and API operations require authentication.
- [ ] Ownership is checked for every customer and invoice operation.
- [ ] Cross-user access tests pass.
- [ ] Server-side validation is implemented.
- [ ] Financial totals are recalculated on the server.
- [ ] MongoDB credentials remain private.
- [ ] Secrets are not exposed through client bundles or API responses.
- [ ] Errors do not expose sensitive implementation details.
- [ ] PDF exports enforce authorization.
- [ ] Logo uploads are validated if the feature is included.
- [ ] Dependencies and production configuration have been reviewed.
- [ ] Account deletion and data-retention behavior have been decided.
- [ ] No critical or high-priority security issues remain unresolved.

## 17. Instructions for the AI Coding Tool

Before implementing or modifying a security-sensitive feature:

1. Read this document and the relevant sections of `docs/PRD.md` and `docs/ARCHITECTURE.md`.
2. Identify the relevant authentication, database, and API boundaries.
3. Explain how authorization and validation will be enforced.
4. Implement the smallest appropriate change.
5. Add tests for unauthorized access and invalid input.
6. Run the relevant checks.
7. Report what was tested and what remains unresolved.

Never remove a security check merely to make a feature work. If requirements conflict or a security decision is unclear, explain the issue and request approval before weakening protection.

## 18. Definition of Security Readiness

The MVP is ready for security review when authentication, server-side authorization, user-data ownership, input validation, financial integrity, secret management, and PDF export protections have been implemented and tested.

Passing this checklist is a baseline, not a guarantee that the application is free from security vulnerabilities.
