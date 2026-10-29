# Technical Architecture — Invoice Generator

## 1. Overview

The Invoice Generator will use a full-stack Next.js architecture with TypeScript, Tailwind CSS, Better Auth, MongoDB Atlas, and Vercel.

The frontend and backend will live in the same Next.js project. Next.js Route Handlers will expose server-side operations for invoice and customer management, while MongoDB Atlas will persist application data.

The architecture should remain simple enough for an MVP while supporting future extensions without requiring a complete rewrite.

## 2. Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Web framework | Next.js | Pages, layouts, routing, and server rendering |
| Language | TypeScript | Type safety and maintainability |
| Styling | Tailwind CSS | Responsive layouts and UI styling |
| Authentication | Better Auth | Registration, login, sessions, and authentication |
| Database | MongoDB Atlas | Persistent application data |
| Database access | MongoDB Node.js driver or Mongoose | Database operations and data modeling |
| Backend API | Next.js Route Handlers | Validated server-side operations |
| PDF generation | Suitable PDF library | Generate invoice PDFs |
| File storage | Vercel Blob, if needed | Logo and other approved uploaded assets |
| Hosting | Vercel | Application deployment |

Choose one primary MongoDB data-access approach during project setup. Do not introduce both the native driver and Mongoose without a clear requirement.

## 3. High-Level Architecture

```text
User's Browser
      |
      v
Next.js Application
  |              |
  v              v
Frontend      Route Handlers
                 |
                 v
          Authentication Check
                 |
                 v
       Input Validation and Rules
                 |
                 v
           MongoDB Atlas
                 |
                 v
         Persisted User Data

Invoice Data
      |
      v
PDF Generation
      |
      v
Downloadable Invoice PDF

Optional Logo Upload
      |
      v
Dedicated File Storage
```

All database operations involving private records must run on the server. The browser must never receive database credentials or unrestricted database access.

## 4. Recommended Project Structure

```text
invoice-generator/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── RULES.md
│   ├── TASKS.md
│   ├── TEST_PLAN.md
│   ├── SECURITY.md
│   ├── DECISIONS.md
│   └── MEMORY.md
├── public/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   └── invoices/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── invoices/
│   │   │   └── customers/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── invoices/
│   │   └── customers/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── validation/
│   │   └── pdf/
│   ├── models/
│   ├── services/
│   ├── types/
│   └── utils/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

This is a suggested structure, not a requirement to create every folder immediately. The coding tool should adapt it to the chosen Next.js configuration and add files as features are implemented.

## 5. Application Layers

### 5.1 Presentation layer

Responsible for:

- Registration and login screens.
- Dashboard and navigation.
- Invoice forms and previews.
- Invoice lists and details.
- Customer forms, if the customer directory is included.
- Responsive design and user feedback.

Use Tailwind CSS for styling and reusable components for repeated interface elements.

The presentation layer must not connect directly to MongoDB.

### 5.2 Authentication layer

Better Auth manages supported authentication flows and sessions.

The implementation must:

- Configure Better Auth according to its current supported integration.
- Use MongoDB as the configured database where supported.
- Protect private pages and server-side operations.
- Verify the authenticated session before accessing private data.
- Avoid exposing session secrets or private authentication configuration.

Protected page layouts improve navigation and user experience, but API handlers must independently enforce authentication and authorization.

### 5.3 API layer

Next.js Route Handlers will handle requests such as:

```text
POST   /api/invoices
GET    /api/invoices
GET    /api/invoices/[id]
PATCH  /api/invoices/[id]
DELETE /api/invoices/[id]

