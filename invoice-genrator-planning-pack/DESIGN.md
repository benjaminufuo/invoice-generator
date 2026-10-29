# Design System and UI/UX Guidelines
## Invoice Generator

## 1. Design Vision

Create a polished, modern, trustworthy invoice generator that feels like a well-designed SaaS product.

The interface should prioritize clarity, simplicity, and efficient workflows. Users should be able to create an invoice without feeling overwhelmed by unnecessary controls or complicated forms.

The visual quality should be comparable to modern productivity products: clean layouts, consistent spacing, clear typography, restrained use of color, and purposeful interactions.

Do not create a generic dashboard filled with unnecessary cards, gradients, charts, or decorative elements.

## 2. Design Principles

### Clarity first
Make invoice details, totals, actions, and navigation easy to understand.

### Professional appearance
The application should look appropriate for freelancers, consultants, and small business owners.

### Minimal friction
Keep the invoice creation workflow straightforward and avoid unnecessary steps.

### Consistency
Use shared design tokens and reusable components across all application pages.

### Responsive by default
Design for desktop, tablet, and mobile rather than shrinking a desktop layout after the fact.

### Accessibility
Ensure readable text, visible focus states, adequate contrast, and accessible form controls.

## 3. Visual Direction

Use a light-first interface with a neutral background, white or subtly tinted surfaces, dark readable text, and one consistent accent color.

Recommended direction:

- Page background: light neutral gray.
- Main surfaces: white.
- Primary text: dark charcoal.
- Secondary text: muted gray.
- Borders: subtle neutral gray.
- Primary actions: a restrained indigo or blue accent.
- Success, warning, and error colors: reserved for meaningful statuses.

These are initial design recommendations. Define the final palette as reusable theme tokens and avoid scattering arbitrary color values throughout the application.

Do not use excessive gradients, glassmorphism, heavy shadows, or unnecessary animations.

## 4. Typography

Choose a clean, highly readable sans-serif typeface.

Typography should establish a clear hierarchy:

- Page titles: prominent but restrained.
- Section titles: clearly distinguishable.
- Form labels: compact and readable.
- Supporting text: muted but accessible.
- Invoice totals: visually prominent.
- Invoice numbers and monetary amounts: easy to scan.

Use consistent font sizes, weights, and line heights. Avoid making every section heading oversized.

## 5. Application Layout

### 5.1 Desktop dashboard

Use a conventional application layout with:

- A sidebar for primary navigation.
- A top bar containing the page context and relevant actions.
- A main content area with consistent horizontal spacing.
- A clear primary action for creating an invoice.

Suggested navigation:

- Overview
- Invoices
- Customers, if the customer directory is included
- Settings

The navigation should remain compact and should not compete visually with the main content.

### 5.2 Mobile layout

On mobile:

- Replace the persistent desktop sidebar with an appropriate compact navigation pattern.
- Ensure the create-invoice action is easy to find.
- Stack form sections vertically.
- Avoid horizontal page overflow.
- Allow invoice line items to be edited without forcing users to navigate a wide desktop table.
- Keep primary actions accessible.

## 6. Required Screens

### 6.1 Public landing page

The landing page should explain the product clearly and guide users toward registration or login.

Include:

- Product identity.
- A concise headline describing the value.
- A primary call to action.
- A short explanation of the main features.
- A simple preview of the invoice workflow.
- A restrained footer.

Avoid inventing testimonials, customer logos, statistics, or claims about user numbers.

### 6.2 Registration and login

Provide simple, focused authentication screens.

Requirements:

- Clearly labeled fields.
- Appropriate password input behavior.
- Visible validation and error messages.
- Loading and disabled states while submitting.
- Links between registration and login.
- Clear feedback when authentication succeeds or fails.

Keep the screens consistent with the main product design.

### 6.3 Dashboard overview

The dashboard should prioritize useful actions rather than decorative analytics.

Include:

- A welcoming page heading.
- A clear Create Invoice action.
- A concise summary of saved invoice activity.
- A recent invoice list.
- An empty state for new users.

All displayed counts and summaries must derive from real application data.

### 6.4 Invoice list

The invoice list should help users find and manage saved invoices.

Include:

- Invoice number.
- Customer.
- Issue date.
- Due date, if available.
- Currency and total.
- Status, if implemented.
- Actions to view, edit, download, or delete.

On desktop, a table is appropriate. On mobile, use a compact responsive layout rather than forcing the entire table into a narrow viewport.

Include loading, empty, error, and populated states.

### 6.5 Invoice creation and editing

This is the most important screen in the product.

Use a clear form structure with sections for:

1. Invoice details.
2. Sender information.
3. Customer information.
4. Line items.
5. Notes and payment instructions, if included.
6. Invoice totals.
7. Save and PDF download actions.

The form should allow users to add and remove line items easily.

Each line item should clearly show its description, quantity, unit price, and calculated line total.

The subtotal and final total should remain easy to locate. On desktop, consider a stable summary area. On mobile, place the summary near the end of the form and keep the primary action accessible.

