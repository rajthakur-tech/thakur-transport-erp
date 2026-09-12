import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatINR,
  formatNumber,
  formatDate,
  getStatusBadgeColor
} from '../../utils/helpers';
import {
  Users,
  Boxes,
  TrendingUp,
  CreditCard,
  Building,
  Truck,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Eye,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  IndianRupee,
  Layers
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

export const Dashboard = () => {
  const {
    analytics,
    inventory,
    sales,
    companyOrders,
    trucks,
    creditPayments,
    setActiveTab,
    setViewInvoice,
    theme
  } = useApp();

  const [salesFilter, setSalesFilter] = useState('monthly'); // 'today' | 'weekly' | 'monthly' | 'yearly'
  const [balanceFilter, setBalanceFilter] = useState('all'); // 'all' | 'credit' | 'paid' | 'remaining'

  // Determine current sales display based on selected filter
  const currentFilteredSales = {
    today: analytics.salesToday,
    weekly: analytics.salesWeekly,
    monthly: analytics.salesMonthly,
    yearly: analytics.salesYearly
  }[salesFilter];

  // Dynamic Chart Data based on time filter
  const getChartData = () => {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

    let labels = [];
    let salesData = [];
    let bagsData = [];

    if (salesFilter === 'today') {
      labels = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
      salesData = [0, 11250, 46200, 0, 0, 0];
      bagsData = [0, 30, 120, 0, 0, 0];
    } else if (salesFilter === 'weekly') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      salesData = [39000, 0, 53250, 29600, 114000, 57450, 0];
      bagsData = [100, 0, 150, 80, 300, 150, 0];
    } else if (salesFilter === 'monthly') {
      labels = ['Week 1 (1-7)', 'Week 2 (8-14)', 'Week 3 (15-21)', 'Week 4 (22-28)', 'Week 5 (29-31)'];
      salesData = [92250, 201050, 0, 0, 0];
      bagsData = [250, 500, 0, 0, 0];
    } else {
      labels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
      salesData = [180000, 240000, 310000, 290000, 340000, 293300, 0, 0, 0, 0, 0, 0];
      bagsData = [500, 650, 800, 750, 900, 780, 0, 0, 0, 0, 0, 0];
    }

    return {
      barData: {
        labels,
        datasets: [
          {
            label: 'Sales Revenue (₹)',
            data: salesData,
            backgroundColor: 'rgba(37, 99, 235, 0.85)', // TCR Blue
            borderRadius: 8,
            yAxisID: 'y'
          },
          {
            label: 'Bags Sold',
            data: bagsData,
            backgroundColor: 'rgba(16, 185, 129, 0.75)', // Emerald
            borderRadius: 8,
            yAxisID: 'y1'
          }
        ]
      },
      doughnutData: {
        labels: inventory.slice(0, 5).map(i => i.brandName),
        datasets: [
          {
            data: inventory.slice(0, 5).map(i => i.bagsInStock),
            backgroundColor: [
              '#2563eb', // UltraTech blue
              '#f59e0b', // Ambuja gold
              '#dc2626', // ACC red
              '#10b981', // Shree emerald
              '#8b5cf6', // Dalmia purple
            ],
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? '#111827' : '#ffffff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: (val) => `₹${(val / 1000).toFixed(0)}k`,
              font: { family: 'Inter', size: 11 }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: {
              color: textColor,
              callback: (val) => `${val} Bags`,
              font: { family: 'Inter', size: 11 }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, font: { family: 'Inter', size: 12, weight: '500' } }
          }
        }
      }
    };
  };

  const chartInfo = getChartData();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Header & Quick Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Executive Dashboard
            </h1>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
              Live Real-Time
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Overview of cement inventory, billing, logistics, and customer outstanding accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('sales')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Sale (Bill)</span>
          </button>
          <button
            onClick={() => setActiveTab('credit')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <CreditCard className="h-4 w-4 text-emerald-500" />
            <span>Add Payment</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Building className="h-4 w-4 text-indigo-500" />
            <span>Company Order</span>
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Cement Stock */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Cement Stock
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatNumber(analytics.totalBagsInStock)}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bags in Hand</span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
            {analytics.lowStockItems.length > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {analytics.lowStockItems.length} Brands Low
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Optimal Stock Levels
              </span>
            )}
            <span className="text-slate-400 group-hover:text-blue-500 flex items-center gap-0.5">
              Manage <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Filterable Sales Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sales Revenue
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          {/* Filter Pills: Today, Weekly, Monthly, Yearly */}
          <div className="mt-2 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {['today', 'weekly', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setSalesFilter(period)}
                className={`flex-1 rounded-md py-1 text-[10px] font-bold capitalize transition-all ${
                  salesFilter === period
                    ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatINR(currentFilteredSales)}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            All-Time Billing: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatINR(analytics.totalSalesAllTime)}</span>
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div
          onClick={() => setActiveTab('customers')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Customers
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics.totalCustomersCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Registered Accounts</span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Builders, Contractors & Retail</span>
            <span className="text-slate-400 group-hover:text-indigo-500 flex items-center gap-0.5">
              View KYC <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Orders & Logistics Quick Widget */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Supply Logistics
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
              <Truck className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div
              onClick={() => setActiveTab('orders')}
              className="cursor-pointer rounded-xl bg-slate-50 p-2.5 transition hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
            >
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">Pending Orders</span>
              <span className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                {analytics.pendingOrdersCount}
              </span>
              {analytics.delayedOrdersCount > 0 && (
                <span className="mt-1 block text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  ⚠️ {analytics.delayedOrdersCount} Delayed
                </span>
              )}
            </div>

            <div
              onClick={() => setActiveTab('logistics')}
              className="cursor-pointer rounded-xl bg-slate-50 p-2.5 transition hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
            >
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">Active Trucks</span>
              <span className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                {analytics.incomingTrucksCount}
              </span>
              <span className="mt-1 block text-[10px] text-emerald-600 dark:text-emerald-400">
                In Transit Fleet
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SPECIAL 3-in-1 OUTSTANDING BALANCE CARD (Prompt Requirement) */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
                UDHARI LEDGER
              </span>
              <h2 className="font-heading text-lg font-bold">Total Outstanding Balance Breakdown</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Consolidated credit summary: total billing issued on credit, amount collected, and net pending dues.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('credit')}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
            >
              <CreditCard className="h-4 w-4" />
              <span>Open Udhari Ledger</span>
            </button>
          </div>
        </div>

        {/* 3 Values Displayed Together in One Unified Card */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Sub-card 1: Total Credit */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">1. Total Credit Sales</span>
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
            </div>
            <div className="mt-2 font-heading text-2xl font-extrabold text-blue-400 sm:text-3xl">
              {formatINR(analytics.totalCreditAmount)}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Gross bills invoiced on credit terms</p>
          </div>

          {/* Sub-card 2: Total Paid */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">2. Total Paid / Collected</span>
              <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
            </div>
            <div className="mt-2 font-heading text-2xl font-extrabold text-emerald-400 sm:text-3xl">
              {formatINR(analytics.totalCreditPaid)}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Recovered via Cash, UPI & NEFT</p>
          </div>

          {/* Sub-card 3: Remaining Balance */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">3. Remaining Balance</span>
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></div>
            </div>
            <div className="mt-2 font-heading text-2xl font-extrabold text-rose-400 sm:text-3xl">
              {formatINR(analytics.totalRemainingBalance)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-rose-200">Net Pending Collection</span>
              {analytics.totalOverdueBalance > 0 && (
                <span className="font-bold text-rose-300">
                  (₹{(analytics.totalOverdueBalance / 1000).toFixed(0)}k Overdue)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Visual Collection Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>Recovery Ratio</span>
            <span className="font-bold text-emerald-400">
              {analytics.totalCreditAmount > 0
                ? `${Math.round((analytics.totalCreditPaid / analytics.totalCreditAmount) * 100)}% Recovered`
                : '100%'}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{
                width: `${
                  analytics.totalCreditAmount > 0
                    ? Math.min(100, Math.round((analytics.totalCreditPaid / analytics.totalCreditAmount) * 100))
                    : 100
                }%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales & Bags Trend Chart (2 columns) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Sales & Bag Volume Analytics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Revenue vs Cement bags dispatched (Filter: <span className="font-semibold uppercase text-blue-600">{salesFilter}</span>)
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
              {['today', 'weekly', 'monthly', 'yearly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSalesFilter(period)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                    salesFilter === period
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <Bar data={chartInfo.barData} options={chartInfo.options} />
          </div>
        </div>

        {/* Brand Stock Share Doughnut Chart (1 column) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
              Inventory Brand Share
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Top cement brands in warehouse</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <Doughnut
              data={chartInfo.doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 10,
                      font: { family: 'Inter', size: 10 },
                      color: theme === 'dark' ? '#94a3b8' : '#64748b'
                    }
                  }
                }
              }}
            />
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 text-center dark:border-slate-800">
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              View Full Warehouse Stock ({inventory.length} Brands) →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Alerts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Invoices Table (2 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Recent Sales Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest customer billings</p>
            </div>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              View All ({sales.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Invoice No</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Brand & Bags</th>
                  <th className="py-2.5 px-3 font-semibold">Total Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Payment</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{sale.customerName}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(sale.saleDate)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{sale.cementBrand}</div>
                      <div className="text-[10px] text-slate-500">{sale.numberOfBags} Bags @ ₹{sale.pricePerBag}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {formatINR(sale.totalAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeColor(sale.status || sale.paymentType)}`}>
                        {sale.paymentType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setViewInvoice(sale)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        title="View & Print Invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Alerts & Delayed Orders (1 Col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
              Critical Alerts
            </h3>
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>

          <div className="space-y-3">
            {/* Low Stock Warning */}
            {analytics.lowStockItems.map((item) => (
              <div
                key={item.brandId}
                onClick={() => setActiveTab('inventory')}
                className="cursor-pointer rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs transition hover:bg-amber-100/60 dark:border-amber-900/50 dark:bg-amber-950/30"
              >
                <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Low Stock: {item.brandName}
                  </span>
                  <span>{item.bagsInStock} Bags</span>
                </div>
                <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                  Stock below threshold limit of {item.minStockAlert} bags. Click to reorder.
                </p>
              </div>
            ))}

            {/* Delayed Orders Warning */}
            {companyOrders.filter(o => o.status === 'Delayed').map((order) => (
              <div
                key={order.id}
                onClick={() => setActiveTab('orders')}
                className="cursor-pointer rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs transition hover:bg-rose-100/60 dark:border-rose-900/50 dark:bg-rose-950/30"
              >
                <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-rose-600" />
                    Delayed Order #{order.orderNumber}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-rose-700 dark:text-rose-400">
                  {order.quantity} bags of {order.cementBrand}. Truck: {order.truckNumber} (Driver: {order.driverName})
                </p>
              </div>
            ))}

            {/* Overdue Payment Alert */}
            {analytics.totalOverdueBalance > 0 && (
              <div
                onClick={() => setActiveTab('credit')}
                className="cursor-pointer rounded-xl border border-red-200 bg-red-50/60 p-3 text-xs transition hover:bg-red-100/60 dark:border-red-900/50 dark:bg-red-950/30"
              >
                <div className="flex items-center justify-between font-bold text-red-800 dark:text-red-300">
                  <span className="flex items-center gap-1.5">
                    <IndianRupee className="h-4 w-4 text-red-600" />
                    Overdue Credit Reminder
                  </span>
                  <span>{formatINR(analytics.totalOverdueBalance)}</span>
                </div>
                <p className="mt-1 text-[11px] text-red-700 dark:text-red-400">
                  Outstanding bills crossed credit terms. Send WhatsApp payment reminder.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