POST   /api/customers
GET    /api/customers
GET    /api/customers/[id]
PATCH  /api/customers/[id]
DELETE /api/customers/[id]
```

Customer routes are required only if the reusable customer directory is included in the MVP.

Each handler must:

1. Verify the user's session.
2. Validate the request.
3. Check ownership for existing resources.
4. Apply business rules.
5. Perform the database operation.
6. Return an appropriate response.
7. Handle errors without exposing secrets or sensitive internal details.

Use appropriate HTTP status codes and consistent response formats.

### 5.4 Service layer

Place reusable business logic in server-side service modules where appropriate.

Examples include:

- Invoice creation and updates.
- Invoice total calculations.
- Invoice number generation.
- Ownership checks.
- PDF data preparation.
- Customer management.

Avoid duplicating important calculation or authorization logic across several route handlers.

### 5.5 Database layer

Use a shared MongoDB connection utility and appropriate indexes.

The database layer must not be imported into client components or exposed through client-side bundles.

## 6. MongoDB Data Model

The following collections are recommended.

### 6.1 Users and authentication data

Better Auth will manage its required user and authentication records according to its configured MongoDB adapter.

Typical data may include:

- User identifier.
- Name.
- Email.
- Email verification state, if applicable.
- Authentication account records, if used.
- Session records.
- Timestamps.

Do not create a competing custom authentication system. Add application-specific profile fields only where needed.

### 6.2 Invoices collection

Recommended document structure:

```ts
type Invoice = {
  _id: ObjectId;
  ownerId: string;

  invoiceNumber: string;
  issueDate: Date;
  dueDate?: Date;

  currency: string;

  sender: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
  };

  customer: {
    customerId?: ObjectId;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };

  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;

  subtotal: number;
  total: number;

  notes?: string;
  paymentInstructions?: string;

  status?: "draft" | "sent" | "paid" | "overdue";

  createdAt: Date;
  updatedAt: Date;
};
```

This is a conceptual schema. The implementation must use the chosen database library's appropriate types and validation rules.

Important requirements:

- `ownerId` must identify the authenticated owner.
- The server must calculate line totals, subtotal, and total.
- `currency` must contain a supported currency code.
- Tax and discount fields should not be implemented until their rules are approved.
- Avoid trusting ownership or calculated totals supplied by the client.
- Invoice numbers must be unique according to the agreed numbering strategy.

For financial calculations, use a deliberate precision strategy. A robust implementation may store monetary amounts as integer minor units or use a suitable decimal representation rather than relying on unrestricted floating-point arithmetic.

### 6.3 Customers collection

If a reusable customer directory is included, use a collection with fields such as:

```ts
type Customer = {
  _id: ObjectId;
  ownerId: string;

  name: string;
  email?: string;
  phone?: string;
  address?: string;

  createdAt: Date;
  updatedAt: Date;
};
```

A customer record must always belong to one user. When a customer is selected for an invoice, the server must verify that the customer belongs to the authenticated user.

### 6.4 Indexes

Recommended initial indexes:

- Invoices: `{ ownerId: 1, updatedAt: -1 }`
- Invoices: `{ ownerId: 1, invoiceNumber: 1 }` with a unique constraint if the invoice-number policy supports it.
- Customers: `{ ownerId: 1, name: 1 }`

The unique invoice-number index must match the final numbering policy. If invoice numbers are unique only within an owner's account, enforce uniqueness on the owner and invoice number combination.

## 7. Invoice Calculation Rules

The server is the authoritative source for invoice totals.

For each line item:

```text
lineTotal = quantity × unitPrice
```

Then:

```text
subtotal = sum(line totals)
total = subtotal
```

The final rule applies to the MVP until tax and discount requirements are approved.

Requirements:

- Validate quantity and unit price.
- Reject invalid negative values unless a future approved feature explicitly supports them.
- Use a consistent currency precision strategy.
- Recalculate totals whenever line items change.
- Use the same calculations for stored data and PDF output.
- Test rounding behavior, fractional quantities if supported, and large values.

## 8. PDF Generation

PDF generation should use a server-side library or another reliable approach that does not expose sensitive server dependencies.

The PDF generator must:

- Receive validated invoice data.
- Use authoritative server-calculated totals.
- Display invoice number, dates, parties, items, currency, and totals.
- Handle long descriptions and multiple pages.
- Produce a readable and consistently formatted document.
- Return a downloadable PDF with an appropriate content type and filename.

Generate PDFs on demand by default. Persistent PDF storage is not required for the MVP.

## 9. File Storage

If logo uploads are included, use a dedicated file-storage service such as Vercel Blob.

Requirements:

- Validate file type and size.
- Use safe file naming and storage paths.
- Avoid exposing private upload tokens to the browser.
- Verify ownership when managing private files.
- Store only the necessary file reference and metadata in MongoDB.
- Do not store image binaries directly in invoice documents.

If uploads are excluded from the initial release, use text-based sender details and leave logo upload functionality for a later iteration.

## 10. Environment Configuration

Use environment variables for credentials and service configuration.

The `.env.example` file should document the required variable names without containing real secrets.

Expected categories include:

- MongoDB connection URI.
- Better Auth secret.
- Application base URL.
- File-storage credentials, only if uploads are implemented.

Never commit a real `.env` file containing secrets. Ensure server-only credentials are not exposed through public environment variable prefixes.

## 11. Deployment Architecture

Deploy the Next.js application to Vercel and use MongoDB Atlas as the managed database.

Before production deployment:

1. Configure environment variables for the correct environment.
2. Verify the MongoDB network and access configuration.
3. Configure the application's production URL and authentication settings.
4. Run database and authentication smoke tests.
5. Verify authorization and cross-user access protections.
6. Test invoice creation and PDF downloads.
7. Confirm that production logs do not expose secrets or unnecessary personal data.

## 12. Scalability and Maintainability

For the MVP:

- Use a single Next.js application.
- Keep database access server-side.
- Reuse validated business logic.
- Add indexes for common queries.
- Paginate invoice lists when appropriate.
- Keep the currency implementation extensible.
- Avoid introducing microservices without a demonstrated need.

The architecture may evolve as the product grows, but the initial implementation should favor simplicity, clear boundaries, and testability.

## 13. Architecture Acceptance Criteria

The architecture is correctly implemented when:

- The Next.js application can connect to MongoDB Atlas securely.
- Better Auth manages authentication and sessions.
- Private routes and APIs verify authentication.
- Every invoice operation enforces ownership.
- Invoice totals are calculated on the server.
- NGN and USD values are persisted and rendered correctly.
- PDFs are generated from authoritative invoice data.
- Private credentials remain server-side.
- Database queries use appropriate indexes.
- The application can be deployed to Vercel with documented environment configuration.

## 14. Open Architecture Decisions

Record the final decisions in `docs/DECISIONS.md`:

- Whether the native MongoDB driver or Mongoose will be used.
- Invoice-number format and uniqueness rules.
- Final PDF library.
- Whether the reusable customer directory is included in the initial MVP.
- Whether logo uploads are included in the initial MVP.
- The chosen monetary precision strategy.

Do not silently invent requirements when a decision materially affects data integrity, security, or user-visible behavior.