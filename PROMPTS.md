# PROMPTS.md — AI Coding Prompts for the Invoice Generator

## 1. Purpose

This document contains reusable prompts for guiding an AI coding tool through the Invoice Generator project.

The prompts are designed to encourage documentation-first planning, controlled implementation, incremental testing, and careful review.

**Important:** These prompts guide the AI coding tool. They do not authorize it to ignore project requirements, make unapproved product decisions, or implement the entire application in one uncontrolled step.

Before using these prompts, make sure the project's planning documents are available in the repository.

---

## 2. Prompt 1 — Inspect the Existing Repository

Use this prompt first, before allowing the AI coding tool to make substantial changes.

```text
You are working on an Invoice Generator web application.

Your first task is to inspect and understand the existing repository. Do not immediately start building features or rewriting files.

Read these project documents if they exist:

- README.md
- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/DESIGN.md
- docs/RULES.md
- docs/TASKS.md
- docs/TEST_PLAN.md
- docs/SECURITY.md
- docs/DECISIONS.md
- docs/MEMORY.md

Inspect the repository structure, package.json, installed dependencies, existing routes, layouts, components, styles, authentication setup, database integration, environment configuration, and tests.

The agreed technology direction is:

- Next.js
- TypeScript
- Tailwind CSS
- Better Auth
- MongoDB Atlas
- Next.js Route Handlers
- Vercel

Do not replace the agreed stack without approval.

Identify:
1. What already exists.
2. What works.
3. What is incomplete.
4. What conflicts with the project documents.
5. What dependencies or configuration are missing.
6. What security risks or architectural concerns need attention.
7. Which implementation phase should happen next.

Do not expose secrets when inspecting environment files. Never print actual credentials or tokens.

Before making major changes, provide a concise repository assessment and a proposed implementation plan.

Do not implement the entire application during this inspection phase.
```

---

## 3. Prompt 2 — Review and Finalize Unresolved Decisions

Use this prompt after repository inspection and before implementing features affected by unresolved choices.

```text
Review docs/DECISIONS.md and identify the decisions that remain unresolved.

For each decision that materially affects product behavior, data integrity, security, or architecture:

1. Explain why the decision matters.
2. Present the practical options.
3. Explain the main trade-offs.
4. Recommend one option suitable for this MVP.
5. Ask for my approval before treating the recommendation as final.

Pay particular attention to:

- Invoice numbering and uniqueness.
- Invoice statuses.
- PDF template design.
- Logo uploads.
- Authentication methods.
- MongoDB driver versus Mongoose.
- PDF generation library.
- Monetary precision.
- Customer deletion behavior.
- Account deletion and data retention.

Do not silently decide important product behavior.

Once I approve a decision, update docs/DECISIONS.md and any affected project documents. Clearly distinguish approved decisions from recommendations that remain unapproved.

Do not start implementing unrelated features during this review.
```

---

## 4. Prompt 3 — Establish the Foundation

Use this prompt after repository inspection and approval of the necessary foundational decisions.

```text
Implement the foundation phase described in docs/TASKS.md.

Before coding, read:

- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/DESIGN.md
- docs/RULES.md
- docs/SECURITY.md
- docs/DECISIONS.md

Inspect the current repository and reuse suitable existing code rather than rewriting everything unnecessarily.

Establish or complete the agreed application foundation:

- Next.js and TypeScript configuration.
- Tailwind CSS configuration.
- Global styles and design tokens.
- Reusable UI components.
- Responsive application layout.
- Consistent form styling.
- Loading, empty, error, and disabled states.
- Appropriate environment-variable handling.

Do not implement the entire invoice workflow yet.

Follow the existing repository's package manager and compatible dependency versions. Avoid unnecessary dependencies.

After implementation:

1. Run the relevant checks.
2. Report files created or modified.
3. Explain the important implementation choices.
4. List tests and checks actually run.
5. Report failures or unresolved issues.
6. Confirm whether the foundation phase meets its acceptance criteria.

Do not claim success for checks that were not executed.
```

