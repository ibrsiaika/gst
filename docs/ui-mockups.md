# UI Mockups & Component Guide

This document outlines the minimal MVP experience. Each screen includes structure, Tailwind CSS guidance, and interaction notes for React components.

## 1. Tenant Dashboard

- **Layout:** `Grid` with 3 columns on desktop (`grid-cols-3 gap-6`), stacked on mobile.
- **Components:**
  - `KpiCard` (`bg-white rounded-xl shadow-sm p-5 border border-slate-200`) for metrics (Outward supplies, Tax liability, Pending IRNs, Pending e-way bills, Next due date).
  - `TimelineList` for filing reminders using `divide-y divide-slate-100`.
  - `AlertBanner` for compliance alerts (locked periods, plan overages) with `bg-amber-50 text-amber-800 flex items-center gap-3 p-4 rounded-lg`.
  - `ChartCard` for tax liability trend; use `recharts` or `nivo` with `h-64` container.
- **Interactions:** Filter by GSTIN + period (use `Listbox` for GSTIN, `DateRangePicker`). Clicking KPI deep links to reports.

## 2. Invoice List & Create Modal

- **Invoice Table:**
  - `DataTable` component with sticky header (`sticky top-0 bg-slate-50`), columns for Invoice No, GSTIN, Customer, Taxable Value, IRN status, Actions.
  - Bulk actions toolbar with `ToggleGroup` for status filters and `Button` for "New Invoice".
- **Create Invoice Modal:**
  - `Dialog` from Headless UI with `max-w-5xl` width.
  - Multi-step form using `Steps` (General, Items, Taxes, IRP Submission).
  - Item entry uses editable table rows; Tailwind `divide-y` and `bg-slate-50` for header row.
  - GSTIN validation badge using `Badge` component (`bg-emerald-100 text-emerald-700` or `bg-rose-100 text-rose-700`).
  - IRP submission button triggers backend job; display `StatusPill` showing `Pending → Processing → IRN generated`.

## 3. IRP / E-invoice History

- **Layout:** `Tabs` for `Pending`, `Successful`, `Failed` IRP submissions.
- **Card Component:** `EinvoiceCard` summarizing Invoice details, IRN, Ack No, QR preview.
  - `qr` displayed using `<img>` or `react-qr-code` inside `bg-slate-100 p-3 rounded-lg`.
- **Side Drawer:** Clicking a card opens `Drawer` with JSON viewer (`CodeBlock` styled via `font-mono text-xs bg-slate-900 text-emerald-100 p-4 rounded-lg overflow-auto`), download buttons for Signed JSON/PDF.
- **Retry CTA:** `Button variant="ghost"` with retry icon for failed submissions.

## 4. E-way Bill Generator & History

- **Form:** `Card` with `grid grid-cols-2 gap-4` for transporter & vehicle fields; include `Distance` slider input.
- **History Table:** Similar to invoices but includes `EWB No`, `Valid Upto`, `Status`, and `Download PDF` action.
- **Status Pill Colors:**
  - Active: `bg-emerald-100 text-emerald-700`
  - Expired: `bg-slate-200 text-slate-600`
  - Cancelled: `bg-rose-100 text-rose-700`

## 5. GST Returns (GSTR-1 / GSTR-3B)

- **Tabs:** `SegmentedControl` for `GSTR-1`, `GSTR-3B`, `Exports`.
- **GSTR-1 Section Table:** Group by `B2B`, `B2C Large`, etc. Use `Accordion` to expand sections showing aggregated numbers.
- **GSTR-3B Summary:** Use `SummaryGrid` with read-only input fields (per GSTN locking rules). Disabled fields style: `bg-slate-100 text-slate-500 cursor-not-allowed`.
- **Export Drawer:** Buttons for `Download JSON`, `Download CSV`, `Send to GSP`. Provide `Toast` feedback on success.

## 6. Counterparty Directory

- **Search:** `Combobox` for quick GSTIN lookup.
- **List:** `CardList` showing legal name, GSTIN, status badge, last verified timestamp.
- **Verification Log Drawer:** Display timeline with `Stepper` showing each verification attempt, API latency, response hash.

## 7. Admin: Subscription & User Management

- **Subscription Panel:**
  - `PlanCard` components with Razorpay CTA.
  - Usage meter using `Progress` bar (`bg-slate-200` track, `bg-indigo-500` bar).
  - Billing history table with icons for success/failure.
- **User Management:**
  - `InviteUserForm` with role dropdown.
  - `UserList` table with toggles for MFA + status, using `Switch` from Headless UI.
- **API Keys Section:**
  - `SecretCard` with masked value, copy button, rotate/regenerate actions.
  - Show `Last used` metadata.

## Component Inventory

| Component | Description | Props |
|-----------|-------------|-------|
| `KpiCard` | Small metric card for dashboard stats | `title`, `value`, `trend`, `variant` |
| `DataTable` | Generic table with pagination, sorting | `columns`, `rows`, `loading`, `onSort`, `onSelect` |
| `StatusPill` | Colored badge for statuses | `status`, `size` |
| `Dialog` | Modal wrapper | `isOpen`, `onClose`, `title` |
| `Drawer` | Slide-over panel | `isOpen`, `onClose`, `side` |
| `CodeBlock` | JSON viewer | `value`, `language` |
| `PlanCard` | Subscription plan summary | `plan`, `price`, `limits`, `ctaLabel` |
| `AuditTimeline` | Chronological audit entries | `items[]` (timestamp, action, actor, hash) |
| `Toast` | Notifications | `message`, `variant` |
| `Progress` | Usage meter | `value`, `max` |

## Design System Tokens

- **Colors:** Base on Tailwind Slate + Indigo + Emerald palette to align with compliance look.
- **Spacing:** Use `4px` base scale; `p-6` for cards, `p-4` for modals.
- **Typography:** `font-sans` (Inter). Headings use `text-slate-900 font-semibold`, body `text-slate-700`.
- **Iconography:** `Heroicons` outline for actions, solid for confirmation states.

## Accessibility Notes

- Maintain 4.5:1 contrast for text.
- Provide skip links and keyboard navigable dialogs.
- Use ARIA live regions for async statuses (IRP submission, Razorpay checkout results).
