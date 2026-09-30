import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatINR,
  formatDate,
  formatDateTime,
  getStatusBadgeColor,
  generateWhatsAppReminder,
  getUpiPaymentUrl
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
  Layers,
  QrCode,
  Copy,
  Share2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const CreditManager = () => {
  const {
    customers,
    sales,
    creditPayments,
    addCreditPayment,
    settings,
    setViewInvoice,
    setActiveTab,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'OVERDUE' | 'PENDING' | 'SETTLED'
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState(null);
  const [showUpiScanner, setShowUpiScanner] = useState(false);

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
    setShowUpiScanner(false);
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
    if (Number(paymentForm.amount) <= 0) return;

    addCreditPayment({
      customerId: paymentForm.customerId,
      customerName: paymentForm.customerName,
      invoiceId: paymentForm.invoiceId,
      amount: Number(paymentForm.amount),
      paymentMode: paymentForm.paymentMode,
      referenceNumber: paymentForm.referenceNumber,
      notes: paymentForm.notes
    });

    setIsPaymentModalOpen(false);
  };

  // Compile statement line items for selected ledger customer
  const getCustomerLedgerEntries = (customerId) => {
    const custSales = sales.filter(s => s.customerId === customerId);
    const custPays = creditPayments.filter(p => p.customerId === customerId);

    const entries = [
      ...custSales.map(s => ({
        id: s.id,
        date: s.saleDate,
        type: 'INVOICE',
        refNo: s.invoiceNumber,
        description: `${s.cementBrand} (${s.numberOfBags} Bags @ ₹${s.pricePerBag})`,
        debit: Number(s.totalAmount),
        credit: 0,
        raw: s
      })),
      ...custPays.map(p => ({
        id: p.id,
        date: p.paymentDate,
        type: 'PAYMENT',
        refNo: p.referenceNumber,
        description: `Payment via ${p.paymentMode} (${p.notes || 'Settlement'})`,
        debit: 0,
        credit: Number(p.amount),
        raw: p
      }))
    ];

    return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Totals for top metrics
  const totalOutstandingAll = useMemo(() => {
    return creditAccounts.reduce((sum, a) => sum + a.remainingBalance, 0);
  }, [creditAccounts]);

  const totalOverdueAll = useMemo(() => {
    return creditAccounts.filter(a => a.isOverdue).reduce((sum, a) => sum + a.remainingBalance, 0);
  }, [creditAccounts]);

  const overdueAccountsCount = useMemo(() => {
    return creditAccounts.filter(a => a.isOverdue && a.remainingBalance > 0).length;
  }, [creditAccounts]);

  // UPI payment URL for modal
  const upiPayUrl = getUpiPaymentUrl(
    settings.upiId || 'thakurtransport@sbi',
    settings.businessName || 'Thakur Transport',
    paymentForm.amount,
    `Udhari Settlement ${selectedCustomer?.name || ''}`
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Credit & Customer Ledger (उधारी खाता)
            </h1>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
              Accounts Receivable
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Track customer outstanding balance, overdue credit aging, 1-click WhatsApp payment reminders with UPI QR code, and ledger settlements.
          </p>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Outstanding Balance</span>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatINR(totalOutstandingAll)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Across all credit buyers & contractors</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-300">
            <span>Critical Overdue Amount</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 font-heading text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatINR(totalOverdueAll)}
          </div>
          <p className="mt-1 text-[11px] text-rose-600/80">Pending past 15-day grace period</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Overdue Customer Accounts</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 font-heading text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {overdueAccountsCount} Accounts
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Require immediate WhatsApp reminder</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, mobile, or village/town..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Accounts' },
            { id: 'PENDING', label: 'With Balance Due' },
            { id: 'OVERDUE', label: '⚠️ Overdue' },
            { id: 'SETTLED', label: 'Fully Settled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition shrink-0 ${
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
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Receive ₹</span>
                </button>
              )}

              <button
                onClick={() => setSelectedLedgerCustomer(item.customer)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                title="View Full Customer Ledger & Statement"
              >
                <History className="h-3.5 w-3.5 text-blue-500" />
                <span>Ledger</span>
              </button>

              {item.remainingBalance > 0 && (
                <a
                  href={`https://wa.me/91${item.customer.mobile}?text=${generateWhatsAppReminder(
                    item.customer.name,
                    item.remainingBalance,
                    item.nearestDueDate,
                    settings,
                    'hindi'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
                  title="Send Hindi WhatsApp Payment Reminder"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* RECORD PAYMENT MODAL (WITH DYNAMIC UPI QR SCANNER)                        */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Record Payment: {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">Phone: {selectedCustomer.mobile} • ID: {selectedCustomer.id}</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setPaymentForm({ ...paymentForm, paymentMode: mode });
                        if (mode === 'UPI') setShowUpiScanner(true);
                      }}
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

              {/* Dynamic UPI QR Code Card */}
              {(paymentForm.paymentMode === 'UPI' || showUpiScanner) && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="rounded-xl bg-white p-2 shadow-md dark:bg-slate-800 shrink-0">
                    <QRCodeSVG value={upiPayUrl} size={110} level="M" />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center sm:justify-start gap-1">
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Customer Scan & Pay ₹{Number(paymentForm.amount || 0).toLocaleString('en-IN')}</span>
                    </p>
                    <p className="font-mono text-xs text-slate-700 dark:text-slate-300">UPI: {settings.upiId}</p>
                    <p className="text-[11px] text-slate-500">Scan with PhonePe, Google Pay, Paytm, BHIM</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(upiPayUrl);
                        showToast('UPI Link copied!', 'success');
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center justify-center sm:justify-start gap-1 mt-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy UPI Intent Link</span>
                    </button>
                  </div>
                </div>
              )}

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
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  Confirm & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOMER FULL LEDGER AUDIT MODAL (WITH QR CODE STATEMENT)                 */}
      {/* ========================================================================= */}
      {selectedLedgerCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                  Payment History & Statement: {selectedLedgerCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Mobile: {selectedLedgerCustomer.mobile} • {selectedLedgerCustomer.village || ''}, {selectedLedgerCustomer.city || ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/91${selectedLedgerCustomer.mobile}?text=${generateWhatsAppReminder(
                    selectedLedgerCustomer.name,
                    creditAccounts.find(a => a.customer.id === selectedLedgerCustomer.id)?.remainingBalance || 0,
                    null,
                    settings,
                    'hindi'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Send WhatsApp</span>
                </a>

                <button
                  onClick={() => setSelectedLedgerCustomer(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Ledger Table */}
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
