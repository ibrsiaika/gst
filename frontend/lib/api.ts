import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Address {
  building: string;
  street: string;
  locality?: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
}

export interface InvoiceItem {
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount?: number;
  taxableValue: number;
  taxRate: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  taxAmount: number;
  itemTotal: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType: string;
  documentType: string;
  sellerGstin: string;
  sellerLegalName: string;
  sellerTradeName?: string;
  sellerAddress: Address;
  buyerGstin: string;
  buyerLegalName: string;
  buyerAddress: Address;
  placeOfSupply: string;
  supplyType: string;
  reverseCharge: boolean;
  taxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalCess: number;
  taxAmount: number;
  totalValue: number;
  irpStatus: string;
  irn?: string;
  ackNo?: string;
  ackDate?: string;
  signedJsonUrl?: string;
  qrCodeUrl?: string;
  irpSubmittedAt?: string;
  irpErrorMessage?: string;
  exportDetails?: any;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
}

export interface Tenant {
  id: string;
  name: string;
  pan: string;
  planCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  name: string;
  pan: string;
  planCode: string;
  primaryGstin: string;
  adminEmail: string;
}

export interface CreateInvoiceDto {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType: string;
  documentType?: string;
  sellerGstin: string;
  sellerLegalName: string;
  sellerTradeName?: string;
  sellerAddress: Address;
  buyerGstin: string;
  buyerLegalName: string;
  buyerAddress: Address;
  placeOfSupply: string;
  supplyType: string;
  reverseCharge?: boolean;
  items: InvoiceItem[];
  totalTaxableValue: number;
  totalCgst?: number;
  totalSgst?: number;
  totalIgst?: number;
  totalCess?: number;
  totalTaxAmount: number;
  grandTotal: number;
  exportDetails?: any;
  eWayBillRequired?: boolean;
}

// API functions
export const tenantsApi = {
  create: (data: CreateTenantDto) => api.post<Tenant>('/tenants', data),
  get: (id: string) => api.get<Tenant>(`/tenants/${id}`),
  list: () => api.get<Tenant[]>('/tenants'),
};

export const invoicesApi = {
  create: (tenantId: string, data: CreateInvoiceDto) =>
    api.post<Invoice>(`/invoices?tenantId=${tenantId}`, data),
  get: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  list: (tenantId: string) => api.get<Invoice[]>(`/invoices?tenantId=${tenantId}`),
  submitToIrp: (id: string) => api.post<Invoice>(`/invoices/${id}/einvoice`),
};
