/**
 * Helpers for Thakur Cement Record (TCR)
 */

export const formatINR = (amount) => {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

export const formatNumber = (num) => {
  const val = Number(num) || 0;
  return new Intl.NumberFormat('en-IN').format(val);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
};

export const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
    case 'paid':
    case 'active':
    case 'unloaded':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'in transit':
    case 'on road (in transit)':
    case 'partially paid':
    case 'ordered':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'delayed':
    case 'delayed / repairing':
    case 'overdue':
    case 'unpaid':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    case 'cancelled':
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    default:
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  }
};

export const generateInvoiceNumber = (existingSalesCount = 0) => {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const nextYear = (new Date().getFullYear() + 1).toString().slice(-2);
  const seq = 1000 + existingSalesCount + 1;
  return `TCR/${currentYear}-${nextYear}/${seq}`;
};

export const generateOrderNumber = (brandCode = 'TCR', count = 0) => {
  const seq = 10000 + count + 1;
  return `${brandCode}-PAT-${seq}`;
};

export const generateWhatsAppReminder = (customerName, pendingBalance, dueDate, businessName = 'Thakur Cement Record') => {
  const message = `Namaste ${customerName} ji 🙏,\n\nThis is a gentle payment reminder from *${businessName}*.\n\n` +
    `Your outstanding cement balance is *${formatINR(pendingBalance)}*.\n` +
    `Due Date: *${formatDate(dueDate)}*.\n\n` +
    `Kindly clear the pending dues via UPI or Bank Transfer.\n` +
    `For any query or ledger reconciliation, please call us.\n\n` +
    `Thank you for your business! 🏗️`;
  return encodeURIComponent(message);
};

export const generateWhatsAppInvoice = (invoice, settings) => {
  const message = `*${settings?.businessName || 'Thakur Cement Record (TCR)'}*\n` +
    `📄 *INVOICE: ${invoice.invoiceNumber}*\n` +
    `Date: ${formatDate(invoice.saleDate)}\n` +
    `Customer: ${invoice.customerName}\n` +
    `--------------------------------\n` +
    `Brand: *${invoice.cementBrand}*\n` +
    `Quantity: *${invoice.numberOfBags} Bags*\n` +
    `Rate: ${formatINR(invoice.pricePerBag)}/Bag\n` +
    `Total Amount: *${formatINR(invoice.totalAmount)}*\n` +
    `Payment Type: ${invoice.paymentType}\n` +
    `Paid: ${formatINR(invoice.paidAmount)}\n` +
    `Balance Remaining: *${formatINR(invoice.balanceAmount)}*\n` +
    `--------------------------------\n` +
    `Contact: ${settings?.contactPhone || '+91 98350 12345'}\n` +
    `GSTIN: ${settings?.gstNumber || '10AAHFT8902P1ZT'}\n` +
    `Thank you for trusting TCR! 🙏`;
  return encodeURIComponent(message);
};
