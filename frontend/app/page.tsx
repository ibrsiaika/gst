export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold mb-4">GST Compliance SaaS Platform</h1>
          <p className="text-xl text-slate-300 mb-8">
            Complete solution for Indian businesses to manage GST compliance, e-invoicing, and tax returns
          </p>
          <div className="flex gap-4">
            <a
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </a>
            <a
              href="/api/docs"
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              API Documentation
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-indigo-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">E-Invoice (IRN)</h3>
            <p className="text-slate-600">
              Submit invoices to IRP (Invoice Registration Portal) with automated validation and IRN generation
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-indigo-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">E-Way Bills</h3>
            <p className="text-slate-600">
              Generate e-way bills for goods movement with automatic distance calculation and validity tracking
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-indigo-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">GSTR Reports</h3>
            <p className="text-slate-600">
              Automated GSTR-1 and GSTR-3B report generation with ITC reconciliation
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-indigo-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">GSTIN Validation</h3>
            <p className="text-slate-600">
              Real-time GSTIN verification with format validation and government API integration
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-indigo-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Tenant</h3>
            <p className="text-slate-600">
              Support multiple businesses with role-based access control and tenant isolation
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-indigo-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Compliant</h3>
            <p className="text-slate-600">
              6-year data retention, audit logs, and compliance with GST Act requirements
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">Technology Stack</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <h3 className="font-semibold mb-2">Frontend</h3>
              <p className="text-slate-600">Next.js 14<br/>React<br/>Tailwind CSS</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Backend</h3>
              <p className="text-slate-600">NestJS<br/>TypeScript<br/>Node.js 20</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Database</h3>
              <p className="text-slate-600">PostgreSQL 15<br/>TypeORM<br/>Redis</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Integration</h3>
              <p className="text-slate-600">IRP API<br/>E-Way Bill API<br/>Razorpay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
