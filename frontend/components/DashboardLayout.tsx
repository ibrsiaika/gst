'use client';

import { useTenant } from '@/lib/TenantContext';
import { useTenants } from '@/hooks/useData';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { tenantId, setTenantId } = useTenant();
  const { tenants, isLoading } = useTenants();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">
          <h1 className="text-2xl font-semibold mb-4">GST Console</h1>
          
          {/* Tenant Selector */}
          <div className="mb-8">
            <label className="block text-xs text-slate-400 mb-2">Current Tenant</label>
            <select
              value={tenantId || ''}
              onChange={(e) => setTenantId(e.target.value || null)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
              disabled={isLoading}
            >
              <option value="">Select Tenant</option>
              {tenants?.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          <nav className="space-y-2">
            <a
              href="/dashboard"
              className="block px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/dashboard/invoices"
              className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors"
            >
              Invoices
            </a>
            <a
              href="/dashboard/create-invoice"
              className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors"
            >
              Create Invoice
            </a>
            <a
              href="/dashboard/tenants"
              className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors"
            >
              Tenants
            </a>
          </nav>
          
          <div className="mt-10 text-xs text-slate-400">
            <p>Multi-tenant GST compliance platform</p>
            {tenantId && (
              <p className="mt-2 text-emerald-400">✓ Tenant selected</p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
