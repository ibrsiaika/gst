# React/Tailwind Component Blueprint

These textual mockups describe the minimal UI screens, component hierarchy, Tailwind utility suggestions, and “tested” states the dev team should cover.

## 1. Tenant Dashboard
- **Route:** `/app/dashboard`
- **Layout:** `SidebarLayout` (sticky left nav) + `TopBar` (tenant switcher, alerts bell, profile menu).
- **Components:**
  1. `SummaryCards` (grid-cols-4, `bg-white shadow rounded-xl p-4`). Metrics: Outward Supplies, Net Tax Payable, Pending IRNs, Next Filing Due.
  2. `ComplianceTimeline` — horizontal timeline using `flex gap-4` with due dates (GSTR-1, GSTR-3B, EWB expiry). Use `bg-amber-50 border border-amber-200` for warnings.
  3. `AlertsTable` — Tailwind table with statuses: `text-red-600` for overdue, `text-green-600` for completed.
  4. `IRPQueueWidget` — list with progress bars showing `queued/success/failed`. Use `h-1.5 bg-slate-100 rounded-full` wrappers.
- **Testing states:**
  - Empty tenant (show onboarding CTA).
  - Overdue filings (red badges) vs compliant (green check icon `@heroicons/react/24/outline`).

## 2. Invoice List & Create Modal
- **Route:** `/app/invoices`
- **List:**
  - Toolbar with filters (status dropdown, date picker, GSTIN filter). Tailwind `flex flex-wrap gap-3`.
  - `DataGrid` style table (React Table) with columns: Invoice #, Customer, Date, Taxable Value, IRP Status (chip). Status badge classes:
    - `bg-blue-50 text-blue-700` for Pending
    - `bg-emerald-50 text-emerald-700` for Success
    - `bg-rose-50 text-rose-700` for Failed
  - Bulk actions: export CSV, submit to IRP.

- **Create/Edit Modal (`InvoiceFormModal`):**
  - Use HeadlessUI `Dialog` + `max-w-5xl`.
  - Sections: Supplier GSTIN selector (`Listbox`), Counterparty auto-complete, Line items (dynamic rows), Transport details toggle.
  - Tailwind pattern: `grid grid-cols-2 gap-4` for general details, `divide-y` for sections.
  - Provide live GSTIN validation indicator (`text-sm font-medium` + icon).
  - Footer buttons: `Submit & Generate IRN` (primary), `Save Draft` (secondary).
  - Validation messages `text-rose-600 text-sm mt-1`.
  - Testing scenarios: invalid GSTIN, duplicate invoice number, IRP submission success/failure toast.

## 3. IRP / E-Invoice History
- **Route:** `/app/invoices/{id}`
- Tabs: `Details`, `IRP History`, `E-Way Bill`.
- **IRP History Tab:** timeline list of submissions + statuses + ack numbers. Use `border-l-2 border-slate-200 pl-6` timeline layout.
- Provide `Download Signed JSON` button (ghost style) and `QR preview` using `bg-slate-50 p-4` container.
- Testing: verifying disabled download until IRN exists; show error logs if submission failed.

## 4. E-Way Bill Generator
- **Route:** `/app/ewaybills`
- Layout: two-column (form + history table).
- **Form:** `Card` with `bg-white shadow-sm rounded-2xl p-6`. Input controls for transporter ID, vehicle number, distance, validity extension. Provide `Switch` for “Auto-cancel if invoice cancelled”.
- **History Table:** columns `EWB No`, `Invoice #`, `Valid To`, `Status`, `Actions (PDF, Refresh)`. Status chips similar to invoice statuses but with `amber` for expiring soon.
- Testing: ensure PDF button disabled until `pdfUrl` available; simulate expired EWB to show alert.

## 5. GST Returns (GSTR-1 & GSTR-3B)
- **Route:** `/app/returns`
- **Tabs:** `GSTR-1`, `GSTR-3B`.
- `ReturnPeriodPicker` component (month/year). `SummaryCard` per table (3.1, 3.2, etc.).
- Section tables should highlight auto-populated rows (lock icon + tooltip). Use `bg-slate-50` to indicate read-only.
- Export buttons: `Export JSON`, `Export CSV`, `Send to GSP` (disabled placeholder for MVP).
- Testing: confirm totals tie back to invoices, locked rows non-editable, export success toast.

## 6. Counterparty Directory
- **Route:** `/app/counterparties`
- Search + filter (type, verification status). Card/grid layout with `border border-slate-200 rounded-xl p-4`.
- Each card shows GSTIN, verification badge (green/amber/red). Provide `Verify Now` action to re-trigger API.
- Testing: invalid GSTIN warning banner, spinner while verification pending.

## 7. Admin: Subscription & User Management
- **Route:** `/admin`
- **Subscription Panel:** display plan, usage bars, Razorpay status. Buttons: `Upgrade Plan`, `View Invoices`.
- **User Table:** includes seat usage, invites, last login. Provide `Resend Invite`, `Force 2FA reset` actions.
- **API Keys Section:** list IRP/e-way credentials with masked display + `Rotate` button (opens modal requiring OTP).
- **Audit Log Viewer:** timeline with filters (entity/action/date). Use `MonacoEditor` read-only for payload JSON.
- Testing: role-based access (only platform admins), verifying disabled state when tenant suspended.

## Component Library & Tailwind Notes
- Base components to build once: `Button`, `Badge`, `Card`, `Modal`, `Toast`, `DataTable`, `StatCard`, `Tabs`, `Alert`.
- Color tokens: primary `#2563EB`, success `#059669`, warning `#D97706`, danger `#DC2626`.
- Dark mode optional; keep tokens adaptable using CSS variables.
- Accessibility: all actions keyboard navigable, focus rings `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`.

## Testing Checklist
1. **Visual Regression:** Storybook stories for every component state (default, loading, error, empty).
2. **Interaction:** Cypress tests for invoice creation, IRP submission flow, e-way generation, subscription upgrade.
3. **Role-based:** ensure viewer cannot trigger IRP/EWB; admin panel hidden.
4. **Error Handling:** toast notifications for API failures, inline errors for forms.

These descriptions can be imported into Figma or a component planning board to accelerate front-end build.
