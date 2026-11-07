# Invoice Generator — Project Overview & Documentation

## 1. Project Overview

A modern, production-ready web-based invoice generator built with Next.js, TypeScript, Tailwind CSS, Better Auth, and MongoDB Atlas.

The application allows freelance professionals and business owners to create, manage, issue, download, and share professional invoices in both Nigerian Naira (NGN) and US Dollars (USD) with complete data isolation, historical logo preservation, and instant PDF generation.

---

## 2. Technology Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Programming Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Better Auth (Credential & Google OAuth)
- **Database:** MongoDB Atlas (native official driver)
- **PDF Generation:** `pdf-lib` (pure vector A4 PDF generation on client and server)
- **Asset Storage:** Dual-mode persistent storage (Vercel Blob with seamless MongoDB Binary Grid fallback)
- **Deployment:** Vercel

---

## 3. Core Features

### A. Business Logo Upload & Historical Preservation (Mandatory Rule)
- **Drag-and-Drop & File Picker:** Supports PNG, JPG, JPEG, and WebP up to 2 MB.
- **Preview & Management:** Live image preview in invoice editor with "Replace" and "Remove" controls.
- **Historical Logo Preservation:**
  - New invoices automatically snapshot the issuer's active business logo at the time of creation.
  - Previously issued invoices retain their snapshot permanently; replacing or deleting a profile logo **never** mutates historical invoices.
  - Safe asset garbage collection: Assets referenced by any historical invoice cannot be deleted.
- **Zero-Config Storage:** Supports Vercel Blob when `BLOB_READ_WRITE_TOKEN` is present, or fallback to the secure MongoDB `assets` collection streaming through `/api/assets/[id]`.

### B. Direct Vector PDF Download
- **Dedicated "Download PDF" Button:** Clean action button placed prominently alongside the legacy "Print / PDF" option.
- **Professional A4 Vector Layout:** Generated using `pdf-lib` with exact points measurement (595.28 x 841.89 pt).
- **Proportional Logo Embedding:** Embedded with aspect ratio strictly preserved (max 140x55 pt).
- **Multi-page Support:** Automatic pagination and table re-heading when items exceed single-page height.
- **Standard Typography & Formatting:** Standard Helvetica typography, WinAnsi-safe currency formatting (`NGN 50,000.00` / `$50.00`), sender/recipient details, line items table, and payment instructions.
- **Standardized File Naming:** Automatically names downloads `Invoice-[invoiceNumber].pdf`.

### C. Multi-Channel Invoice Sharing
- **Dedicated "Share Invoice" Modal:** Triggered from invoice detail views.
- **Secure Unguessable Public Link:**
  - Generates a 32-character cryptographically secure token (`/share/[token]`).
  - Owner-controlled toggle to **Enable Link** or **Revoke Link** on demand.
  - One-click copy with visual "Copied!" feedback and quick preview link.
- **Native Device Sharing:** Integrates with `navigator.share` for system dialogs (AirDrop, WhatsApp, nearby sharing) on mobile and modern desktop browsers.
- **Email Sharing:** Pre-formatted `mailto:` link with invoice number, recipient, total amount, and secure link.
- **Social Sharing:** Direct share links for WhatsApp (`https://wa.me/?text=...`) and LinkedIn.

### D. Public Client Invoice View (`/share/[token]`)
- Unauthenticated, secure view designed specifically for clients.
- Sanitized payload: Never leaks owner IDs, database ObjectIDs, or private internal notes.
- Includes client-side **Download PDF** and **Print Invoice** buttons.
- Graceful handling of invalid, disabled, or revoked links.

### E. Financial Calculations & Data Security
- 2-decimal precision integer arithmetic eliminating floating-point rounding errors.
- Authoritative server-side recalculation of line totals, subtotals, and totals.
- Strict per-user data isolation: Invoices and customer records are scoped strictly to `ownerId`.

---

## 4. API Endpoints

| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/invoices` | List invoices for authenticated user | Yes |
| `POST` | `/api/invoices` | Create invoice with logo snapshot & share token | Yes |
| `GET` | `/api/invoices/[id]` | Get single invoice details | Yes |
| `PATCH` | `/api/invoices/[id]` | Update invoice fields | Yes |
| `DELETE` | `/api/invoices/[id]` | Delete invoice | Yes |
| `GET` | `/api/invoices/[id]/share` | Get public link status & share URL | Yes |
| `POST` | `/api/invoices/[id]/share` | Enable public sharing | Yes |
| `DELETE` | `/api/invoices/[id]/share` | Revoke public sharing | Yes |
| `GET` | `/api/invoices/share/[token]` | Fetch sanitized invoice for client view | No |
| `GET` | `/api/profile/logo` | Retrieve user's current business profile logo | Yes |
| `POST` | `/api/profile/logo` | Upload new business profile logo (max 2MB) | Yes |
| `DELETE` | `/api/profile/logo` | Clear profile logo (preserves historical assets) | Yes |
| `GET` | `/api/assets/[id]` | Stream binary image asset from MongoDB | No |

---

## 5. Verification & Testing

Run all unit, calculation, and enhancement tests:
```bash
npm test
```

Run TypeScript verification:
```bash
npx tsc --noEmit
```

Build production bundle:
```bash
npm run build
```

---

## 6. Environment Variables

See `.env.example` for reference:
- `MONGODB_URI`: MongoDB Atlas connection string.
- `MONGODB_DB_NAME`: Database name (default `invoice_generator`).
- `BETTER_AUTH_SECRET`: Random 32+ character authentication secret.
- `BETTER_AUTH_URL`: Canonical URL of the application.
- `NEXT_PUBLIC_APP_URL`: Public-facing application URL used for public share links.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Optional Google OAuth credentials.
- `BLOB_READ_WRITE_TOKEN`: Optional Vercel Blob token for cloud image storage.
