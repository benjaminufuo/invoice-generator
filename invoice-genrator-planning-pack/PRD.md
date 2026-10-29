# Product Requirements Document (PRD)
## Invoice Generator

**Status:** MVP requirements draft  
**Product type:** Web application  
**Primary audience:** Individual users and freelancers  
**Version:** 1.0

## 1. Product Overview

The Invoice Generator is a web application that enables individuals to create, manage, and download professional invoices.

Users can register for an account, save their invoices, manage customer details, choose a currency for each invoice, and generate downloadable PDF documents.

Each user manages their own invoices. The application does not support shared workspaces or collaborative invoice management in the MVP.

## 2. Problem Statement

Creating professional invoices manually can be time-consuming and inconsistent. Users need a straightforward way to prepare invoices, calculate totals, maintain invoice records, and produce documents they can share with clients.

The product should make this process simple while keeping invoice records securely stored and accessible to their owners.

## 3. Product Goals

The MVP should:

- Make invoice creation straightforward.
- Produce professional, readable invoices.
- Support multiple currencies, including NGN and USD.
- Allow users to save, edit, view, and delete invoices.
- Generate downloadable PDF invoices.
- Keep each user's invoice and customer data private.
- Provide a responsive experience across desktop, tablet, and mobile.
- Establish a maintainable foundation for future features.

## 4. Target Users

### Individual users

Freelancers, consultants, independent service providers, and other individuals who need to prepare invoices for their customers.

### Primary use cases

- Creating an invoice for a new customer.
- Preparing another invoice for an existing customer.
- Editing a draft invoice.
- Downloading a finished invoice as a PDF.
- Finding a previously saved invoice.
- Managing invoice records from a personal dashboard.

## 5. MVP Scope

### 5.1 Authentication

Users must be able to:

- Register an account.
- Log in and log out.
- Maintain an authenticated session.
- Access protected application pages.
- Be redirected appropriately when attempting to access protected pages without authentication.

Use Better Auth for authentication, with MongoDB as the configured database.

Authentication-related data must be handled securely. The implementation must follow the authentication library's supported configuration and session-management practices.

### 5.2 Dashboard

The dashboard should provide a clear overview of the user's invoice activity.

It should include:

- A summary of invoice records.
- A primary action to create a new invoice.
- A list of recent invoices.
- Access to invoice management.
- Access to account and business-profile settings, if included in the agreed implementation.

Only the authenticated user's data may appear in the dashboard.

Do not invent financial analytics or business metrics that are not supported by saved invoice data.

### 5.3 Invoice Creation

Users must be able to create an invoice containing the following information.

**Invoice details**
- Invoice number.
- Issue date.
- Due date, if applicable.
- Currency.
- Invoice status, where supported.

**Sender details**
- Individual or business name.
- Contact information.
- Address, if supplied.
- Logo, if logo uploads are included.

**Customer details**
- Customer name or business name.
- Contact information, where supplied.
- Billing address, where supplied.

**Line items**
- Item or service description.
- Quantity.
- Unit price.
- Calculated line total.

**Additional information**
- Optional notes.
- Optional payment instructions, if included in the design.

Required fields must be clearly identified. Validate input on the server, not only in the browser.

### 5.4 Invoice Calculations

For each line item:

Line total = Quantity × Unit price.

Subtotal = Sum of all line totals.

The invoice total equals the subtotal in the initial MVP because tax and discount rules have not yet been finalized.

Calculations must be consistent between the user interface, persisted invoice data, and generated PDF. Do not rely on client-submitted totals as the authoritative values; recalculate totals on the server.

Use appropriate decimal arithmetic and currency precision to avoid floating-point rounding errors.

### 5.5 Multi-Currency Support

The MVP must support multiple currencies, including:

- Nigerian Naira (NGN).
- United States Dollar (USD).

NGN is the recommended default currency, but the user must be able to select another supported currency when creating an invoice.

Requirements:

- Store the currency as a standardized currency code.
- Display the appropriate currency symbol or code.
- Format amounts according to the selected currency.
- Use the same currency consistently throughout an invoice.
- Include the selected currency in the generated PDF.
- Do not combine amounts in different currencies within one invoice.
- Do not perform automatic currency conversion.
- Do not assume that a currency conversion rate is needed to calculate the invoice total.

The architecture should allow additional currencies to be added later without redesigning the invoice data model.

### 5.6 Invoice Management

Users must be able to:

- View their saved invoices.
- Open an invoice's details.
- Edit an invoice.
- Delete an invoice after an appropriate confirmation.
- Find invoices in their invoice list.

Invoice lists should remain usable as the number of saved records increases.

Search, sorting, and filtering should be implemented according to the task breakdown and agreed MVP priorities.

### 5.7 Customer Details

Customer information must be associated with the invoice and its owner.

The implementation may use a reusable customer directory to make repeat invoicing easier, provided it remains within the agreed scope.

Every customer record must be private to its owner. A user must not be able to retrieve or modify another user's customer records.

### 5.8 PDF Generation

Users must be able to generate and download a professional PDF for a saved invoice.

The PDF must:

