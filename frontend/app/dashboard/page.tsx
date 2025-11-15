'use client';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">
          <h1 className="text-2xl font-semibold mb-8">GST Console</h1>
          <nav className="space-y-2">
            <a href="/dashboard" className="block px-4 py-2 rounded bg-slate-700 hover:bg-slate-700">
              Dashboard
            </a>
            <a href="/dashboard/invoices" className="block px-4 py-2 rounded hover:bg-slate-700">
              Invoices
            </a>
            <a href="/dashboard/eway-bills" className="block px-4 py-2 rounded hover:bg-slate-700">
              E-Way Bills
            </a>
            <a href="/dashboard/returns" className="block px-4 py-2 rounded hover:bg-slate-700">
              GSTR Returns
            </a>
            <a href="/dashboard/admin" className="block px-4 py-2 rounded hover:bg-slate-700">
              Admin
            </a>
          </nav>
          <div className="mt-10 text-xs text-slate-400">
            <p>Multi-tenant GST compliance platform</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <header className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Outward Supplies</h2>
                <p className="text-sm text-slate-500">Period: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
                Download reports
              </button>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
                <p className="text-sm text-slate-600">Invoices</p>
                <h3 className="text-2xl font-bold text-indigo-900">128</h3>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-4">
                <p className="text-sm text-slate-600">IRN pending</p>
                <h3 className="text-2xl font-bold text-amber-900">6</h3>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded p-4">
                <p className="text-sm text-slate-600">E-way pending</p>
                <h3 className="text-2xl font-bold text-emerald-900">3</h3>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded p-4">
                <p className="text-sm text-slate-600">Tax liability</p>
                <h3 className="text-2xl font-bold text-rose-900">₹12.3L</h3>
              </div>
            </div>

            {/* Alerts */}
            <div>
              <h3 className="font-semibold mb-2">Alerts</h3>
              <div className="bg-amber-50 border border-amber-200 rounded p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-900">GSTR-3B filing due in 4 days</p>
                    <p className="text-sm text-amber-700">Deadline: {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-red-900">2 invoices failed IRP validation</p>
                    <p className="text-sm text-red-700">Action required: Review and resubmit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-6">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
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
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">INV/2024-25/00051</td>
                      <td className="px-4 py-3">May 10, 2024</td>
                      <td className="px-4 py-3">XYZ Enterprises</td>
                      <td className="px-4 py-3">₹1,18,000</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          IRN Generated
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">INV/2024-25/00050</td>
                      <td className="px-4 py-3">May 9, 2024</td>
                      <td className="px-4 py-3">ABC Corp</td>
                      <td className="px-4 py-3">₹85,000</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">INV/2024-25/00049</td>
                      <td className="px-4 py-3">May 8, 2024</td>
                      <td className="px-4 py-3">Tech Solutions Ltd</td>
                      <td className="px-4 py-3">₹2,50,000</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          IRN Generated
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
