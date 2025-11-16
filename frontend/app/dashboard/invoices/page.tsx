'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useTenant } from '@/lib/TenantContext';
import { useInvoices } from '@/hooks/useData';
import { invoicesApi } from '@/lib/api';
import { useState } from 'react';

export default function InvoicesPage() {
  const { tenantId } = useTenant();
  const { invoices, isLoading, mutate } = useInvoices(tenantId);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const handleSubmitToIrp = async (invoiceId: string) => {
    setSubmitting(invoiceId);
    try {
      await invoicesApi.submitToIrp(invoiceId);
      mutate(); // Refresh the list
    } catch (error) {
      console.error('Failed to submit to IRP:', error);
      alert('Failed to submit invoice to IRP. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Invoices</h2>
            <p className="text-slate-600">Manage your invoices and submit to IRP</p>
          </div>
          <a
            href="/dashboard/create-invoice"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors"
          >
            Create Invoice
          </a>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow">
          {!tenantId ? (
            <div className="p-6 text-center">
              <p className="text-slate-500">Please select a tenant from the sidebar to view invoices.</p>
            </div>
          ) : isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-slate-500">Loading invoices...</p>
            </div>
          ) : !invoices || invoices.length === 0 ? (
            <div className="p-6 text-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-slate-500">No invoices found. Create your first invoice to get started.</p>
              <a
                href="/dashboard/create-invoice"
                className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors"
              >
                Create Invoice
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr className="text-slate-600">
                    <th className="px-4 py-3 font-medium">Invoice Number</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Buyer</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Tax</th>
                    <th className="px-4 py-3 font-medium">IRP Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3">
                        {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                          {invoice.invoiceType}
                        </span>
                      </td>
                      <td className="px-4 py-3">{invoice.buyerLegalName}</td>
                      <td className="px-4 py-3">₹{invoice.totalValue.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">₹{invoice.taxAmount.toLocaleString('en-IN')}</td>
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
                          {invoice.irpStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {invoice.irpStatus === 'pending' && (
                          <button
                            onClick={() => handleSubmitToIrp(invoice.id)}
                            disabled={submitting === invoice.id}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium disabled:opacity-50"
                          >
                            {submitting === invoice.id ? 'Submitting...' : 'Submit to IRP'}
                          </button>
                        )}
                        {invoice.irn && (
                          <span className="text-xs text-emerald-600 font-mono">IRN: {invoice.irn.substring(0, 10)}...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