- Present sender and customer information clearly.
- Include invoice number and dates.
- Display line items and their calculated totals.
- Show the correct currency.
- Display subtotal and final total.
- Include notes or payment instructions when supplied.
- Use readable typography and appropriate spacing.
- Handle longer descriptions and multiple line items without clipping content.

PDF generation should use the same authoritative invoice data and calculation rules as the application.

Generate the PDF on demand by default. Do not store a duplicate PDF file for every invoice unless a future requirement justifies it.

### 5.9 Tax and Discounts

**Decision: Deferred.**

Tax and discount calculations are not finalized for the initial implementation.

Until their rules are agreed:

- Do not apply automatic taxes.
- Do not apply automatic discounts.
- Do not invent tax rates or jurisdiction-specific assumptions.
- Do not include tax or discount amounts in invoice totals.
- Keep the data model extensible enough to accommodate these features later.

### 5.10 Pricing and Payments

The MVP is free of subscription and payment-processing functionality.

Exclude:

- Paid plans.
- Subscription management.
- Checkout.
- Payment gateway integration.
- Billing for access to the application.

Payment instructions that a user manually enters on an invoice are distinct from payment processing by the application.

### 5.11 Storage

Use MongoDB Atlas to store application data, including users' invoice records and customer information.

Generate PDFs on demand and provide downloads rather than storing duplicate PDF copies by default.

If logo uploads are included, use a dedicated file-storage service, such as Vercel Blob, rather than storing image binaries directly in ordinary invoice documents.

Store file references and relevant metadata in MongoDB where needed. Validate uploaded files and protect access to private assets.

### 5.12 Privacy and Individual Ownership

Every user manages their own invoices and customer records.

Requirements:

- Every invoice must have an owner identifier.
- Every customer record must have an owner identifier or an equivalent secure ownership relationship.
- Server-side operations must verify that the authenticated user owns the requested resource.
- Users must not be able to access another user's data by changing an ID in a URL or API request.
- Unauthorized access attempts must fail safely.
- Authentication and authorization must be tested independently.

Shared workspaces, collaborative editing, and cross-user invoice sharing are outside the MVP.

## 6. User Flow

### New user

1. Opens the application.
2. Registers an account.
3. Signs in and reaches the protected dashboard.
4. Starts creating an invoice.
5. Enters invoice and customer details.
6. Adds one or more line items.
7. Selects a currency.
8. Reviews the calculated totals.
9. Saves the invoice.
10. Downloads the invoice as a PDF.

### Returning user

1. Signs in.
2. Opens the dashboard.
3. Selects a saved invoice or creates a new one.
4. Views or edits the invoice.
5. Saves any changes.
6. Downloads the updated PDF if needed.

## 7. Non-Functional Requirements

### Security
- Secure authentication and session handling.
- Server-side authorization for all private resources.
- Environment variables for secrets.
- No sensitive credentials in client-side bundles or source control.
- Validation of all untrusted input.

### Performance
- Keep common dashboard and invoice operations responsive.
- Avoid unnecessary database queries.
- Use pagination or another suitable strategy for large invoice lists.

### Accessibility
- Use semantic HTML.
- Provide labels for form fields.
- Support keyboard navigation.
- Maintain appropriate text contrast.
- Show understandable validation and error messages.

### Responsiveness
- Support desktop, tablet, and mobile screens.
- Keep invoice forms usable on narrow screens.
- Ensure generated PDFs remain readable regardless of screen size.

### Maintainability
- Use TypeScript consistently.
- Use reusable components.
- Keep database access and business logic organized.
- Follow the project's Tailwind CSS conventions.
- Avoid unnecessary dependencies and duplicate implementations.

## 8. Acceptance Criteria

The MVP is acceptable when:

1. Users can register, log in, and log out.
2. Unauthenticated users cannot access protected invoice data.
3. An authenticated user can create and save an invoice.
4. Saved invoices remain available after the user signs out and returns.
5. Users can view, edit, and delete their own invoices.
6. NGN and USD invoices display and calculate correctly.
7. Line totals, subtotals, and final totals are calculated consistently.
8. Users can download a correctly formatted PDF.
9. Invoice data is validated on the server.
10. Users cannot read, modify, or delete another user's invoices by changing resource identifiers.
11. The interface works on desktop and mobile.
12. Tax, discounts, subscriptions, and payment processing are not accidentally introduced into the MVP.

## 9. Future Considerations

Possible future enhancements include:

- Configurable tax and discount rules.
- Multiple invoice templates.
- Logo and branding customization.
- Invoice email delivery.
- Additional currencies.
- Recurring invoices.
- Invoice status workflows.
- Reporting and analytics.
- Paid plans and subscription functionality.

These features must not be implemented in the MVP without an explicit scope change.

## 10. Open Decisions

The following details should be finalized before implementation of the affected features:

- Invoice numbering format and uniqueness strategy.
- Final PDF template design.
- Whether logo uploads are part of the first release.
- Whether to implement a reusable customer directory in the first release.
- Whether email/password is the only authentication method.
- Whether invoice status options such as draft, sent, and paid are needed initially.

Until resolved, use the simplest safe approach consistent with the approved MVP and record assumptions in `docs/DECISIONS.md`.