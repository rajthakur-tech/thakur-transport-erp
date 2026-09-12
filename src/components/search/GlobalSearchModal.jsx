import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatINR,
  formatDate
} from '../../utils/helpers';
import {
  Search,
  X,
  Users,
  Truck,
  Receipt,
  Building,
  Phone,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const GlobalSearchModal = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    customers,
    sales,
    companyOrders,
    trucks,
    setActiveTab,
    setViewInvoice
  } = useApp();

  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return { customers: [], sales: [], orders: [], trucks: [] };
    const q = query.toLowerCase().trim();

    // Customers
    const matchingCustomers = customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.village && c.village.toLowerCase().includes(q)) ||
      (c.gstNumber && c.gstNumber.toLowerCase().includes(q))
    ).slice(0, 4);

    // Sales / Invoices
    const matchingSales = sales.filter(s =>
      s.invoiceNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.cementBrand.toLowerCase().includes(q)
    ).slice(0, 4);

    // Company Orders
    const matchingOrders = companyOrders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.companyName.toLowerCase().includes(q) ||
      o.cementBrand.toLowerCase().includes(q)
    ).slice(0, 4);

    // Trucks / Drivers
    const matchingTrucks = trucks.filter(t =>
      t.truckNumber.toLowerCase().includes(q) ||
      t.driverName.toLowerCase().includes(q) ||
      t.driverMobile.includes(q)
    ).slice(0, 4);

    return {
      customers: matchingCustomers,
      sales: matchingSales,
      orders: matchingOrders,
      trucks: matchingTrucks
    };
  }, [query, customers, sales, companyOrders, trucks]);

  if (!isSearchOpen) return null;

  const totalResultsCount =
    searchResults.customers.length +
    searchResults.sales.length +
    searchResults.orders.length +
    searchResults.trucks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 p-4 pt-16 sm:pt-24 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Search input header */}
        <div className="relative border-b border-slate-200 p-4 dark:border-slate-800">
          <Search className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, phone, invoices, orders, trucks, or drivers..."
            className="w-full bg-transparent pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Sparkles className="mx-auto h-8 w-8 text-blue-500 mb-2 opacity-60" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">Quick Global Search</p>
              <p className="mt-0.5 text-slate-500">Type any customer name, phone number, truck plate (e.g. BR-01), or invoice number.</p>
            </div>
          ) : totalResultsCount === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p className="font-semibold">No records found matching "{query}"</p>
            </div>
          ) : (
            <>
              {/* Customer matches */}
              {searchResults.customers.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                    <span>Customers ({searchResults.customers.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {searchResults.customers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setActiveTab('customers');
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</div>
                          <div className="text-[11px] text-slate-500">{c.mobile} • {c.village || c.city}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices matches */}
              {searchResults.sales.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <Receipt className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Sales Invoices ({searchResults.sales.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {searchResults.sales.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setViewInvoice(s);
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div>
                          <div className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">{s.invoiceNumber}</div>
                          <div className="text-[11px] text-slate-500">{s.customerName} • {s.numberOfBags} Bags {s.cementBrand} ({formatINR(s.totalAmount)})</div>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">View Bill →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Orders */}
              {searchResults.orders.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <Building className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Company Orders ({searchResults.orders.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {searchResults.orders.map(o => (
                      <div
                        key={o.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setActiveTab('orders');
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{o.orderNumber} - {o.companyName}</div>
                          <div className="text-[11px] text-slate-500">{o.quantity} Bags {o.cementBrand} • Status: {o.status}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trucks & Drivers */}
              {searchResults.trucks.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <Truck className="h-3.5 w-3.5 text-purple-500" />
                    <span>Logistics & Drivers ({searchResults.trucks.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {searchResults.trucks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setActiveTab('logistics');
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div>
                          <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">{t.truckNumber}</div>
                          <div className="text-[11px] text-slate-500">Driver: {t.driverName} ({t.driverMobile}) • {t.currentStatus}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 flex items-center justify-between">
          <span>Search across all 12 modules instantly</span>
          <kbd className="rounded bg-white px-2 py-0.5 text-[10px] font-bold shadow-sm dark:bg-slate-700">ESC to Close</kbd>
        </div>
      </div>
    </div>
  );
};
