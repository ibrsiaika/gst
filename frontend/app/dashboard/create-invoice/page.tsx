'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useTenant } from '@/lib/TenantContext';
import { invoicesApi, CreateInvoiceDto, InvoiceItem } from '@/lib/api';

export default function CreateInvoicePage() {
  const router = useRouter();
  const { tenantId } = useTenant();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceType: 'B2B',
    sellerGstin: '',
    sellerLegalName: '',
    sellerAddress: {
      building: '',
      street: '',
      city: '',
      state: '',
      stateCode: '',
      pincode: '',
    },
    buyerGstin: '',
    buyerLegalName: '',
    buyerAddress: {
      building: '',
      street: '',
      city: '',
      state: '',
      stateCode: '',
      pincode: '',
    },
    placeOfSupply: '',
    supplyType: 'INTER_STATE',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: '',
      hsnCode: '',
      quantity: 1,
      unit: 'NOS',
      unitPrice: 0,
      taxableValue: 0,
      taxRate: 18,
      igstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      taxAmount: 0,
      itemTotal: 0,
    },
  ]);

  const calculateItemTotals = (item: InvoiceItem): InvoiceItem => {
    const taxableValue = item.quantity * item.unitPrice - (item.discount || 0);
    const taxAmount = (taxableValue * item.taxRate) / 100;
    
    let igstAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;

    if (formData.supplyType === 'INTER_STATE') {
      igstAmount = taxAmount;
    } else {
      cgstAmount = taxAmount / 2;
      sgstAmount = taxAmount / 2;
    }

    return {
      ...item,
      taxableValue,
      igstAmount,
      cgstAmount,
      sgstAmount,
      taxAmount,
      itemTotal: taxableValue + taxAmount,
    };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index] = calculateItemTotals(newItems[index]);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        hsnCode: '',
        quantity: 1,
        unit: 'NOS',
        unitPrice: 0,
        taxableValue: 0,
        taxRate: 18,
        igstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        taxAmount: 0,
        itemTotal: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalTaxableValue = items.reduce((sum, item) => sum + item.taxableValue, 0);
    const totalCgst = items.reduce((sum, item) => sum + (item.cgstAmount || 0), 0);
    const totalSgst = items.reduce((sum, item) => sum + (item.sgstAmount || 0), 0);
    const totalIgst = items.reduce((sum, item) => sum + (item.igstAmount || 0), 0);
    const totalTaxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = items.reduce((sum, item) => sum + item.itemTotal, 0);

    return {
      totalTaxableValue,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTaxAmount,
      grandTotal,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tenantId) {
      setError('Please select a tenant first');
      return;
    }

    const totals = calculateTotals();
    const invoiceData: CreateInvoiceDto = {
      ...formData,
      items,
      ...totals,
    };

    setIsSubmitting(true);

    try {
      await invoicesApi.create(tenantId, invoiceData);
      router.push('/dashboard/invoices');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create invoice');
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Create Invoice</h2>
          <p className="text-slate-600">Create a new GST-compliant invoice</p>
        </div>

        {!tenantId ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800">Please select a tenant from the sidebar before creating an invoice.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invoice Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="INV/2024-25/00001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Invoice Type *
                  </label>
                  <select
                    value={formData.invoiceType}
                    onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="B2B">B2B</option>
                    <option value="B2C">B2C</option>
                    <option value="EXPORT">Export</option>
                    <option value="SEZ_WITH_PAYMENT">SEZ with Payment</option>
                    <option value="SEZ_WITHOUT_PAYMENT">SEZ without Payment</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Supply Type *
                  </label>
                  <select
                    value={formData.supplyType}
                    onChange={(e) => {
                      setFormData({ ...formData, supplyType: e.target.value });
                      // Recalculate all items when supply type changes
                      setItems(items.map((item) => calculateItemTotals(item)));
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="INTER_STATE">Inter-State (IGST)</option>
                    <option value="INTRA_STATE">Intra-State (CGST + SGST)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seller Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Seller Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Seller GSTIN *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={formData.sellerGstin}
                    onChange={(e) =>
                      setFormData({ ...formData, sellerGstin: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="29ABCDE1234F2Z5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Seller Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sellerLegalName}
                    onChange={(e) =>
                      setFormData({ ...formData, sellerLegalName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="ABC Technologies Pvt Ltd"
                  />
                </div>
                <div className="md:col-span-2 grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Building/Flat No"
                    value={formData.sellerAddress.building}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellerAddress: { ...formData.sellerAddress, building: e.target.value },
                      })
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street"
                    value={formData.sellerAddress.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellerAddress: { ...formData.sellerAddress, street: e.target.value },
                      })
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={formData.sellerAddress.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellerAddress: { ...formData.sellerAddress, city: e.target.value },
                      })
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={formData.sellerAddress.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellerAddress: { ...formData.sellerAddress, state: e.target.value },
                      })
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State Code (29)"
                    maxLength={2}
                    value={formData.sellerAddress.stateCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellerAddress: { ...formData.sellerAddress, stateCode: e.target.value },
                      })
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pincode"
                    maxLength={6}
                    value={formData.sellerAddress.pincode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellerAddress: { ...formData.sellerAddress, pincode: e.target.value },
                      })
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Buyer Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Buyer Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Buyer GSTIN *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={formData.buyerGstin}
                    onChange={(e) =>
                      setFormData({ ...formData, buyerGstin: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="27XYZDE4567L1Z2 or URP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Buyer Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.buyerLegalName}
                    onChange={(e) =>
                      setFormData({ ...formData, buyerLegalName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="XYZ Enterprises"
                  />
                </div>
                <div className="md:col-span-2 grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Building/Flat No"
                    value={formData.buyerAddress.building}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyerAddress: { ...formData.buyerAddress, building: e.target.value },
                      })
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street"
                    value={formData.buyerAddress.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyerAddress: { ...formData.buyerAddress, street: e.target.value },
                      })
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={formData.buyerAddress.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyerAddress: { ...formData.buyerAddress, city: e.target.value },
                      })
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={formData.buyerAddress.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyerAddress: { ...formData.buyerAddress, state: e.target.value },
                      })
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State Code (27)"
                    maxLength={2}
                    value={formData.buyerAddress.stateCode}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        buyerAddress: { ...formData.buyerAddress, stateCode: e.target.value },
                        placeOfSupply: e.target.value,
                      });
                    }}
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pincode"
                    maxLength={6}
                    value={formData.buyerAddress.pincode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyerAddress: { ...formData.buyerAddress, pincode: e.target.value },
                      })
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Line Items</h3>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="HSN (998314)"
                        maxLength={8}
                        value={item.hsnCode}
                        onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Unit (NOS)"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Quantity"
                        min="0.001"
                        step="0.001"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Unit Price"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <select
                        value={item.taxRate}
                        onChange={(e) =>
                          handleItemChange(index, 'taxRate', parseFloat(e.target.value))
                        }
                        className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={0}>0%</option>
                        <option value={0.1}>0.1%</option>
                        <option value={0.25}>0.25%</option>
                        <option value={3}>3%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Total: ₹{item.itemTotal.toFixed(2)}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItem}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Taxable Value:</span>
                  <span className="font-medium">₹{totals.totalTaxableValue.toFixed(2)}</span>
                </div>
                {formData.supplyType === 'INTER_STATE' ? (
                  <div className="flex justify-between">
                    <span>IGST:</span>
                    <span className="font-medium">₹{totals.totalIgst.toFixed(2)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>CGST:</span>
                      <span className="font-medium">₹{totals.totalCgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST:</span>
                      <span className="font-medium">₹{totals.totalSgst.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Grand Total:</span>
                  <span>₹{totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/invoices')}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
