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
  return `TT/${currentYear}-${nextYear}/${seq}`;
};

export const generateOrderNumber = (brandCode = 'TT', count = 0) => {
  const seq = 10000 + count + 1;
  return `${brandCode}-ORD-${seq}`;
};

export const generateTransferNumber = (count = 0) => {
  const year = new Date().getFullYear();
  const seq = 100 + count + 1;
  return `TRF-${year}-${seq}`;
};

export const getUpiPaymentUrl = (upiId, payeeName, amount, note) => {
  const cleanUpi = (upiId || 'thakurtransport@sbi').trim();
  const cleanName = encodeURIComponent(payeeName || 'Thakur Transport');
  const cleanAmount = Number(amount) > 0 ? Number(amount).toFixed(2) : '0';
  const cleanNote = encodeURIComponent(note || 'Payment to Thakur Transport');
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tn=${cleanNote}`;
};

export const generateWhatsAppReminder = (customerName, pendingBalance, dueDate, settings, style = 'hindi') => {
  const bizName = settings?.businessName || 'Thakur Transport';
  const phone = settings?.contactPhone || '+91 98350 12345';
  const upi = settings?.upiId || 'thakurtransport@sbi';
  const upiUrl = getUpiPaymentUrl(upi, bizName, pendingBalance, `Payment from ${customerName}`);

  let message = '';
  if (style === 'hindi') {
    message = `*${bizName} - भुगतान स्मरण (Payment Reminder)* 🙏\n\n` +
      `नमस्ते *${customerName}* जी,\n\n` +
      `आपके सीमेंट खाते की कुल बकाया राशि (Outstanding Balance): *${formatINR(pendingBalance)}* है।\n` +
      (dueDate ? `भुगतान की नियत तिथि (Due Date): *${formatDate(dueDate)}*\n\n` : '\n') +
      `📲 *Online Payment (UPI/GPay/PhonePe):*\n` +
      `UPI ID: \`${upi}\`\n\n` +
      `💳 *Direct UPI Pay Link:* ${upiUrl}\n\n` +
      `कृपया समय पर भुगतान करें। किसी भी जानकारी या लेज़र मिलान के लिए संपर्क करें:\n` +
      `📞 ${phone}\n\n` +
      `धन्यवाद! 🏗️`;
  } else {
    message = `*${bizName} - Payment Reminder* 🙏\n\n` +
      `Dear *${customerName}*,\n\n` +
      `This is a friendly reminder regarding your outstanding balance of *${formatINR(pendingBalance)}* with ${bizName}.\n` +
      (dueDate ? `Due Date: *${formatDate(dueDate)}*\n\n` : '\n') +
      `📲 *Pay via UPI (GPay / PhonePe / Paytm):*\n` +
      `UPI ID: \`${upi}\`\n\n` +
      `💳 *Direct Pay Link:* ${upiUrl}\n\n` +
      `For any query, please call: ${phone}\n\n` +
      `Thank you for your business! 🏗️`;
  }
  return encodeURIComponent(message);
};

export const generateWhatsAppInvoice = (invoice, settings, style = 'hindi') => {
  const bizName = settings?.businessName || 'Thakur Transport';
  const phone = settings?.contactPhone || '+91 98350 12345';
  const upi = settings?.upiId || 'thakurtransport@sbi';
  const dueAmt = invoice.balanceAmount > 0 ? invoice.balanceAmount : invoice.totalAmount;
  const upiUrl = getUpiPaymentUrl(upi, bizName, dueAmt, `Invoice ${invoice.invoiceNumber}`);

  let message = '';
  if (style === 'hindi') {
    message = `*${bizName}* 🚚\n` +
      `📄 *बिल / रसीद संख्या:* ${invoice.invoiceNumber}\n` +
      `📅 दिनांक: ${formatDate(invoice.saleDate)}\n` +
      `👤 ग्राहक (Customer): *${invoice.customerName}*\n` +
      `--------------------------------\n` +
      `📦 माल: *${invoice.cementBrand}*\n` +
      `🔢 मात्रा: *${invoice.numberOfBags} बोरी (Bags)*\n` +
      `💰 दर (Rate): ${formatINR(invoice.pricePerBag)} / बोरी\n` +
      `💵 कुल राशि (Total): *${formatINR(invoice.totalAmount)}*\n` +
      `💳 भुगतान प्रकार: ${invoice.paymentType}\n` +
      `✅ जमा राशि (Paid): ${formatINR(invoice.paidAmount)}\n` +
      `⚠️ बकाया राशि (Balance): *${formatINR(invoice.balanceAmount)}*\n` +
      (invoice.dueDate && invoice.balanceAmount > 0 ? `📅 अंतिम तिथि (Due Date): ${formatDate(invoice.dueDate)}\n` : '') +
      `--------------------------------\n` +
      (invoice.balanceAmount > 0 ? `📲 *UPI द्वारा भुगतान करें:* \`${upi}\`\n💳 *UPI Direct Pay:* ${upiUrl}\n\n` : '') +
      `📞 संपर्क: ${phone}\n` +
      `📍 पता: ${settings?.address || 'Barghat, Seoni (M.P.)'}\n` +
      `ठाकुर ट्रांसपोर्ट पर भरोसा करने के लिए धन्यवाद! 🙏`;
  } else {
    message = `*${bizName}* 🚚\n` +
      `📄 *TAX INVOICE / BILL: ${invoice.invoiceNumber}*\n` +
      `📅 Date: ${formatDate(invoice.saleDate)}\n` +
      `👤 Customer: *${invoice.customerName}*\n` +
      `--------------------------------\n` +
      `📦 Item: *${invoice.cementBrand}*\n` +
      `🔢 Quantity: *${invoice.numberOfBags} Bags*\n` +
      `💰 Rate: ${formatINR(invoice.pricePerBag)} / Bag\n` +
      `💵 Grand Total: *${formatINR(invoice.totalAmount)}*\n` +
      `💳 Payment Mode: ${invoice.paymentType}\n` +
      `✅ Paid Amount: ${formatINR(invoice.paidAmount)}\n` +
      `⚠️ Balance Remaining: *${formatINR(invoice.balanceAmount)}*\n` +
      `--------------------------------\n` +
      (invoice.balanceAmount > 0 ? `📲 *Pay via UPI:* \`${upi}\`\n💳 *UPI Direct Link:* ${upiUrl}\n\n` : '') +
      `📞 Contact: ${phone}\n` +
      `Thank you for choosing ${bizName}! 🙏`;
  }
  return encodeURIComponent(message);
};
