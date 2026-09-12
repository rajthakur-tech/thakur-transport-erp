import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatINR,
  formatDate,
  formatDateTime,
  getStatusBadgeColor,
  generateWhatsAppInvoice
} from '../../utils/helpers';
import {
  Printer,
  Download,
  Share2,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  QrCode,
  IndianRupee,
  MessageCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const InvoiceModal = ({ invoice, onClose }) => {
  const { settings } = useApp();
  const printRef = useRef();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF('portrait', 'pt', 'a4');
      const element = document.getElementById('printable-invoice');

      // Native clean PDF rendering
      doc.html(element, {
        callback: function (pdf) {
          pdf.save(`${invoice.invoiceNumber.replace(/\//g, '_')}.pdf`);
        },
        x: 20,
        y: 20,
        width: 550,
        windowWidth: 800
      });
    } catch (e) {
      // Fallback print
      window.print();
    }
  };

  // UPI payment payload string
  const upiPayload = `upi://pay?pa=${settings.upiId || 'thakurcement@sbi'}&pn=${encodeURIComponent(settings.businessName)}&am=${invoice.balanceAmount > 0 ? invoice.balanceAmount : invoice.totalAmount}&cu=INR&tn=${encodeURIComponent(invoice.invoiceNumber)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative max-h-[96vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 no-print">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              {invoice.invoiceNumber}
            </span>
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeColor(invoice.status || invoice.paymentType)}`}>
              {invoice.paymentType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Share */}
            <a
              href={`https://wa.me/91${invoice.customerMobile}?text=${generateWhatsAppInvoice(invoice, settings)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              title="Share Invoice on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE BODY */}
        <div id="printable-invoice" ref={printRef} className="p-6 sm:p-10 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b-2 border-slate-900 pb-6 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-md">
                  {settings?.businessName ? settings.businessName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'TT'}
                </div>
                <div>
                  <h1 className="font-heading text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase sm:text-2xl">
                    {settings.businessName}
                  </h1>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{settings.tradeName}</p>
                </div>
              </div>

              <div className="mt-3 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {settings.address} - {settings.pinCode}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {settings.contactPhone} / {settings.alternatePhone}
                </p>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  GSTIN: {settings.gstNumber}
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              <div className="inline-block rounded-lg bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                TAX INVOICE / BILL
              </div>
              <div className="mt-2 text-xs">
                <p className="text-slate-400">Invoice No:</p>
                <p className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div className="mt-1 text-xs">
                <p className="text-slate-400">Invoice Date:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(invoice.saleDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Billed To / Customer KYC */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Billed To (Customer Details)
              </span>
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {invoice.customerName}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Mobile: <strong className="text-slate-800 dark:text-slate-200">{invoice.customerMobile}</strong>
              </p>
              <p className="text-xs text-slate-500">Customer ID: {invoice.customerId}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Payment & Terms
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                Mode: {invoice.paymentType}
              </p>
              {invoice.dueDate && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Due Date: <span className="font-semibold text-rose-600">{formatDate(invoice.dueDate)}</span>
                </p>
              )}
              <p className="text-xs text-slate-500">
                Status: <strong className="text-slate-800 dark:text-slate-200">{invoice.status || 'Settled'}</strong>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Description of Goods</th>
                  <th className="py-3 px-4 text-center">HSN/SAC</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Rate / Bag</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="py-4 px-4 font-mono">01</td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {invoice.cementBrand}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Standard 50 KG Cement Bags • Grade 53/PPC High Strength
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-center text-slate-500">252329</td>
                  <td className="py-4 px-4 text-center font-bold text-slate-900 dark:text-white text-sm">
                    {invoice.numberOfBags} Bags
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-slate-800 dark:text-slate-200">
                    {formatINR(invoice.pricePerBag)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {formatINR(invoice.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary & QR Code Payment Row */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Bank details & UPI QR */}
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="rounded-xl bg-white p-2 shadow-sm dark:bg-slate-800">
                <QRCodeSVG value={upiPayload} size={90} />
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Scan to Pay (UPI)
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{settings.bankName}</p>
                <p className="font-mono text-slate-600 dark:text-slate-400">A/C: {settings.accountNumber}</p>
                <p className="font-mono text-slate-600 dark:text-slate-400">IFSC: {settings.ifscCode}</p>
                <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400">UPI: {settings.upiId}</p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal ({invoice.numberOfBags} Bags):</span>
                <span className="font-mono font-semibold">{formatINR(invoice.subtotal || invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>GST (Included in MRP):</span>
                <span className="font-mono font-semibold">₹0.00</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900 dark:text-white dark:border-slate-700">
                <span>Grand Total:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{formatINR(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono">{formatINR(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-300 pt-1 text-xs font-bold text-rose-600 dark:text-rose-400 dark:border-slate-700">
                <span>Balance Remaining Due:</span>
                <span className="font-mono">{formatINR(invoice.balanceAmount)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Signatures */}
          <div className="mt-8 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="max-w-md text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">
                <span className="font-bold text-slate-700 dark:text-slate-300">Terms & Conditions:</span>
                <br />
                {settings.invoiceTerms}
              </div>

              <div className="text-center sm:text-right">
                <div className="h-12"></div>
                <div className="border-t border-slate-400 pt-1 text-xs font-bold text-slate-900 dark:text-white">
                  For {settings.businessName}
                </div>
                <div className="text-[10px] text-slate-500">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
