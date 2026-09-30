import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatINR,
  formatDate,
  formatDateTime,
  getStatusBadgeColor,
  generateWhatsAppInvoice,
  getUpiPaymentUrl
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
  MessageCircle,
  Copy,
  ExternalLink,
  Receipt,
  FileText,
  Warehouse
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const InvoiceModal = ({ invoice, onClose }) => {
  const { settings, showToast } = useApp();
  const printRef = useRef();

  const [invoiceFormat, setInvoiceFormat] = useState('a4'); // 'a4' | 'thermal'
  const [waLanguage, setWaLanguage] = useState('hindi'); // 'hindi' | 'english'
  const [copiedLink, setCopiedLink] = useState(false);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF('portrait', 'pt', 'a4');
      const element = document.getElementById('printable-invoice');

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
      window.print();
    }
  };

  const dueAmount = invoice.balanceAmount > 0 ? invoice.balanceAmount : invoice.totalAmount;
  const upiPayload = getUpiPaymentUrl(
    settings.upiId || 'thakurtransport@sbi',
    settings.businessName || 'Thakur Transport',
    dueAmount,
    `Bill ${invoice.invoiceNumber}`
  );

  const handleCopyUpiLink = () => {
    navigator.clipboard.writeText(upiPayload);
    setCopiedLink(true);
    showToast('UPI Payment Link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className={`relative max-h-[96vh] w-full ${invoiceFormat === 'thermal' ? 'max-w-md' : 'max-w-3xl'} overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all duration-200`}>
        
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 no-print">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              {invoice.invoiceNumber}
            </span>
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeColor(invoice.status || invoice.paymentType)}`}>
              {invoice.paymentType}
            </span>
          </div>

          {/* Format Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setInvoiceFormat('a4')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${invoiceFormat === 'a4' ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>A4 Tax Invoice</span>
            </button>
            <button
              onClick={() => setInvoiceFormat('thermal')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${invoiceFormat === 'thermal' ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>3" POS Slip</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Share Language Toggle & Button */}
            <div className="flex items-center rounded-xl bg-emerald-600 p-0.5 shadow-sm text-white">
              <a
                href={`https://wa.me/91${invoice.customerMobile}?text=${generateWhatsAppInvoice(invoice, settings, waLanguage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold hover:bg-emerald-700 rounded-lg transition"
                title={`Send ${waLanguage.toUpperCase()} invoice bill on WhatsApp`}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
              <select
                value={waLanguage}
                onChange={(e) => setWaLanguage(e.target.value)}
                className="bg-emerald-700 text-[11px] font-bold text-white rounded-r-lg px-1.5 py-1.5 border-l border-emerald-500 focus:outline-none cursor-pointer"
                title="Select WhatsApp Message Language"
              >
                <option value="hindi" className="bg-slate-900 text-white">हिंदी</option>
                <option value="english" className="bg-slate-900 text-white">EN</option>
              </select>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: STANDARD A4 TAX INVOICE FORMAT                                    */}
        {/* ========================================================================= */}
        {invoiceFormat === 'a4' && (
          <div id="printable-invoice" ref={printRef} className="p-6 sm:p-10 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
            {/* Header & Logo */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b-2 border-slate-900 pb-6 dark:border-slate-700">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-md">
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
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {settings.address} - {settings.pinCode}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {settings.contactPhone} / {settings.alternatePhone}
                  </p>
                  <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    GSTIN: {settings.gstNumber}
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 text-left sm:text-right">
                <div className="inline-block rounded-lg bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  TAX INVOICE / बिल
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

            {/* Billed To / Customer KYC & Dispatch Godown */}
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
                  Dispatch & Terms
                </span>
                {invoice.godownName && (
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center sm:justify-end gap-1 mt-0.5">
                    <Warehouse className="h-3.5 w-3.5" />
                    <span>Godown: {invoice.godownName}</span>
                  </p>
                )}
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                  Payment Mode: {invoice.paymentType}
                </p>
                {invoice.dueDate && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Due Date: <span className="font-semibold text-rose-600">{formatDate(invoice.dueDate)}</span>
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">
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
                      {invoice.notes && (
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 italic">
                          Note: {invoice.notes}
                        </div>
                      )}
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

            {/* Summary & UPI Dynamic QR Row */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Bank Details & Dynamic UPI QR */}
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="rounded-xl bg-white p-2 shadow-sm dark:bg-slate-800 shrink-0">
                  <QRCodeSVG value={upiPayload} size={95} level="M" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <QrCode className="h-3 w-3" />
                      Scan to Pay (UPI)
                    </p>
                    <button
                      onClick={handleCopyUpiLink}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 no-print"
                      title="Copy UPI Intent Link"
                    >
                      <Copy className="h-2.5 w-2.5" />
                      <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{settings.bankName}</p>
                  <p className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">A/C: {settings.accountNumber}</p>
                  <p className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">IFSC: {settings.ifscCode}</p>
                  <p className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">UPI: {settings.upiId}</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Scan with PhonePe, GPay, Paytm</p>
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
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 pt-1 text-xs font-bold text-slate-900 dark:text-white">
                    For {settings.businessName}
                  </div>
                  <div className="text-[10px] text-slate-500">Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: 3-INCH POS THERMAL RECEIPT FORMAT (80mm)                          */}
        {/* ========================================================================= */}
        {invoiceFormat === 'thermal' && (
          <div id="printable-invoice" ref={printRef} className="p-6 text-slate-900 bg-white font-mono text-xs mx-auto max-w-sm">
            {/* Thermal Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3">
              <h2 className="text-base font-extrabold uppercase tracking-tight">{settings.businessName}</h2>
              <p className="text-[11px] font-semibold">{settings.tradeName}</p>
              <p className="text-[10px] text-slate-600 mt-1">{settings.address}</p>
              <p className="text-[10px] text-slate-600">Mob: {settings.contactPhone}</p>
              <p className="text-[10px] font-bold">GSTIN: {settings.gstNumber}</p>
            </div>

            {/* Bill Details */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>Bill No:</span>
                <span className="font-bold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDate(invoice.saleDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold">{invoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Mobile:</span>
                <span>{invoice.customerMobile}</span>
              </div>
              {invoice.godownName && (
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Godown:</span>
                  <span>{invoice.godownName}</span>
                </div>
              )}
            </div>

            {/* Thermal Item Row */}
            <div className="py-2.5 border-b border-dashed border-slate-400">
              <div className="flex justify-between font-bold text-[11px]">
                <span>Item</span>
                <span>Qty x Rate</span>
                <span>Total</span>
              </div>
              <div className="mt-1.5 flex justify-between text-[11px]">
                <div className="max-w-[120px] truncate">
                  <p className="font-bold">{invoice.cementBrand}</p>
                  <p className="text-[9px] text-slate-500">50kg Bag (PPC/OPC)</p>
                </div>
                <div>{invoice.numberOfBags} x {invoice.pricePerBag}</div>
                <div className="font-bold">{formatINR(invoice.totalAmount)}</div>
              </div>
            </div>

            {/* Totals */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold text-sm">{formatINR(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span>{invoice.paymentType}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-bold">{formatINR(invoice.paidAmount)}</span>
              </div>
              {invoice.balanceAmount > 0 && (
                <div className="flex justify-between font-bold text-rose-600 pt-0.5">
                  <span>Balance Due:</span>
                  <span>{formatINR(invoice.balanceAmount)}</span>
                </div>
              )}
            </div>

            {/* QR Code in Thermal */}
            <div className="py-3 text-center border-b border-dashed border-slate-400">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2">Scan & Pay via UPI</p>
              <div className="flex justify-center">
                <QRCodeSVG value={upiPayload} size={110} level="M" />
              </div>
              <p className="text-[10px] font-bold mt-1.5">{settings.upiId}</p>
              <p className="text-[9px] text-slate-500">GPay / PhonePe / Paytm / BHIM</p>
            </div>

            {/* Thermal Footer */}
            <div className="pt-2 text-center text-[10px] text-slate-600">
              <p className="font-bold">Thank you for your business!</p>
              <p className="text-[9px] mt-0.5">Software by Thakur Transport ERP</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