---

## 5. Prompt 4 — Implement Authentication

```text
Implement the authentication phase in docs/TASKS.md.

Read the relevant project documents, especially:

- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/RULES.md
- docs/SECURITY.md
- docs/DECISIONS.md

Use Better Auth with the installed version's official documentation.

Implement the approved authentication methods and configure the required database integration.

Requirements:

- Account registration.
- Sign-in.
- Sign-out.
- Appropriate session handling.
- Protected application routes.
- Server-side authentication checks.
- Safe validation and error handling.
- Secure environment-variable usage.

Do not build customer management or invoice management as part of this phase.

Do not invent authentication methods that have not been approved.

Verify that unauthenticated users cannot access protected features and that invalid sessions cannot authorize protected operations.

Add or update tests for authentication behavior.

Run the relevant checks and report the results. Identify any configuration that still requires my input, without exposing secrets.
```

---

## 6. Prompt 5 — Implement Database Access and Customer Management

```text
Implement the database and customer-management phases described in docs/TASKS.md.

Read the relevant project documents before coding.

First, verify the approved MongoDB data-access approach and compatibility with Better Auth.

Implement:

- A reusable MongoDB connection.
- The approved customer data structure.
- Necessary indexes.
- Server-side data-access functions.
- Customer creation.
- Customer listing.
- Customer viewing where required.
- Customer editing.
- Customer deletion according to the approved deletion policy.
- Server-side validation.
- Ownership enforcement.

Every customer must belong to the authenticated user.

Never trust a user ID supplied by the browser. Derive ownership from the verified server-side session and enforce it in database queries.

Do not build the complete invoice workflow in this phase.

Test:
- Valid customer creation.
- Invalid input.
- Editing and deletion.
- Persistence after refreshing.
- Requests for nonexistent customers.
- Attempts by one user to access another user's customer.

Run the relevant tests, TypeScript checks, and linting where available.

Report the files changed, checks performed, failures, and remaining issues.
```

---

## 7. Prompt 6 — Implement Invoice Creation and Management

```text
Implement invoice creation and management according to docs/PRD.md, docs/ARCHITECTURE.md, docs/RULES.md, docs/SECURITY.md, docs/DECISIONS.md, and docs/TASKS.md.

Before coding, confirm that all decisions required for invoice implementation have been approved.

Implement the approved functionality:

- Invoice creation.
- Customer selection.
- Issuer and customer details.
- Invoice date and due date.
- Invoice line items.
- Adding and removing line items.
- Quantity and unit-price validation.
- Invoice calculations.
- Currency selection.
- Invoice-number generation.
- Invoice persistence.
- Invoice details.
- Invoice editing.
- Invoice deletion.
- The approved invoice status workflow.

Financial rules:

- Calculate line totals from validated quantities and prices.
- Calculate the subtotal from line totals.
- Recalculate all totals on the server.
- Use the approved monetary precision strategy.
- Support only the approved currencies.
- Keep one currency per invoice.
- Do not automatically convert currencies.
- Do not introduce taxes or discounts unless approved.

Security requirements:

- Verify authentication on protected operations.
- Enforce invoice ownership.
- Validate all incoming data on the server.
- Never trust client-submitted totals or owner IDs.
- Prevent one user from reading, editing, deleting, or exporting another user's invoices.

Build the functionality incrementally. Test calculations and ownership isolation before moving on.

After implementation, report the files changed, tests executed, results, and unresolved issues.
```

---

## 8. Prompt 7 — Build the Dashboard

