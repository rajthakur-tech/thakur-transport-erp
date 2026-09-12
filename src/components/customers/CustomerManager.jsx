import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatINR,
  formatDate,
  formatDateTime,
  getStatusBadgeColor,
  generateWhatsAppReminder
} from '../../utils/helpers';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Edit2,
  Trash2,
  MessageCircle,
  Eye,
  X,
  Check,
  Building,
  UserCheck,
  AlertCircle,
  History,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export const CustomerManager = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    sales,
    creditPayments,
    settings,
    setViewInvoice,
    currentUser
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [villageFilter, setVillageFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    mobile: '',
    alternateMobile: '',
    address: '',
    village: 'Barghat',
    city: 'Seoni',
    state: 'Madhya Pradesh',
    pinCode: '480991',
    gstNumber: '',
    aadhaarNumber: '',
    notes: '',
    creditLimit: 100000
  };
  const [formData, setFormData] = useState(initialForm);

  // Unique villages list for filter
  const villagesList = useMemo(() => {
    const set = new Set(customers.map(c => c.village).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [customers]);

  // Compute live balance per customer
  const customersWithBalance = useMemo(() => {
    return customers.map(cust => {
      const custSales = sales.filter(s => s.customerId === cust.id);
      const totalBilled = custSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
      const remainingBalance = custSales.reduce((sum, s) => sum + Number(s.balanceAmount || 0), 0);
      const totalBags = custSales.reduce((sum, s) => sum + Number(s.numberOfBags || 0), 0);

      return {
        ...cust,
        totalBilled,
        remainingBalance,
        totalBags,
        salesCount: custSales.length
      };
    });
  }, [customers, sales]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customersWithBalance.filter(cust => {
      const matchesSearch =
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.mobile.includes(searchQuery) ||
        (cust.village && cust.village.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cust.gstNumber && cust.gstNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesVillage = villageFilter === 'ALL' || cust.village === villageFilter;

      return matchesSearch && matchesVillage;
    });
  }, [customersWithBalance, searchQuery, villageFilter]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name || '',
      mobile: cust.mobile || '',
      alternateMobile: cust.alternateMobile || '',
      address: cust.address || '',
      village: cust.village || '',
      city: cust.city || 'Patna',
      state: cust.state || 'Bihar',
      pinCode: cust.pinCode || '801103',
      gstNumber: cust.gstNumber || '',
      aadhaarNumber: cust.aadhaarNumber || '',
      notes: cust.notes || '',
      creditLimit: cust.creditLimit || 100000
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim()) {
      alert('Customer Name and Mobile Number are required.');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setIsModalOpen(false);
  };

  // Get customer specific ledger entries (combined sales + payments sorted by date)
  const getCustomerLedgerEntries = (customerId) => {
    const custSales = sales.filter(s => s.customerId === customerId).map(s => ({
      id: s.id,
      date: s.saleDate,
      type: 'INVOICE',
      refNo: s.invoiceNumber,
      description: `${s.numberOfBags} Bags ${s.cementBrand} @ ₹${s.pricePerBag}`,
      debit: Number(s.totalAmount),
      credit: Number(s.paidAmount),
      balance: Number(s.balanceAmount),
      paymentType: s.paymentType,
      rawItem: s
    }));

    const custPayments = creditPayments.filter(p => p.customerId === customerId).map(p => ({
      id: p.id,
      date: p.paymentDate,
      type: 'PAYMENT',
      refNo: p.referenceNumber,
      description: `Payment received (${p.paymentMode}) - ${p.notes || 'Settlement'}`,
      debit: 0,
      credit: Number(p.amount),
      balance: 0,
      paymentType: p.paymentMode,
      rawItem: p
    }));

    return [...custSales, ...custPayments].sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Customer Management & KYC
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {customers.length} Accounts
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Maintain complete customer profiles, addresses, village KYC, credit limits, and ledger history.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Customer</span>
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
            placeholder="Search by customer name, mobile, village, or GSTIN..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Village:</span>
          <select
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {villagesList.map(v => (
              <option key={v} value={v}>{v === 'ALL' ? 'All Villages / Locations' : v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              {/* Header inside Card */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {cust.id}
                  </span>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    {cust.name}
                  </h3>
                  {cust.gstNumber && (
                    <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      GST: {cust.gstNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(cust)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    title="Edit Customer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {currentUser?.role === 'Admin' && (
                    <button
                      onClick={() => deleteCustomer(cust.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                      title="Delete Customer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Contact & Location Details */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${cust.mobile}`} className="font-mono text-blue-600 hover:underline dark:text-blue-400">
                    {cust.mobile}
                  </a>
                  {cust.alternateMobile && (
                    <span className="text-[11px] text-slate-400 font-mono">/ {cust.alternateMobile}</span>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">
                    {cust.address}, {cust.village ? `${cust.village}, ` : ''}{cust.city} - {cust.pinCode}
                  </span>
                </div>

                {cust.notes && (
                  <p className="rounded-lg bg-slate-50 p-2 text-[11px] italic text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    "{cust.notes}"
                  </p>
                )}
              </div>

              {/* Outstanding Balance & Bags Metric */}
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Outstanding Due:</span>
                  <span className={`font-heading text-sm font-extrabold ${
                    cust.remainingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {formatINR(cust.remainingBalance)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Total Purchases: {formatINR(cust.totalBilled)}</span>
                  <span>{cust.totalBags} Bags</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => setSelectedLedgerCustomer(cust)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <History className="h-3.5 w-3.5 text-blue-500" />
                <span>View Ledger</span>
              </button>

              {cust.remainingBalance > 0 && (
                <a
                  href={`https://wa.me/91${cust.mobile}?text=${generateWhatsAppReminder(
                    cust.name,
                    cust.remainingBalance,
                    'Immediate',
                    settings.businessName
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                  title="Send WhatsApp Payment Reminder"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT CUSTOMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  {editingCustomer ? 'Edit Customer Details' : 'Add New Customer Profile'}
                </h3>
                <p className="text-xs text-slate-500">Full KYC, contact information, and billing terms.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Singh / Golden Builders"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alternate Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.alternateMobile}
                    onChange={(e) => setFormData({ ...formData, alternateMobile: e.target.value })}
                    placeholder="Secondary contact / Landline"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Village / Area (Seoni - 480991 & nearby)
                  </label>
                  <input
                    type="text"
                    list="seoni-villages-list"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="e.g. Barghat, Ari, Gangiwara, Ashta"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <datalist id="seoni-villages-list">
                    <option value="Barghat" />
                    <option value="Ari" />
                    <option value="Gangiwara" />
                    <option value="Kanhiwada" />
                    <option value="Ashta" />
                    <option value="Bhoma" />
                    <option value="Bandol" />
                    <option value="Pandiwara" />
                    <option value="Bori" />
                    <option value="Piparwani" />
                    <option value="Gopalganj" />
                    <option value="Chhapara" />
                    <option value="Lakhnadon" />
                    <option value="Mohgaon" />
                    <option value="Kalyanpur" />
                  </datalist>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Address / Project Site
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Shop/Plot number, Landmark, Road name"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    placeholder="15-digit GSTIN"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono uppercase text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Aadhaar Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    placeholder="12-digit Aadhaar ID"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Special credit terms, delivery landmarks, etc."
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
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
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                >
                  {editingCustomer ? 'Update Customer' : 'Save Customer Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER LEDGER MODAL */}
      {selectedLedgerCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                  {selectedLedgerCustomer.id}
                </span>
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                  Customer Ledger: {selectedLedgerCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Phone: {selectedLedgerCustomer.mobile} • {selectedLedgerCustomer.village}, {selectedLedgerCustomer.city}
                </p>
              </div>
              <button
                onClick={() => setSelectedLedgerCustomer(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Ledger Transactions Table */}
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Type</th>
                      <th className="py-2.5 px-3 font-semibold">Ref / Invoice No</th>
                      <th className="py-2.5 px-3 font-semibold">Description</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Debit (Bill)</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Credit (Paid)</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {getCustomerLedgerEntries(selectedLedgerCustomer.id).map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {formatDate(entry.date)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold ${
                            entry.type === 'INVOICE'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {entry.refNo}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                          {entry.description}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white text-right">
                          {entry.debit > 0 ? formatINR(entry.debit) : '-'}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                          {entry.credit > 0 ? formatINR(entry.credit) : '-'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {entry.type === 'INVOICE' && (
                            <button
                              onClick={() => {
                                setViewInvoice(entry.rawItem);
                              }}
                              className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Total Ledger Balance Due: <strong className="text-rose-600 font-bold">{formatINR(selectedLedgerCustomer.remainingBalance)}</strong>
              </span>
              <button
                onClick={() => setSelectedLedgerCustomer(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
