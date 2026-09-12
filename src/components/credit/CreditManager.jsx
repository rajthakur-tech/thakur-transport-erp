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
  CreditCard,
  Plus,
  Search,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Eye,
  X,
  IndianRupee,
  Phone,
  ArrowDownLeft,
  Calendar,
  Layers
} from 'lucide-react';

export const CreditManager = () => {
  const {
    customers,
    sales,
    creditPayments,
    addCreditPayment,
    settings,
    setViewInvoice,
    setActiveTab
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'OVERDUE' | 'PENDING' | 'SETTLED'
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState(null);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    customerId: '',
    customerName: '',
    invoiceId: 'GENERAL',
    amount: 10000,
    paymentMode: 'Cash', // Cash | UPI | Bank Transfer | Cheque
    referenceNumber: '',
    notes: 'Credit balance settlement'
  });

  // Calculate customer credit aggregations
  const creditAccounts = useMemo(() => {
    return customers.map(cust => {
      const custSales = sales.filter(s => s.customerId === cust.id);
      const totalBilled = custSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
      const totalPaid = custSales.reduce((sum, s) => sum + Number(s.paidAmount || 0), 0);
      const remainingBalance = custSales.reduce((sum, s) => sum + Number(s.balanceAmount || 0), 0);

      // Payments made
      const customerPayments = creditPayments.filter(p => p.customerId === cust.id);
      const lastPayment = customerPayments[0]; // sorted newest first

      // Overdue check
      const todayStr = new Date().toISOString().split('T')[0];
      const overdueSales = custSales.filter(s => s.balanceAmount > 0 && s.dueDate && s.dueDate < todayStr);
      const isOverdue = overdueSales.length > 0;
      const nearestDueDate = custSales
        .filter(s => s.balanceAmount > 0 && s.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]?.dueDate;

      return {
        customer: cust,
        totalBilled,
        totalPaid,
        remainingBalance,
        lastPayment,
        isOverdue,
        nearestDueDate,
        unpaidInvoicesCount: custSales.filter(s => s.balanceAmount > 0).length
      };
    });
  }, [customers, sales, creditPayments]);

  // Filter list
  const filteredAccounts = useMemo(() => {
    return creditAccounts.filter(item => {
      const matchesSearch =
        item.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer.mobile.includes(searchQuery) ||
        (item.customer.village && item.customer.village.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesFilter = true;
      if (filterType === 'OVERDUE') matchesFilter = item.isOverdue && item.remainingBalance > 0;
      if (filterType === 'PENDING') matchesFilter = item.remainingBalance > 0;
      if (filterType === 'SETTLED') matchesFilter = item.remainingBalance === 0;

      return matchesSearch && matchesFilter;
    });
  }, [creditAccounts, searchQuery, filterType]);

  const handleOpenPayment = (custAccount) => {
    setSelectedCustomer(custAccount.customer);
    setPaymentForm({
      customerId: custAccount.customer.id,
      customerName: custAccount.customer.name,
      invoiceId: 'GENERAL',
      amount: custAccount.remainingBalance || 5000,
      paymentMode: 'Cash',
      referenceNumber: `REC-${Date.now().toString().slice(-6)}`,
      notes: 'Payment towards outstanding udhari ledger'
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (Number(paymentForm.amount) <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    addCreditPayment(paymentForm);
    setIsPaymentModalOpen(false);
  };

  // Get customer specific ledger entries
  const getCustomerLedgerEntries = (customerId) => {
    const custSales = sales.filter(s => s.customerId === customerId).map(s => ({
      id: s.id,
      date: s.saleDate,
      type: 'INVOICE',
      refNo: s.invoiceNumber,
      description: `${s.numberOfBags} Bags ${s.cementBrand} (Total: ₹${s.totalAmount})`,
      debit: Number(s.totalAmount),
      credit: Number(s.paidAmount),
      balance: Number(s.balanceAmount),
      raw: s
    }));

    const custPayments = creditPayments.filter(p => p.customerId === customerId).map(p => ({
      id: p.id,
      date: p.paymentDate,
      type: 'PAYMENT',
      refNo: p.referenceNumber,
      description: `Payment Received (${p.paymentMode}) - ${p.notes || ''}`,
      debit: 0,
      credit: Number(p.amount),
      balance: 0,
      raw: p
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
              Credit (Udhari) Management & Ledger
            </h1>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
              Accounts Receivable
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Track customer credit balances, collect partial/full payments, send WhatsApp reminders, and audit ledgers.
          </p>
        </div>

        <button
          onClick={() => {
            const firstWithDue = creditAccounts.find(a => a.remainingBalance > 0) || creditAccounts[0];
            if (firstWithDue) handleOpenPayment(firstWithDue);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:opacity-95 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Record Customer Payment</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, or village..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { id: 'ALL', label: 'All Accounts' },
            { id: 'PENDING', label: 'With Balance Due' },
            { id: 'OVERDUE', label: '⚠️ Overdue' },
            { id: 'SETTLED', label: 'Fully Settled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                filterType === tab.id
                  ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Credit Accounts Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAccounts.map((item) => (
          <div
            key={item.customer.id}
            className={`flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all ${
              item.isOverdue && item.remainingBalance > 0
                ? 'border-rose-300 bg-rose-50/20 hover:border-rose-500 dark:border-rose-900/50 dark:bg-rose-950/20'
                : 'border-slate-200 bg-white hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {item.customer.id}
                  </span>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    {item.customer.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <a href={`tel:${item.customer.mobile}`} className="font-mono text-blue-600 hover:underline dark:text-blue-400">
                      {item.customer.mobile}
                    </a>
                  </div>
                </div>

                {item.remainingBalance > 0 ? (
                  item.isOverdue ? (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm animate-pulse-subtle">
                      OVERDUE
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Payment Due
                    </span>
                  )
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    ✓ Clear
                  </span>
                )}
              </div>

              {/* Outstanding Balance Spotlight */}
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white dark:from-slate-800 dark:to-slate-900">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Net Outstanding Balance:</span>
                  {item.nearestDueDate && item.remainingBalance > 0 && (
                    <span className="text-[11px] text-amber-300">
                      Due: {formatDate(item.nearestDueDate)}
                    </span>
                  )}
                </div>
                <div className={`mt-1 font-heading text-2xl font-extrabold ${
                  item.remainingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {formatINR(item.remainingBalance)}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-2 text-[11px] text-slate-400">
                  <span>Total Billed: {formatINR(item.totalBilled)}</span>
                  <span>Paid: {formatINR(item.totalPaid)}</span>
                </div>
              </div>

              {/* Last Payment History info */}
              <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                {item.lastPayment ? (
                  <span>
                    Last payment of <strong>{formatINR(item.lastPayment.amount)}</strong> on {formatDate(item.lastPayment.paymentDate)} ({item.lastPayment.paymentMode})
                  </span>
                ) : (
                  <span className="italic">No prior payment receipts logged</span>
                )}
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              {item.remainingBalance > 0 && (
                <button
                  onClick={() => handleOpenPayment(item)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Payment</span>
                </button>
              )}

              <button
                onClick={() => setSelectedLedgerCustomer(item.customer)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                title="View Full Customer Ledger"
              >
                <History className="h-3.5 w-3.5 text-blue-500" />
                <span>Ledger</span>
              </button>

              {item.remainingBalance > 0 && (
                <a
                  href={`https://wa.me/91${item.customer.mobile}?text=${generateWhatsAppReminder(
                    item.customer.name,
                    item.remainingBalance,
                    item.nearestDueDate || 'Immediate',
                    settings.businessName
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                  title="Send WhatsApp Payment Reminder"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Record Payment: {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">Phone: {selectedCustomer.mobile}</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (₹) *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    required
                    min={1}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-base font-extrabold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, paymentMode: mode })}
                      className={`rounded-xl py-2 text-xs font-bold transition ${
                        paymentForm.paymentMode === mode
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reference / Transaction No (Optional)
                </label>
                <input
                  type="text"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  placeholder="e.g. UPI Ref 49102919 or Receipt # 104"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Description
                </label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="e.g. Part payment cash deposit"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  Confirm & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER FULL LEDGER AUDIT MODAL */}
      {selectedLedgerCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                  Payment History & Statement: {selectedLedgerCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Mobile: {selectedLedgerCustomer.mobile} • {selectedLedgerCustomer.village}, {selectedLedgerCustomer.city}
                </p>
              </div>
              <button
                onClick={() => setSelectedLedgerCustomer(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Type</th>
                    <th className="py-2.5 px-3 font-semibold">Ref No</th>
                    <th className="py-2.5 px-3 font-semibold">Particulars</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Debit (Bill)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Credit (Paid)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {getCustomerLedgerEntries(selectedLedgerCustomer.id).map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{formatDate(entry.date)}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold ${
                          entry.type === 'INVOICE' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">{entry.refNo}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{entry.description}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white text-right">
                        {entry.debit > 0 ? formatINR(entry.debit) : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                        {entry.credit > 0 ? formatINR(entry.credit) : '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {entry.type === 'INVOICE' && (
                          <button
                            onClick={() => setViewInvoice(entry.raw)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
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

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setSelectedLedgerCustomer(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