```text
Implement the dashboard described in docs/PRD.md, docs/DESIGN.md, and docs/TASKS.md.

Inspect existing dashboard components before creating new ones.

The dashboard should provide clear navigation, an invoice list, relevant invoice summaries, and a prominent action for creating an invoice.

Requirements:

- Use actual saved data.
- Display information belonging only to the authenticated user.
- Include appropriate loading, empty, and error states.
- Keep navigation consistent with the approved application structure.
- Ensure responsive behavior on mobile, tablet, and desktop.
- Use the established design system.
- Avoid hard-coded production statistics.
- Do not introduce subscriptions, payments, team workspaces, or unrelated features.

Test the dashboard with an account containing no invoices and another account containing several invoices.

Verify that dashboard data does not expose another user's records.

Run the relevant checks and report the results.
```

---

## 9. Prompt 8 — Implement Invoice Preview and PDF Export

```text
Implement invoice preview and PDF export according to the approved requirements.

Read:

- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/DESIGN.md
- docs/RULES.md
- docs/SECURITY.md
- docs/DECISIONS.md
- docs/TEST_PLAN.md

Use the approved PDF generation library and template.

Requirements:

- Display issuer and customer details.
- Display invoice number and dates.
- Display all line items.
- Display quantities, unit prices, currency, and totals.
- Keep preview data consistent with the saved invoice.
- Generate downloadable PDFs.
- Handle long descriptions and multiple pages.
- Format monetary values correctly.
- Handle missing optional information gracefully.
- Verify invoice ownership before generating exports.
- Avoid exposing internal server errors or file paths.

Generate PDFs on demand by default. Do not add permanent PDF storage unless the requirements have changed and the change is approved.

Test invoices with one item, multiple items, long descriptions, different supported currencies, and enough items to require multiple pages.

Verify that an unauthorized user cannot download another user's invoice.

Report the actual test results and any limitations.
```

---

## 10. Prompt 9 — Security Review

```text
Perform a focused security review of the implemented application.

Read docs/SECURITY.md, docs/PRD.md, docs/ARCHITECTURE.md, and docs/TEST_PLAN.md.

Review the existing implementation rather than assuming it is secure because it follows the intended architecture.

Examine:

- Authentication and session handling.
- Protected routes.
- Server-side authorization.
- Customer ownership checks.
- Invoice ownership checks.
- PDF export authorization.
- Input validation.
- Financial calculations.
- MongoDB queries.
- Mass-assignment risks.
- Environment-variable exposure.
- Error handling.
- Dependency risks.
- File uploads, if implemented.
- Account deletion and data-retention behavior.

Attempt to identify realistic ways a user could bypass the intended restrictions.

Prioritize findings by severity and explain their impact.

Do not make broad or destructive changes without explaining them. Fix confirmed issues in small, reviewable changes, add regression tests, and run the relevant checks.

Clearly distinguish confirmed vulnerabilities from potential risks that require further investigation.

Never claim that a complete security audit has been performed if only a limited review was possible.
```

---

## 11. Prompt 10 — Testing and Quality Assurance

```text
Execute the testing plan in docs/TEST_PLAN.md against the current repository.

Inspect the existing test setup and use the configured tools where appropriate.

Test the core user journeys, including:

- Registration and sign-in.
- Protected routes.
- Customer management.
- Invoice creation and editing.
- Invoice calculations.
- Currency handling.
- Invoice numbering.
- PDF export.
- User ownership isolation.
- Error handling.
- Responsive behavior where testable.

Run the available:

- Unit tests.
- Integration tests.
- End-to-end tests.
- TypeScript checks.
- Linting.
- Production build.

Do not modify application behavior merely to make a test pass.

For every failure, identify whether it is caused by a defect, a test issue, missing configuration, or an unavailable dependency.

Fix confirmed defects in small increments and rerun affected tests.

Produce a clear report showing passed, failed, skipped, and blocked checks.

Do not report skipped or unexecuted tests as passing.
```

---

## 12. Prompt 11 — Preview Deployment and Production Readiness

