import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatNumber,
  formatINR,
  formatDate
} from '../../utils/helpers';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  History,
  ShieldAlert,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingDown,
  Layers,
  X,
  Search,
  CheckCircle2,
  Package
} from 'lucide-react';

export const InventoryManager = () => {
  const {
    inventory,
    stockLogs,
    adjustStock,
    recordDamagedBags,
    brands,
    analytics,
    currentUser
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(inventory[0]?.brandName || 'UltraTech Cement');

  // Adjust Form State
  const [adjustData, setAdjustData] = useState({
    brandName: inventory[0]?.brandName || 'UltraTech Cement',
    type: 'Stock In', // 'Stock In' | 'Stock Out'
    bags: 100,
    reference: 'MANUAL-ADJUST',
    notes: 'Warehouse physical audit count'
  });

  // Damage Form State
  const [damageData, setDamageData] = useState({
    brandName: inventory[0]?.brandName || 'UltraTech Cement',
    damagedBags: 5,
    notes: 'Rain water leakage / torn bags during unloading'
  });

  const filteredInventory = inventory.filter(item =>
    item.brandName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    const qty = Number(adjustData.bags);
    if (qty <= 0) return;

    const change = adjustData.type === 'Stock In' ? qty : -qty;
    adjustStock(adjustData.brandName, change, adjustData.type, adjustData.reference, adjustData.notes);
    setIsAdjustModalOpen(false);
  };

  const handleDamageSubmit = (e) => {
    e.preventDefault();
    const count = Number(damageData.damagedBags);
    if (count <= 0) return;

    recordDamagedBags(damageData.brandName, count, damageData.notes);
    setIsDamageModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Warehouse Inventory & Stock Control
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              Live Godown Stock
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Brand-wise cement stock meters, auto deductions from POS sales, damaged bags logging, and audit history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setAdjustData({ ...adjustData, brandName: inventory[0]?.brandName });
              setIsAdjustModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Stock In / Out Adjustment</span>
          </button>
          <button
            onClick={() => {
              setDamageData({ ...damageData, brandName: inventory[0]?.brandName });
              setIsDamageModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <span>Log Damaged Bags</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Saleable Stock
            </span>
            <Boxes className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatNumber(analytics.totalBagsInStock)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Across {inventory.length} cement brand grades</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Low Stock Warnings
            </span>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {analytics.lowStockItems.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">Brands below safety threshold buffer</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Damaged / Wastage
            </span>
            <ShieldAlert className="h-5 w-5 text-rose-500" />
          </div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {analytics.damagedBagsCount}
          </div>
          <p className="mt-1 text-xs text-slate-500">Bags set aside for insurance/claim</p>
        </div>
      </div>

      {/* Brand-wise Stock Meters Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredInventory.map((item) => {
          const brandDetails = brands.find(b => b.name === item.brandName);
          const isLow = item.bagsInStock <= item.minStockAlert;
          const percentage = Math.min(100, Math.round((item.bagsInStock / 1000) * 100));

          return (
            <div
              key={item.brandId}
              className={`rounded-2xl border p-5 shadow-sm transition-all ${
                isLow
                  ? 'border-amber-300 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20'
                  : 'border-slate-200 bg-white hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {brandDetails?.code || 'CEMENT'}
                  </span>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    {item.brandName}
                  </h3>
                  <p className="text-[11px] text-slate-500">{brandDetails?.type || 'Standard PPC'}</p>
                </div>

                {isLow ? (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    <AlertTriangle className="h-3 w-3" /> Low Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> Good
                  </span>
                )}
              </div>

              {/* Stock Metric */}
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
                    {item.bagsInStock}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 ml-1">Bags</span>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>Alert At: </span>
                  <strong className="text-slate-800 dark:text-slate-200">{item.minStockAlert} Bags</strong>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    isLow ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              {/* Damaged & Rate footer */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] dark:border-slate-800">
                <span className="text-slate-500">
                  Damaged: <strong className="text-rose-600">{item.damagedBags || 0} Bags</strong>
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  MRP: ₹{brandDetails?.unitPrice || 380}/Bag
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock History Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
              Stock Movement History & Audit Log
            </h3>
          </div>
          <span className="text-xs text-slate-400">Latest {stockLogs.length} events recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold">Brand</th>
                <th className="py-2.5 px-4 font-semibold">Movement Type</th>
                <th className="py-2.5 px-4 font-semibold text-right">Bags Quantity</th>
                <th className="py-2.5 px-4 font-semibold">Reference</th>
                <th className="py-2.5 px-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {formatDate(log.date)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {log.brandName}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      log.type === 'Stock In'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : log.type === 'Stock Out'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}>
                      {log.type === 'Stock In' ? <ArrowDownCircle className="h-3 w-3" /> : <ArrowUpCircle className="h-3 w-3" />}
                      {log.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {log.type === 'Stock In' ? `+${log.bags}` : `-${log.bags}`} Bags
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {log.reference || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {log.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST STOCK MODAL */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Manual Stock In / Out Adjustment
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cement Brand
                </label>
                <select
                  value={adjustData.brandName}
                  onChange={(e) => setAdjustData({ ...adjustData, brandName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {inventory.map(i => (
                    <option key={i.brandId} value={i.brandName}>{i.brandName} (Current: {i.bagsInStock} Bags)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, type: 'Stock In' })}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      adjustData.type === 'Stock In'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    + Stock In (Add Bags)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, type: 'Stock Out' })}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      adjustData.type === 'Stock Out'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    - Stock Out (Deduct Bags)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Number of Bags *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustData.bags}
                  onChange={(e) => setAdjustData({ ...adjustData, bags: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reference & Notes
                </label>
                <input
                  type="text"
                  value={adjustData.notes}
                  onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                  placeholder="Reason for adjustment (e.g. Godown count correction)"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG DAMAGED BAGS MODAL */}
      {isDamageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Record Damaged / Torn Cement Bags
              </h3>
              <button
                onClick={() => setIsDamageModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDamageSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cement Brand
                </label>
                <select
                  value={damageData.brandName}
                  onChange={(e) => setDamageData({ ...damageData, brandName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {inventory.map(i => (
                    <option key={i.brandId} value={i.brandName}>{i.brandName} (In Stock: {i.bagsInStock} Bags)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Number of Damaged Bags *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={damageData.damagedBags}
                  onChange={(e) => setDamageData({ ...damageData, damagedBags: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cause of Damage / Notes
                </label>
                <textarea
                  rows={2}
                  value={damageData.notes}
                  onChange={(e) => setDamageData({ ...damageData, notes: e.target.value })}
                  placeholder="e.g. Water moisture during monsoon transit"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                Note: Damaged bags are deducted from active inventory and stored separately for factory claims.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDamageModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-rose-700"
                >
                  Record Damaged
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
