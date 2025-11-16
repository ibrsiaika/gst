'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TenantContextType {
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
}

const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  setTenantId: () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  useEffect(() => {
    // Load tenant ID from localStorage on mount
    const savedTenantId = localStorage.getItem('currentTenantId');
    if (savedTenantId) {
      setTenantIdState(savedTenantId);
    }
  }, []);

  const setTenantId = (id: string | null) => {
    setTenantIdState(id);
    if (id) {
      localStorage.setItem('currentTenantId', id);
    } else {
      localStorage.removeItem('currentTenantId');
    }
  };

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
