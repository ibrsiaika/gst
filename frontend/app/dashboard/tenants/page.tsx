'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useTenants } from '@/hooks/useData';
import { tenantsApi, CreateTenantDto } from '@/lib/api';

export default function TenantsPage() {
  const { tenants, isLoading, mutate } = useTenants();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateTenantDto>({
    name: '',
    pan: '',
    planCode: 'STARTER',
    primaryGstin: '',
    adminEmail: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await tenantsApi.create(formData);
      setSuccess('Tenant created successfully!');
      setFormData({
        name: '',
        pan: '',
        planCode: 'STARTER',
        primaryGstin: '',
        adminEmail: '',
      });
      mutate(); // Refresh the tenant list
      setTimeout(() => setIsCreating(false), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tenant');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tenants</h2>
            <p className="text-slate-600">Manage tenant organizations</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors"
          >
            {isCreating ? 'Cancel' : 'Add Tenant'}
          </button>
        </div>

        {/* Create Tenant Form */}
        {isCreating && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Tenant</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="ABC Technologies Pvt Ltd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    PAN *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="ABCDE1234F"
                    pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                  />
                  <p className="text-xs text-slate-500 mt-1">Format: ABCDE1234F</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Primary GSTIN *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={formData.primaryGstin}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryGstin: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="29ABCDE1234F2Z5"
                    pattern="\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}"
                  />
                  <p className="text-xs text-slate-500 mt-1">15-character GSTIN</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="admin@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Plan Code *
                  </label>
                  <select
                    value={formData.planCode}
                    onChange={(e) => setFormData({ ...formData, planCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="STARTER">Starter</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition-colors"
                >
                  Create Tenant
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tenants List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">All Tenants</h3>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-2 text-sm text-slate-500">Loading tenants...</p>
              </div>
            ) : !tenants || tenants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No tenants found. Create your first tenant to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b">
                    <tr className="text-slate-600">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">PAN</th>
                      <th className="pb-3 font-medium">Plan</th>
                      <th className="pb-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-slate-50">
                        <td className="py-3 font-medium">{tenant.name}</td>
                        <td className="py-3 font-mono text-xs">{tenant.pan}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {tenant.planCode}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">
                          {new Date(tenant.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
