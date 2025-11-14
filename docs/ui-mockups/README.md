# UI Mockups & Component Checklist

The interactive wireframe lives in [`index.html`](./index.html). Open it in a browser to click through the primary tenant dashboard, invoice editor with IRP submission, e-way bill generator, GSTR-1/GSTR-3B summaries, and the admin subscription panel.

## Core React Component Stubs

| Component | Tailwind utilities | Notes |
| --- | --- | --- |
| `<DashboardKpiCard />` | `bg-indigo-50 border border-indigo-200 rounded p-4` | Accepts `label` + `value` props. Highlights pending e-invoices/e-way bills. |
| `<AlertList />` | `list-disc list-inside text-sm text-slate-600` | Provide CTA slots for jump-to invoice/return. |
| `<InvoiceForm />` | `grid md:grid-cols-2 gap-4` with nested `<FormField />` | Contains `seller`, `buyer`, `items` subcomponents and IRP action bar. |
| `<LineItemTable />` | `border border-dashed rounded p-4 space-y-2` | Add inline GSTIN validation badges for counterparties. |
| `<EWayForm />` | `grid md:grid-cols-2 gap-4` | Hook into BullMQ queue to trigger generation. |
| `<ReturnSummaryTable />` | `table w-full text-left text-sm border-t` | Accepts data rows + export callbacks. |
| `<SubscriptionPanel />` | `grid md:grid-cols-2 gap-4` with metric cards | Display plan metadata + usage + call to Razorpay. |
| `<UserList />` | `divide-y text-sm` | Provide Manage button to adjust roles and 2FA. |
| `<AuditLog />` | `bg-slate-50 border rounded p-3 text-xs font-mono` | Show immutable hash and request/response digest.

## Interaction Highlights

- **Navigation** uses a vertical pill menu. In React, maintain the active route in state (or Next.js route). Each button uses `hover:bg-slate-700` for accessibility.
- **Primary actions** use `.btn-primary` utilities. Secondary/responsive actions reuse `.btn-outline` to maintain consistency.
- **Forms** reference `.form-label` and `.form-input` utilities defined in the template `<style>` block for quick composition without a Tailwind config.
- **State badges** (IRP status, e-way expiry) should leverage Tailwind's semantic colors (e.g., `text-amber-600`, `bg-emerald-50`).
- **Responsive layout**: cards use `grid md:grid-cols-2` to collapse on mobile screens.

## Admin Panel Cues

- Seat management should support inline editing for each user row, using modals (`fixed inset-0 bg-black/40 flex items-center justify-center`).
- API key display toggles between masked/unmasked states with `font-mono text-slate-600` styling.
- Audit log search filters adopt `flex gap-3` wrappers with select fields for `action` and date range pickers.

## Testing Notes

- Use Storybook or Ladle to snapshot each component with sample props from the wireframe JSON seeds.
- Capture accessibility via `@testing-library/react` + `axe-core` to ensure ARIA labels on CTA buttons (“Submit to IRP”, “Generate e-way bill”).