```text
Prepare the application for deployment to Vercel.

Read docs/ARCHITECTURE.md, docs/SECURITY.md, docs/TEST_PLAN.md, and docs/DECISIONS.md.

First, inspect the current deployment configuration and production build.

Verify:

- Required environment-variable names.
- Better Auth production configuration.
- MongoDB Atlas connectivity and access rules.
- Production authentication origins and cookie settings.
- Build and runtime compatibility.
- PDF generation compatibility with the deployed environment.
- Error handling.
- Logging.
- Secret management.
- Database and authentication configuration.

Do not request that I paste secrets into chat or commit secrets to the repository.

Provide clear instructions for any configuration that requires my manual action.

Use a preview deployment first. After deployment, test registration, sign-in, customer management, invoice creation, and PDF download.

Do not promote to production without my approval.

Report the deployment result, checks performed, unresolved configuration, and known limitations.
```

---

## 13. Prompt 12 — Continue Work Across Sessions

Use this prompt when returning to the project after an earlier coding session.

```text
Continue working on the existing Invoice Generator repository.

Before making changes:

1. Read docs/MEMORY.md and README.md.
2. Read the relevant sections of docs/PRD.md, docs/ARCHITECTURE.md, docs/RULES.md, docs/DECISIONS.md, and docs/TASKS.md.
3. Inspect the repository's current state and Git status.
4. Review the most recent implementation notes, tests, and known issues.
5. Identify what has actually been completed and what remains unfinished.

Do not assume the previous session's summary is perfectly accurate. Verify the current repository.

Recommend the next smallest useful task.

Do not repeat completed work, rewrite unrelated components, or expand the MVP scope.

Before making substantial changes, state what you intend to do. After implementation, run the relevant checks and update docs/MEMORY.md if the project state has materially changed.

Report files changed, tests executed, results, and remaining work.
```

---

## 14. Prompt 13 — Final Code Review

```text
Perform a final review of the Invoice Generator MVP before release consideration.

Use the approved project documents as the source of truth.

Review the implementation for:

- Functional completeness.
- Alignment with the PRD.
- Architecture consistency.
- TypeScript quality.
- Component reuse and maintainability.
- Responsive design.
- Accessibility.
- Invoice calculation accuracy.
- Currency formatting.
- Authentication and ownership isolation.
- PDF export correctness.
- Error handling.
- Dependency and configuration risks.
- Test coverage.
- Production build readiness.

Do not introduce new features during this review.

List findings by severity and reference the relevant files. Fix straightforward confirmed defects in small, reviewable changes, and rerun affected checks.

Produce a final report containing:

1. Features verified.
2. Tests and checks actually executed.
3. Confirmed issues fixed.
4. Outstanding defects.
5. Configuration still requiring manual action.
6. Deferred features that remain out of scope.
7. Whether the application is ready for deployment, needs more work, or is blocked.

Do not claim the application is production-ready if critical checks remain incomplete.
```

---

## 15. Recommended Prompt Execution Order

Use the prompts in this order:

1. Repository inspection.
2. Review unresolved decisions.
3. Establish the foundation.
4. Implement authentication.
5. Implement database access and customer management.
6. Implement invoice creation and management.
7. Build the dashboard.
8. Implement invoice preview and PDF export.
9. Conduct the security review.
10. Run testing and quality assurance.
11. Prepare and verify a preview deployment.
12. Perform the final code review.
13. Approve production deployment only after reviewing the results.

Some tasks may be split into smaller steps if the repository is large or the AI coding tool struggles with the scope.

## 16. Rules for Using These Prompts

- Use one major prompt at a time.
- Review the plan before allowing significant changes.
- Keep the AI coding tool focused on the current phase.
- Require it to inspect existing code before editing.
- Ask it to explain architectural changes.
- Verify tests rather than trusting claims.
- Keep a working Git history and review diffs.
- Approve unresolved product decisions explicitly.
- Do not paste secrets into prompts.
- Do not allow unrelated feature expansion.

**Final instruction:** The objective is not to generate the largest amount of code in one attempt. The objective is to build a reliable, maintainable invoice generator through small, verifiable steps.
