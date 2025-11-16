import useSWR from 'swr';
import { invoicesApi, tenantsApi, Invoice, Tenant } from '@/lib/api';

export function useInvoices(tenantId: string | null) {
  const shouldFetch = !!tenantId;
  const { data, error, isLoading, mutate } = useSWR<Invoice[]>(
    shouldFetch ? `/invoices?tenantId=${tenantId}` : null,
    shouldFetch
      ? async () => {
          const response = await invoicesApi.list(tenantId!);
          return response.data;
        }
      : null,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  );

  return {
    invoices: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useInvoice(id: string | null) {
  const shouldFetch = !!id;
  const { data, error, isLoading } = useSWR<Invoice>(
    shouldFetch ? `/invoices/${id}` : null,
    shouldFetch
      ? async () => {
          const response = await invoicesApi.get(id!);
          return response.data;
        }
      : null
  );

  return {
    invoice: data,
    isLoading,
    isError: error,
  };
}

export function useTenants() {
  const { data, error, isLoading, mutate } = useSWR<Tenant[]>(
    '/tenants',
    async () => {
      const response = await tenantsApi.list();
      return response.data;
    }
  );

  return {
    tenants: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTenant(id: string | null) {
  const shouldFetch = !!id;
  const { data, error, isLoading } = useSWR<Tenant>(
    shouldFetch ? `/tenants/${id}` : null,
    shouldFetch
      ? async () => {
          const response = await tenantsApi.get(id!);
          return response.data;
        }
      : null
  );

  return {
    tenant: data,
    isLoading,
    isError: error,
  };
}

// Dashboard stats hook
export function useDashboardStats(tenantId: string | null) {
  const { invoices, isLoading, isError } = useInvoices(tenantId);

  if (isLoading || isError || !invoices) {
    return {
      totalInvoices: 0,
      irpPending: 0,
      ewayPending: 0,
      taxLiability: 0,
      isLoading,
      isError,
    };
  }

  const totalInvoices = invoices.length;
  const irpPending = invoices.filter(
    (inv) => inv.irpStatus === 'pending' || inv.irpStatus === 'queued'
  ).length;
  const ewayPending = 0; // TODO: Implement when e-way bill entity is added
  const taxLiability = invoices.reduce(
    (sum, inv) => sum + Number(inv.taxAmount),
    0
  );

  return {
    totalInvoices,
    irpPending,
    ewayPending,
    taxLiability,
    isLoading,
    isError,
  };
}
