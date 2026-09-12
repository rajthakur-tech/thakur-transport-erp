import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatINR,
  formatNumber,
  formatDate
} from '../../utils/helpers';
import {
  exportToExcel,
  exportToPDF
} from '../../utils/exportUtils';
import {
  FileBarChart2,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Users,
  Boxes,
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react';

export const ReportsManager = () => {
  const {
    sales,
    customers,
    inventory,
    companyOrders,
    creditPayments,
    brands,
    settings
  } = useApp();

  const [reportCategory, setReportCategory] = useState('sales_daily'); // 'sales_daily' | 'sales_weekly' | 'sales_monthly' | 'sales_yearly' | 'brand_sales' | 'customer_sales' | 'credit' | 'stock' | 'purchases'
  const [dateFilter, setDateFilter] = useState('');

  // Report Categories Config
  const categories = [
    { id: 'sales_daily', label: 'Daily Sales', icon: TrendingUp, subtitle: 'Bills generated today' },
    { id: 'sales_weekly', label: 'Weekly Sales', icon: TrendingUp, subtitle: 'Last 7 days volume' },
    { id: 'sales_monthly', label: 'Monthly Sales', icon: TrendingUp, subtitle: 'Current month breakdown' },
    { id: 'sales_yearly', label: 'Yearly Sales', icon: TrendingUp, subtitle: 'Annual fiscal performance' },
    { id: 'brand_sales', label: 'Brand-wise Sales', icon: Boxes, subtitle: 'Brand volume & revenue share' },
    { id: 'customer_sales', label: 'Customer Sales', icon: Users, subtitle: 'Top clients & contractor turnover' },
    { id: 'credit', label: 'Credit & Dues Report', icon: CreditCard, subtitle: 'Outstanding udhari & aging' },
    { id: 'stock', label: 'Inventory Stock Report', icon: Layers, subtitle: 'Warehouse stock balance & damage' },
    { id: 'purchases', label: 'Company Orders (PO)', icon: Building, subtitle: 'Manufacturer orders & dispatch' }
  ];

  // Dynamically compute report dataset based on selected report category
  const reportData = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();

    if (reportCategory === 'sales_daily') {
      const targetDate = dateFilter || todayStr;
      const list = sales.filter(s => s.saleDate === targetDate);
      return {
        title: `Daily Sales Report (${formatDate(targetDate)})`,
        headers: ['Invoice No', 'Date', 'Customer', 'Brand', 'Bags', 'Rate (₹)', 'Total (₹)', 'Payment', 'Due (₹)'],
        rows: list.map(s => [
          s.invoiceNumber,
          s.saleDate,
          s.customerName,
          s.cementBrand,
          s.numberOfBags,
          s.pricePerBag,
          s.totalAmount,
          s.paymentType,
          s.balanceAmount
        ]),
        rawExport: list.map(s => ({
          'Invoice Number': s.invoiceNumber,
          'Date': s.saleDate,
          'Customer': s.customerName,
          'Mobile': s.customerMobile,
          'Brand': s.cementBrand,
          'Bags': s.numberOfBags,
          'Rate': s.pricePerBag,
          'Total Amount': s.totalAmount,
          'Payment Type': s.paymentType,
          'Paid Amount': s.paidAmount,
          'Balance Due': s.balanceAmount
        })),
        summary: {
          totalBags: list.reduce((a, b) => a + Number(b.numberOfBags || 0), 0),
          totalRevenue: list.reduce((a, b) => a + Number(b.totalAmount || 0), 0),
          totalDue: list.reduce((a, b) => a + Number(b.balanceAmount || 0), 0)
        }
      };
    }

    if (reportCategory === 'sales_weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      const list = sales.filter(s => new Date(s.saleDate) >= oneWeekAgo);

      return {
        title: 'Weekly Sales Performance Report (Past 7 Days)',
        headers: ['Invoice No', 'Date', 'Customer', 'Brand', 'Bags', 'Total (₹)', 'Payment Type', 'Status'],
        rows: list.map(s => [
          s.invoiceNumber,
          s.saleDate,
          s.customerName,
          s.cementBrand,
          s.numberOfBags,
          s.totalAmount,
          s.paymentType,
          s.status
        ]),
        rawExport: list.map(s => ({
          'Invoice': s.invoiceNumber,
          'Date': s.saleDate,
          'Customer': s.customerName,
          'Brand': s.cementBrand,
          'Bags': s.numberOfBags,
          'Total Amount': s.totalAmount,
          'Payment': s.paymentType,
          'Balance': s.balanceAmount
        })),
        summary: {
          totalBags: list.reduce((a, b) => a + Number(b.numberOfBags || 0), 0),
          totalRevenue: list.reduce((a, b) => a + Number(b.totalAmount || 0), 0),
          totalDue: list.reduce((a, b) => a + Number(b.balanceAmount || 0), 0)
        }
      };
    }

    if (reportCategory === 'sales_monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(now.getDate() - 30);
      const list = sales.filter(s => new Date(s.saleDate) >= oneMonthAgo);

      return {
        title: 'Monthly Sales Report (Past 30 Days)',
        headers: ['Invoice No', 'Date', 'Customer', 'Brand', 'Bags', 'Total (₹)', 'Payment', 'Due (₹)'],
        rows: list.map(s => [
          s.invoiceNumber,
          s.saleDate,
          s.customerName,
          s.cementBrand,
          s.numberOfBags,
          s.totalAmount,
          s.paymentType,
          s.balanceAmount
        ]),
        rawExport: list.map(s => ({
          'Invoice': s.invoiceNumber,
          'Date': s.saleDate,
          'Customer': s.customerName,
          'Brand': s.cementBrand,
          'Bags': s.numberOfBags,
          'Total': s.totalAmount,
          'Paid': s.paidAmount,
          'Due': s.balanceAmount
        })),
        summary: {
          totalBags: list.reduce((a, b) => a + Number(b.numberOfBags || 0), 0),
          totalRevenue: list.reduce((a, b) => a + Number(b.totalAmount || 0), 0),
          totalDue: list.reduce((a, b) => a + Number(b.balanceAmount || 0), 0)
        }
      };
    }

    if (reportCategory === 'sales_yearly') {
      const list = sales;
      return {
        title: 'Yearly Annual Sales Ledger',
        headers: ['Invoice No', 'Date', 'Customer', 'Brand', 'Bags', 'Total (₹)', 'Payment Mode', 'Due (₹)'],
        rows: list.map(s => [
          s.invoiceNumber,
          s.saleDate,
          s.customerName,
          s.cementBrand,
          s.numberOfBags,
          s.totalAmount,
          s.paymentType,
          s.balanceAmount
        ]),
        rawExport: list.map(s => ({
          'Invoice': s.invoiceNumber,
          'Date': s.saleDate,
          'Customer': s.customerName,
          'Brand': s.cementBrand,
          'Bags': s.numberOfBags,
          'Total': s.totalAmount,
          'Due': s.balanceAmount
        })),
        summary: {
          totalBags: list.reduce((a, b) => a + Number(b.numberOfBags || 0), 0),
          totalRevenue: list.reduce((a, b) => a + Number(b.totalAmount || 0), 0),
          totalDue: list.reduce((a, b) => a + Number(b.balanceAmount || 0), 0)
        }
      };
    }

    if (reportCategory === 'brand_sales') {
      const list = brands.map(brand => {
        const brandSales = sales.filter(s => s.cementBrand === brand.name || s.brandId === brand.id);
        const bagsSold = brandSales.reduce((sum, s) => sum + Number(s.numberOfBags || 0), 0);
        const revenue = brandSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
        const currentStock = inventory.find(i => i.brandName === brand.name)?.bagsInStock || 0;

        return {
          brand: brand.name,
          type: brand.type,
          bagsSold,
          revenue,
          currentStock,
          ordersCount: brandSales.length
        };
      });

      return {
        title: 'Brand-Wise Sales & Revenue Distribution Report',
        headers: ['Brand Name', 'Grade / Type', 'Bags Sold', 'Revenue Generated (₹)', 'Current Stock (Bags)', 'Invoices'],
        rows: list.map(b => [b.brand, b.type, b.bagsSold, b.revenue, b.currentStock, b.ordersCount]),
        rawExport: list.map(b => ({
          'Brand': b.brand,
          'Grade': b.type,
          'Bags Sold': b.bagsSold,
          'Revenue': b.revenue,
          'Current Stock': b.currentStock,
          'Total Invoices': b.ordersCount
        })),
        summary: {
          totalBags: list.reduce((a, b) => a + b.bagsSold, 0),
          totalRevenue: list.reduce((a, b) => a + b.revenue, 0),
          totalDue: 0
        }
      };
    }

    if (reportCategory === 'customer_sales') {
      const list = customers.map(cust => {
        const custSales = sales.filter(s => s.customerId === cust.id);
        const totalBags = custSales.reduce((sum, s) => sum + Number(s.numberOfBags || 0), 0);
        const totalAmount = custSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
        const balance = custSales.reduce((sum, s) => sum + Number(s.balanceAmount || 0), 0);

        return {
          name: cust.name,
          mobile: cust.mobile,
          village: cust.village || cust.city,
          totalBags,
          totalAmount,
          balance,
          billsCount: custSales.length
        };
      }).sort((a, b) => b.totalAmount - a.totalAmount);

      return {
        title: 'Customer-Wise Sales & Ledger Performance Report',
        headers: ['Customer Name', 'Mobile', 'Village / Location', 'Bags Purchased', 'Total Billed (₹)', 'Balance Due (₹)', 'Bills'],
        rows: list.map(c => [c.name, c.mobile, c.village, c.totalBags, c.totalAmount, c.balance, c.billsCount]),
        rawExport: list.map(c => ({
          'Customer': c.name,
          'Mobile': c.mobile,
          'Village': c.village,
          'Bags': c.totalBags,
          'Total Billed': c.totalAmount,
          'Balance Due': c.balance,
          'Total Bills': c.billsCount
        })),
        summary: {
          totalBags: list.reduce((a, b) => a + b.totalBags, 0),
          totalRevenue: list.reduce((a, b) => a + b.totalAmount, 0),
          totalDue: list.reduce((a, b) => a + b.balance, 0)
        }
      };
    }

    if (reportCategory === 'credit') {
      const list = customers.map(cust => {
        const custSales = sales.filter(s => s.customerId === cust.id);
        const totalBilled = custSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
        const totalPaid = custSales.reduce((sum, s) => sum + Number(s.paidAmount || 0), 0);
        const balance = custSales.reduce((sum, s) => sum + Number(s.balanceAmount || 0), 0);

        return {
          name: cust.name,
          mobile: cust.mobile,
          village: cust.village || cust.city,
          totalBilled,
          totalPaid,
          balance
        };
      }).filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance);

      return {
        title: 'Outstanding Credit (Udhari) & Aging Statement',
        headers: ['Customer Name', 'Mobile', 'Location', 'Total Credit (₹)', 'Amount Collected (₹)', 'Remaining Balance Due (₹)'],
        rows: list.map(c => [c.name, c.mobile, c.village, c.totalBilled, c.totalPaid, c.balance]),
        rawExport: list.map(c => ({
          'Customer': c.name,
          'Mobile': c.mobile,
          'Village': c.village,
          'Total Credit': c.totalBilled,
          'Paid': c.totalPaid,
          'Remaining Balance': c.balance
        })),
        summary: {
          totalBags: 0,
          totalRevenue: list.reduce((a, b) => a + b.totalBilled, 0),
          totalDue: list.reduce((a, b) => a + b.balance, 0)
        }
      };
    }

    if (reportCategory === 'stock') {
      const list = inventory.map(item => {
        const brandObj = brands.find(b => b.name === item.brandName);
        const stockValue = item.bagsInStock * (brandObj?.costPrice || 320);

        return {
          brand: item.brandName,
          stock: item.bagsInStock,
          damaged: item.damagedBags || 0,
          threshold: item.minStockAlert,
          rate: brandObj?.unitPrice || 380,
          value: stockValue,
          status: item.bagsInStock <= item.minStockAlert ? 'LOW STOCK ⚠️' : 'OPTIMAL ✓'
        };
      });

      return {
        title: 'Warehouse Cement Inventory Valuation & Stock Report',
        headers: ['Brand Name', 'In Stock (Bags)', 'Damaged (Bags)', 'Safety Alert (Bags)', 'MRP / Bag (₹)', 'Est. Valuation (₹)', 'Status'],
        rows: list.map(i => [i.brand, i.stock, i.damaged, i.threshold, i.rate, i.value, i.status]),
        rawExport: list.map(i => ({
          'Brand': i.brand,
          'In Stock Bags': i.stock,
          'Damaged Bags': i.damaged,
          'Min Alert': i.threshold,
          'MRP': i.rate,
          'Valuation': i.value,
          'Status': i.status
        })),
        summary: {
          totalBags: list.reduce((a, b) => a + b.stock, 0),
          totalRevenue: list.reduce((a, b) => a + b.value, 0),
          totalDue: 0
        }
      };
    }

    // Purchases
    const list = companyOrders;
    return {
      title: 'Company Purchase Orders & Manufacturer Procurement Report',
      headers: ['PO Number', 'Order Date', 'Manufacturer', 'Brand', 'Quantity', 'Rate (₹)', 'Total Amount (₹)', 'Truck No', 'Status'],
      rows: list.map(o => [
        o.orderNumber,
        o.orderDate,
        o.companyName,
        o.cementBrand,
        o.quantity,
        o.rate,
        o.totalAmount,
        o.truckNumber || 'Pending',
        o.status
      ]),
      rawExport: list.map(o => ({
        'PO Number': o.orderNumber,
        'Date': o.orderDate,
        'Manufacturer': o.companyName,
        'Brand': o.cementBrand,
        'Quantity': o.quantity,
        'Rate': o.rate,
        'Total Amount': o.totalAmount,
        'Truck': o.truckNumber,
        'Status': o.status
      })),
      summary: {
        totalBags: list.reduce((a, b) => a + Number(b.quantity || 0), 0),
        totalRevenue: list.reduce((a, b) => a + Number(b.totalAmount || 0), 0),
        totalDue: 0
      }
    };
  }, [reportCategory, sales, customers, inventory, companyOrders, brands, dateFilter]);

  const handleExportExcel = () => {
    if (!reportData.rawExport.length) {
      alert('No data available to export in this category.');
      return;
    }
    exportToExcel(reportData.rawExport, `TCR_${reportCategory}`, 'Report');
  };

  const handleExportPDF = () => {
    if (!reportData.rows.length) {
      alert('No data available to export in this category.');
      return;
    }
    exportToPDF({
      title: reportData.title,
      subtitle: `${settings.businessName} • ${settings.address}`,
      headers: reportData.headers,
      data: reportData.rows,
      fileName: `TCR_${reportCategory}`
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Business Reports & Analytics
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              Export Center
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Generate and download sales, inventory, credit aging, customer turnover, and purchase reports in Excel (.xlsx) and PDF format.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 active:scale-[0.98]"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export to Excel (.XLSX)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98]"
          >
            <FileText className="h-4 w-4" />
            <span>Export to PDF</span>
          </button>
        </div>
      </div>

      {/* Report Categories Selector Bar */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-9">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = reportCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setReportCategory(cat.id)}
              className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="font-heading text-xs font-bold leading-tight line-clamp-1">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Title & Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
              {reportData.title}
            </h3>
            <p className="text-xs text-slate-500">
              Showing {reportData.rows.length} records generated from live database.
            </p>
          </div>

          {reportCategory === 'sales_daily' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Select Date:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white py-1.5 px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Summary Metric Strip */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {reportData.summary.totalBags > 0 && (
            <div className="rounded-xl bg-blue-50/70 p-3 dark:bg-blue-950/30">
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">Total Volume</span>
              <div className="font-heading text-xl font-extrabold text-blue-900 dark:text-white">
                {formatNumber(reportData.summary.totalBags)} Bags
              </div>
            </div>
          )}

          {reportData.summary.totalRevenue > 0 && (
            <div className="rounded-xl bg-emerald-50/70 p-3 dark:bg-emerald-950/30">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Total Valuation / Revenue</span>
              <div className="font-heading text-xl font-extrabold text-emerald-900 dark:text-white">
                {formatINR(reportData.summary.totalRevenue)}
              </div>
            </div>
          )}

          {reportData.summary.totalDue > 0 && (
            <div className="rounded-xl bg-rose-50/70 p-3 dark:bg-rose-950/30">
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">Total Balance Outstanding</span>
              <div className="font-heading text-xl font-extrabold text-rose-900 dark:text-white">
                {formatINR(reportData.summary.totalDue)}
              </div>
            </div>
          )}
        </div>

        {/* Table Preview */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                {reportData.headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportData.headers.length} className="py-8 text-center text-slate-400 italic">
                    No transactions found for the selected criteria.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-3 px-3">
                        {typeof cell === 'number' && (cIdx === 4 || cIdx === 5 || cIdx === 6 || cIdx === 7 || cIdx === 8)
                          ? cell.toLocaleString('en-IN')
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
