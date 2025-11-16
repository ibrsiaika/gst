'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useTenant } from '@/lib/TenantContext';
import { useDashboardStats, useInvoices } from '@/hooks/useData';

export default function DashboardPage() {
  const { tenantId } = useTenant();
  const { totalInvoices, irpPending, ewayPending, taxLiability, isLoading } = useDashboardStats(tenantId);
  const { invoices } = useInvoices(tenantId);

  // Calculate GSTR deadline
  const getGstrDeadline = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 20);
    const daysUntil = Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { date: nextMonth.toLocaleDateString('en-IN'), days: daysUntil };
  };

  const deadline = getGstrDeadline();
  const failedInvoices = invoices?.filter((inv) => inv.irpStatus === 'failed').length || 0;

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Outward Supplies</h2>
            <p className="text-sm text-slate-500">
              Period: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors">
            Download reports
          </button>
        </header>

        {!tenantId ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-slate-900">No tenant selected</h3>
            <p className="mt-1 text-sm text-slate-500">
              Please select a tenant from the sidebar to view dashboard
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-slate-500">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
                <p className="text-sm text-slate-600">Invoices</p>
                <h3 className="text-2xl font-bold text-indigo-900">{totalInvoices}</h3>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-4">
                <p className="text-sm text-slate-600">IRN pending</p>
                <h3 className="text-2xl font-bold text-amber-900">{irpPending}</h3>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded p-4">
                <p className="text-sm text-slate-600">E-way pending</p>
                <h3 className="text-2xl font-bold text-emerald-900">{ewayPending}</h3>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded p-4">
                <p className="text-sm text-slate-600">Tax liability</p>
                <h3 className="text-2xl font-bold text-rose-900">
                  ₹{(taxLiability / 100000).toFixed(1)}L
                </h3>
              </div>
            </div>

            {/* Alerts */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Alerts</h3>
              <div className="bg-amber-50 border border-amber-200 rounded p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-900">
                      GSTR-3B filing due in {deadline.days} days
                    </p>
                    <p className="text-sm text-amber-700">Deadline: {deadline.date}</p>
                  </div>
                </div>
                {failedInvoices > 0 && (
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-red-900">
                        {failedInvoices} invoice{failedInvoices > 1 ? 's' : ''} failed IRP validation
                      </p>
                      <p className="text-sm text-red-700">Action required: Review and resubmit</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              {!invoices || invoices.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-slate-500">No invoices found. Create your first invoice to get started.</p>
                  <a
                    href="/dashboard/create-invoice"
                    className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    Create Invoice
                  </a>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3">Invoice</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Buyer</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoices.slice(0, 10).map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{invoice.invoiceNumber}</td>
                          <td className="px-4 py-3">
                            {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-3">{invoice.buyerLegalName}</td>
                          <td className="px-4 py-3">₹{invoice.totalValue.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                invoice.irpStatus === 'success'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : invoice.irpStatus === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : invoice.irpStatus === 'queued'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {invoice.irpStatus === 'success'
                                ? 'IRN Generated'
                                : invoice.irpStatus === 'failed'
                                ? 'Failed'
                                : invoice.irpStatus === 'queued'
                                ? 'Processing'
                                : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