Do not hide important validation errors or rely on color alone to communicate them.

### 6.6 Invoice preview

Provide a clean preview that resembles the generated PDF.

The preview should show:

- Sender and customer details.
- Invoice number and dates.
- Currency.
- Item descriptions and amounts.
- Subtotal and final total.
- Notes and payment instructions, if present.

The preview and PDF must use consistent formatting and calculation rules.

### 6.7 Settings

If included in the MVP, settings should allow users to manage appropriate account and business-profile information.

Keep account settings separate from invoice editing.

Do not include subscription, billing-plan, or payment-gateway settings in the MVP.

## 7. Invoice Document Design

The generated invoice should look professional even when printed or viewed outside the application.

Recommended characteristics:

- A clean white page.
- A clear visual hierarchy.
- Sender details near the top.
- Customer and invoice details grouped logically.
- A readable line-item table.
- Proper alignment for quantities, prices, and totals.
- A prominent final total.
- Adequate margins and whitespace.
- Consistent page breaks for longer invoices.

Currency formatting must match the selected currency. NGN and USD invoices must not be visually ambiguous.

Do not depend on background colors or decorative effects that may disappear when printed.

## 8. Tailwind CSS Requirements

Tailwind CSS is the required styling approach.

The AI coding tool must:

- Use Tailwind utility classes for layout, spacing, typography, color, borders, and responsive behavior.
- Use the project's configured Tailwind version and conventions.
- Define shared theme values where supported by the installed version.
- Use reusable React components for repeated interface patterns.
- Use responsive utilities intentionally.
- Keep class names readable and avoid unnecessary duplication.
- Use conditional class composition consistently when component states change styling.
- Avoid introducing Bootstrap, Material UI, or another styling framework without approval.
- Avoid adding inline styles when Tailwind or a reusable CSS rule is appropriate.

A small amount of custom CSS is acceptable when necessary for features such as specialized PDF preview behavior or styles that cannot reasonably be expressed through Tailwind utilities.

Do not introduce a second styling system unnecessarily.

## 9. Reusable Components

Consider reusable components such as:

- Button
- Input
- Textarea
- Select
- Modal or confirmation dialog
- Status badge
- Page heading
- Sidebar
- Top navigation
- Empty state
- Loading indicator
- Error message
- Invoice form section
- Invoice line-item editor
- Invoice totals summary
- Invoice preview
- Invoice list or table

Reuse components where doing so improves consistency. Avoid creating abstractions for one-off elements without a clear benefit.

## 10. Interaction States

Every interactive component must have appropriate states.

### Buttons
- Default.
- Hover.
- Keyboard focus.
- Disabled.
- Loading, where applicable.

### Forms
- Empty.
- Valid.
- Invalid.
- Submitting.
- Successful.
- Failed.

### Data views
- Loading.
- Empty.
- Populated.
- Error.
- Unauthorized, where appropriate.

Provide clear feedback after saving, editing, downloading, or deleting an invoice.

Use a confirmation dialog for destructive actions such as deletion.

## 11. Accessibility

The implementation should:

- Use semantic HTML elements.
- Associate labels with their form controls.
- Support keyboard navigation.
- Display visible focus indicators.
- Maintain appropriate text contrast.
- Provide accessible names for icon-only buttons.
- Avoid communicating status through color alone.
- Respect reduced-motion preferences when animations are used.
- Ensure dialogs manage focus appropriately.

## 12. Motion and Animation

Use subtle animation only where it improves feedback or orientation.

Appropriate examples include:

- Small hover transitions.
- Gentle dialog transitions.
- Loading indicators.
- Subtle navigation feedback.

Avoid excessive movement, long animations, and effects that delay access to forms or actions.

The application should remain fast and usable when motion is disabled.

## 13. Empty States and Error Messages

Empty states should explain what the user can do next.

Example: when no invoices exist, show a brief explanation and a Create Invoice action.

Error messages should be specific enough to help users recover without exposing internal server details, database errors, credentials, or sensitive information.

Never use fake invoice data in a real user's dashboard to make the interface appear populated.

If preview data is needed for design development, clearly separate it from production user data.

## 14. Design Acceptance Criteria

The design is acceptable when:

- The application looks cohesive across all screens.
- Tailwind CSS is used consistently.
- The invoice creation flow is easy to follow.
- The interface works on desktop, tablet, and mobile.
- Invoice totals are easy to identify.
- NGN and USD are displayed correctly.
- Loading, empty, validation, and error states are implemented.
- Keyboard navigation and visible focus states are present.
- The generated PDF has a professional, readable layout.
- The design contains no invented business metrics or unnecessary features.

## 15. Instructions to the AI Coding Tool

Read this document before implementing or redesigning the interface.

Preserve all approved product requirements and backend behavior while implementing the design.

Do not treat visual polish as permission to change authentication, database logic, invoice calculations, or scope.

Build reusable components, use Tailwind CSS, and verify the interface at multiple viewport sizes. If a design decision affects functionality or materially changes the product scope, record it in `docs/DECISIONS.md` before proceeding.