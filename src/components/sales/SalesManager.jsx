import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatINR,
  formatDate,
  generateInvoiceNumber,
  getStatusBadgeColor,
  generateWhatsAppInvoice
} from '../../utils/helpers';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  Eye,
  Trash2,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Boxes,
  X,
  MessageCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';

export const SalesManager = () => {
  const {
    sales,
    addSale,
    deleteSale,
    customers,
    addCustomer,
    brands,
    inventory,
    viewInvoice,
    setViewInvoice,
    settings,
    currentUser
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewCustInline, setIsNewCustInline] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);

  // Form State
  const defaultCustomer = customers[0] || { id: 'CUST-1001', name: 'Rajeshwar Thakur', mobile: '9835012345' };
  const defaultBrand = brands[0] || { id: 'b1', name: 'UltraTech Cement', unitPrice: 385 };

  const initialForm = {
    customerId: defaultCustomer.id,
    customerName: defaultCustomer.name,
    customerMobile: defaultCustomer.mobile,
    cementBrand: defaultBrand.name,
    brandId: defaultBrand.id,
    numberOfBags: 50,
    pricePerBag: defaultBrand.unitPrice,
    paymentType: 'Cash', // Cash | UPI | Bank Transfer | Credit (Udhari)
    paidAmount: 50 * defaultBrand.unitPrice,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Inline new customer form
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustVillage, setNewCustVillage] = useState('Patna');

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch =
        sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.cementBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sale.customerMobile && sale.customerMobile.includes(searchQuery));

      const matchesPayment = paymentFilter === 'ALL' || sale.paymentType === paymentFilter;

      return matchesSearch && matchesPayment;
    });
  }, [sales, searchQuery, paymentFilter]);

  // Handle customer select
  const handleCustomerSelect = (custId) => {
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      setFormData(prev => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.name,
        customerMobile: cust.mobile
      }));
    }
  };

  // Handle brand select
  const handleBrandSelect = (brandName) => {
    const b = brands.find(item => item.name === brandName);
    const rate = b?.unitPrice || formData.pricePerBag;
    const bags = Number(formData.numberOfBags) || 1;
    const total = bags * rate;

    setFormData(prev => ({
      ...prev,
      cementBrand: brandName,
      brandId: b?.id || 'b1',
      pricePerBag: rate,
      paidAmount: prev.paymentType === 'Credit (Udhari)' ? 0 : total
    }));
  };

  // Handle bag change
  const handleBagsChange = (bags) => {
    const total = Number(bags) * Number(formData.pricePerBag);
    setFormData(prev => ({
      ...prev,
      numberOfBags: bags,
      paidAmount: prev.paymentType === 'Credit (Udhari)' ? 0 : total
    }));
  };

  // Handle payment type change
  const handlePaymentTypeChange = (type) => {
    const total = Number(formData.numberOfBags) * Number(formData.pricePerBag);
    setFormData(prev => ({
      ...prev,
      paymentType: type,
      paidAmount: type === 'Credit (Udhari)' ? 0 : total
    }));
  };

  // Inline Quick Add Customer
  const handleCreateInlineCustomer = () => {
    if (!newCustName.trim() || !newCustMobile.trim()) {
      alert('Please enter customer name and mobile.');
      return;
    }
    const created = addCustomer({
      name: newCustName,
      mobile: newCustMobile,
      village: newCustVillage,
      city: 'Patna',
      state: 'Bihar',
      pinCode: '801103',
      creditLimit: 100000
    });

    setFormData(prev => ({
      ...prev,
      customerId: created.id,
      customerName: created.name,
      customerMobile: created.mobile
    }));
    setIsNewCustInline(false);
    setNewCustName('');
    setNewCustMobile('');
  };

  // Calculate live total & balance
  const subtotal = Number(formData.numberOfBags) * Number(formData.pricePerBag);
  const totalAmount = subtotal;
  const balanceAmount = Math.max(0, totalAmount - Number(formData.paidAmount || 0));

  // Submit sale form
  const handleSaleSubmit = (e) => {
    e.preventDefault();
    const bags = Number(formData.numberOfBags);
    if (bags <= 0) {
      alert('Number of bags must be at least 1.');
      return;
    }

    // Check inventory stock availability
    const stockItem = inventory.find(i => i.brandName === formData.cementBrand);
    if (stockItem && stockItem.bagsInStock < bags) {
      if (!window.confirm(`Warning: Only ${stockItem.bagsInStock} bags in stock for ${formData.cementBrand}. Do you still want to bill ${bags} bags?`)) {
        return;
      }
    }

    const invNumber = generateInvoiceNumber(sales.length);
    const status = balanceAmount === 0 ? 'Paid' : (Number(formData.paidAmount) > 0 ? 'Partially Paid' : 'Unpaid');

    const createdSale = addSale({
      ...formData,
      invoiceNumber: invNumber,
      numberOfBags: bags,
      pricePerBag: Number(formData.pricePerBag),
      subtotal,
      totalAmount,
      paidAmount: Number(formData.paidAmount || 0),
      balanceAmount,
      status
    });

    setIsModalOpen(false);
    // Show invoice modal right away for printing
    setViewInvoice(createdSale);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Sales & Billing Management
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              POS Invoicing
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Create instant tax bills, multi-mode payments (Cash, UPI, Credit), auto stock deduction, and WhatsApp invoice sharing.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(initialForm);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:opacity-95 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Bill (POS)</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice # (e.g. 1045), customer name, brand, or mobile..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="ALL">All Payment Types</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Credit (Udhari)">Credit (Udhari)</option>
        </select>
      </div>

      {/* Invoices List Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice No</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Brand & Bags</th>
                <th className="py-3 px-4 font-semibold">Total Amount</th>
                <th className="py-3 px-4 font-semibold">Payment / Dues</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {sale.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {formatDate(sale.saleDate)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{sale.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sale.customerMobile}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{sale.cementBrand}</div>
                    <div className="text-[11px] text-slate-500">
                      <strong>{sale.numberOfBags} Bags</strong> @ ₹{sale.pricePerBag}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {formatINR(sale.totalAmount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeColor(sale.status || sale.paymentType)}`}>
                      {sale.paymentType}
                    </span>
                    {sale.balanceAmount > 0 && (
                      <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                        Due: {formatINR(sale.balanceAmount)}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* WhatsApp share */}
                      <a
                        href={`https://wa.me/91${sale.customerMobile}?text=${generateWhatsAppInvoice(sale, settings)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        title="Send on WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>

                      {/* View & Print */}
                      <button
                        onClick={() => setViewInvoice(sale)}
                        className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        title="View & Print Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setSaleToDelete(sale)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Invoice & Revert Stock"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS BILLING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                  Create New Cement Bill (POS)
                </h3>
                <p className="text-xs text-slate-500">Record sales, deduct live stock, and print instant invoice.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaleSubmit} className="mt-4 space-y-4">
              {/* Customer Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Customer *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewCustInline(!isNewCustInline)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{isNewCustInline ? 'Choose Existing' : '+ Quick Add Customer'}</span>
                  </button>
                </div>

                {!isNewCustInline ? (
                  <select
                    value={formData.customerId}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.mobile}) - {c.village || c.city}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 gap-2 rounded-2xl bg-blue-50/70 p-3 dark:bg-blue-950/40 sm:grid-cols-3 border border-blue-200 dark:border-blue-900/40">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="rounded-lg border border-slate-300 p-2 text-xs bg-white dark:bg-slate-800 dark:text-white"
                    />
                    <input
                      type="tel"
                      placeholder="10-digit Phone"
                      value={newCustMobile}
                      onChange={(e) => setNewCustMobile(e.target.value)}
                      className="rounded-lg border border-slate-300 p-2 text-xs bg-white dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleCreateInlineCustomer}
                      className="rounded-lg bg-blue-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                    >
                      Save & Select
                    </button>
                  </div>
                )}
              </div>

              {/* Cement Brand Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cement Brand *
                </label>
                <select
                  value={formData.cementBrand}
                  onChange={(e) => handleBrandSelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {brands.map(b => {
                    const stock = inventory.find(i => i.brandName === b.name)?.bagsInStock || 0;
                    return (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.type}) • Stock: {stock} Bags • Rate: ₹{b.unitPrice}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Number of Bags & Price Per Bag */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Number of Bags *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.numberOfBags}
                    onChange={(e) => handleBagsChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-extrabold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Price Per Bag (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.pricePerBag}
                    onChange={(e) => {
                      const rate = Number(e.target.value);
                      const total = rate * Number(formData.numberOfBags);
                      setFormData(prev => ({
                        ...prev,
                        pricePerBag: rate,
                        paidAmount: prev.paymentType === 'Credit (Udhari)' ? 0 : total
                      }));
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {['Cash', 'UPI', 'Bank Transfer', 'Credit (Udhari)'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handlePaymentTypeChange(mode)}
                      className={`rounded-xl border py-2.5 px-3 text-xs font-bold transition-all ${
                        formData.paymentType === mode
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* If Credit: Due Date & Partial Paid */}
              {formData.paymentType === 'Credit (Udhari)' && (
                <div className="grid grid-cols-1 gap-4 rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1">
                      Down Payment / Received Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={totalAmount}
                      value={formData.paidAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-amber-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 block">
                      Remaining: {formatINR(balanceAmount)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1">
                      Credit Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs font-medium text-slate-900 dark:border-amber-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Invoice Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Site / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched to Barghat site via truck"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Summary Bar */}
              <div className="rounded-2xl bg-slate-900 p-4 text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400">Total Bill Amount:</span>
                  <div className="font-heading text-2xl font-extrabold text-white">
                    {formatINR(totalAmount)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Pending Balance:</span>
                  <div className={`font-heading text-xl font-bold ${balanceAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatINR(balanceAmount)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:opacity-95"
                >
                  Generate & Print Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Delete Invoice & Restore Stock?
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Are you sure you want to delete invoice <strong className="text-slate-800 dark:text-slate-200">{saleToDelete.invoiceNumber}</strong>?
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/60 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900 dark:text-white">{saleToDelete.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Brand & Bags:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {saleToDelete.cementBrand} ({saleToDelete.numberOfBags} Bags)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{formatINR(saleToDelete.totalAmount)}</span>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ <strong>{saleToDelete.numberOfBags} bags</strong> will be returned to inventory stock automatically.
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSaleToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSale(saleToDelete.id);
                  setSaleToDelete(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                <span>Yes, Delete Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE PREVIEW MODAL */}
      {viewInvoice && (
        <InvoiceModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />
      )}
    </div>
  );
};
