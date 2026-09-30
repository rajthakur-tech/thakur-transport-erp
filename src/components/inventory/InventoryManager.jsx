import React, { useState, useMemo } from 'react';
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
  Package,
  Trash2,
  Warehouse,
  ArrowRightLeft,
  Truck,
  Phone,
  MapPin,
  Building2,
  Edit,
  FileSpreadsheet
} from 'lucide-react';

export const InventoryManager = () => {
  const {
    inventory,
    stockLogs,
    adjustStock,
    recordDamagedBags,
    addInventoryItem,
    deleteInventoryItem,
    deleteStockLog,
    brands,
    godowns,
    addGodown,
    updateGodown,
    deleteGodown,
    stockTransfers,
    transferStockBetweenGodowns,
    deleteStockTransfer,
    analytics,
    currentUser,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGodownTab, setSelectedGodownTab] = useState('ALL'); // 'ALL' | godownId
  const [historyTab, setHistoryTab] = useState('logs'); // 'logs' | 'transfers'

  // Delete Confirmation States
  const [itemToDelete, setItemToDelete] = useState(null);
  const [logToDelete, setLogToDelete] = useState(null);
  const [transferToDelete, setTransferToDelete] = useState(null);

  // Modals
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isGodownModalOpen, setIsGodownModalOpen] = useState(false);

  // New Brand Form State
  const [newBrandForm, setNewBrandForm] = useState({
    brandName: '',
    code: '',
    type: 'PPC 53 Grade',
    bagsInStock: 200,
    minStockAlert: 100,
    costPrice: 330,
    unitPrice: 375
  });

  // Adjust Form State
  const [adjustData, setAdjustData] = useState({
    brandName: inventory[0]?.brandName || 'UltraTech Cement',
    godownId: godowns[0]?.id || 'GD-1',
    type: 'Stock In', // 'Stock In' | 'Stock Out'
    bags: 100,
    reference: 'MANUAL-AUDIT',
    notes: 'Warehouse physical audit count'
  });

  // Damage Form State
  const [damageData, setDamageData] = useState({
    brandName: inventory[0]?.brandName || 'UltraTech Cement',
    godownId: godowns[0]?.id || 'GD-1',
    damagedBags: 5,
    notes: 'Rain water leakage / torn bags during unloading'
  });

  // Inter-Godown Transfer Form State
  const [transferData, setTransferData] = useState({
    fromGodownId: godowns[0]?.id || 'GD-1',
    toGodownId: godowns[1]?.id || (godowns[0]?.id || 'GD-2'),
    brandName: inventory[0]?.brandName || 'UltraTech Cement',
    quantity: 50,
    vehicleNumber: 'MP-28-G-4589',
    driverName: 'Satish Yadav',
    notes: 'Warehouse stock balance replenishment'
  });

  // New / Edit Godown Form State
  const [godownForm, setGodownForm] = useState({
    name: '',
    code: '',
    location: '',
    capacity: 3000,
    incharge: '',
    phone: '',
    description: ''
  });

  // Filtered inventory based on search query
  const filteredInventory = useMemo(() => {
    return inventory.filter(item =>
      item.brandName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  // Godown calculations (Total bags stored in each godown)
  const godownStats = useMemo(() => {
    return godowns.map(g => {
      const totalBagsInGodown = inventory.reduce((sum, inv) => {
        const bags = inv.godownStocks && inv.godownStocks[g.id] !== undefined
          ? Number(inv.godownStocks[g.id])
          : 0;
        return sum + bags;
      }, 0);

      const capacity = Number(g.capacity) || 3000;
      const utilizationPct = Math.min(100, Math.round((totalBagsInGodown / capacity) * 100));

      return {
        ...g,
        totalBagsInGodown,
        capacity,
        utilizationPct,
        availableCapacity: Math.max(0, capacity - totalBagsInGodown)
      };
    });
  }, [godowns, inventory]);

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    const qty = Number(adjustData.bags);
    if (qty <= 0) return;

    const change = adjustData.type === 'Stock In' ? qty : -qty;
    adjustStock(
      adjustData.brandName,
      change,
      adjustData.type,
      adjustData.reference,
      adjustData.notes,
      adjustData.godownId
    );
    setIsAdjustModalOpen(false);
  };

  const handleDamageSubmit = (e) => {
    e.preventDefault();
    const count = Number(damageData.damagedBags);
    if (count <= 0) return;

    recordDamagedBags(damageData.brandName, count, damageData.notes, damageData.godownId);
    setIsDamageModalOpen(false);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const res = transferStockBetweenGodowns(transferData);
    if (res.success) {
      setIsTransferModalOpen(false);
    } else {
      alert(res.error || 'Failed to complete transfer.');
    }
  };

  const handleAddBrandSubmit = (e) => {
    e.preventDefault();
    if (!newBrandForm.brandName.trim()) return;

    addInventoryItem(newBrandForm);
    setNewBrandForm({
      brandName: '',
      code: '',
      type: 'PPC 53 Grade',
      bagsInStock: 200,
      minStockAlert: 100,
      costPrice: 330,
      unitPrice: 375
    });
    setIsAddBrandModalOpen(false);
  };

  const handleGodownSubmit = (e) => {
    e.preventDefault();
    if (!godownForm.name.trim()) return;

    addGodown(godownForm);
    setGodownForm({
      name: '',
      code: '',
      location: '',
      capacity: 3000,
      incharge: '',
      phone: '',
      description: ''
    });
    setIsGodownModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Warehouse Inventory & Godowns
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              Multi-Godown Live Stock
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time godown capacity tracking, inter-warehouse stock transfers, audit logs, and low-stock alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Transfer Stock Button */}
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 transition"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Stock Transfer</span>
          </button>

          {/* Manage Godowns Button */}
          <button
            onClick={() => setIsGodownModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
          >
            <Warehouse className="h-4 w-4 text-blue-500" />
            <span>Manage Godowns ({godowns.length})</span>
          </button>

          {/* Add Brand / Stock */}
          <button
            onClick={() => setIsAddBrandModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300"
          >
            <Plus className="h-4 w-4" />
            <span>Add Brand</span>
          </button>

          {/* Quick Adjust Button */}
          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
            <span>Manual Adjust</span>
          </button>

          {/* Damage Entry */}
          <button
            onClick={() => setIsDamageModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <span>Damaged Entry</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GODOWN CAPACITY SPOTLIGHT CARDS                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {godownStats.map((godown) => (
          <div
            key={godown.id}
            onClick={() => setSelectedGodownTab(selectedGodownTab === godown.id ? 'ALL' : godown.id)}
            className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
              selectedGodownTab === godown.id
                ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/30'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm">
                  {godown.code || 'GD'}
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                    {godown.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[180px]">{godown.location}</span>
                  </p>
                </div>
              </div>

              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                godown.utilizationPct > 85
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}>
                {godown.utilizationPct}% Full
              </span>
            </div>

            {/* Capacity Stats */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Stock in Godown:</span>
                <span className="font-extrabold font-mono text-slate-900 dark:text-white">
                  {formatNumber(godown.totalBagsInGodown)} / {formatNumber(godown.capacity)} Bags
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    godown.utilizationPct > 85
                      ? 'bg-rose-500'
                      : godown.utilizationPct > 60
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${godown.utilizationPct}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Free Space: {formatNumber(godown.availableCapacity)} Bags</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Incharge: {godown.incharge} ({godown.phone})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Godown Tab Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cement brand (e.g. UltraTech, Ambuja, Dalmia)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Godown Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 overflow-x-auto">
          <button
            onClick={() => setSelectedGodownTab('ALL')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              selectedGodownTab === 'ALL'
                ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            🏢 Consolidated (All Godowns)
          </button>
          {godowns.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGodownTab(g.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                selectedGodownTab === g.id
                  ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              {g.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BRAND-WISE INVENTORY CARDS GRID                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredInventory.map((item) => {
          const brandMeta = brands.find(b => b.name === item.brandName) || {};
          const isLowStock = Number(item.bagsInStock) <= (Number(item.minStockAlert) || 100);
          
          // Displayed stock depends on selected godown filter
          const displayedStock = selectedGodownTab === 'ALL'
            ? Number(item.bagsInStock)
            : ((item.godownStocks && item.godownStocks[selectedGodownTab] !== undefined)
                ? Number(item.godownStocks[selectedGodownTab])
                : 0);

          return (
            <div
              key={item.brandId || item.brandName}
              className={`relative flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition-all ${
                isLowStock
                  ? 'border-amber-300 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-400">
                      {brandMeta.code || 'CEM'}
                    </span>
                    <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                      {item.brandName}
                    </h3>
                    <p className="text-[10px] text-slate-500">{brandMeta.type || 'PPC 53 Grade'}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isLowStock ? (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        In Stock
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(item);
                      }}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                      title={`Delete ${item.brandName} from Inventory`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stock Number */}
                <div className="mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`font-heading text-3xl font-extrabold font-mono ${
                      isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {formatNumber(displayedStock)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Bags</span>
                  </div>

                  {selectedGodownTab !== 'ALL' ? (
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                      In {godowns.find(g => g.id === selectedGodownTab)?.name} (Total All: {item.bagsInStock})
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2 text-[10px]">
                      {godowns.map(g => {
                        const gQty = item.godownStocks && item.godownStocks[g.id] !== undefined ? item.godownStocks[g.id] : 0;
                        return (
                          <div key={g.id} className="flex justify-between text-slate-500">
                            <span className="truncate max-w-[130px]">{g.name.split(' (')[0]}:</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{gQty} bags</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Info & Price */}
              <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 flex items-center justify-between">
                <span>Rate: <strong className="text-slate-800 dark:text-slate-200">₹{brandMeta.unitPrice || 380}</strong></span>
                <span className="text-rose-600 font-medium">Damaged: {item.damagedBags || 0}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* AUDIT LOGS & INTER-GODOWN TRANSFERS SECTION                               */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
              Stock Movement & Transfer Audit Logs
            </h2>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setHistoryTab('logs')}
              className={`rounded-lg px-3 py-1 font-bold transition ${
                historyTab === 'logs'
                  ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Stock In / Out Logs ({stockLogs.length})
            </button>
            <button
              onClick={() => setHistoryTab('transfers')}
              className={`rounded-lg px-3 py-1 font-bold transition ${
                historyTab === 'transfers'
                  ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Inter-Godown Transfers ({stockTransfers.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Stock Logs */}
        {historyTab === 'logs' && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Cement Brand</th>
                  <th className="py-2.5 px-3 font-semibold">Godown Location</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Bags</th>
                  <th className="py-2.5 px-3 font-semibold">Reference</th>
                  <th className="py-2.5 px-3 font-semibold">Notes</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockLogs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{formatDate(log.date)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold ${
                        log.type === 'Stock In'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : log.type === 'Transfer'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          : log.type === 'Damaged'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{log.brandName}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{log.godownName || 'Main Depot'}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-900 dark:text-white">
                      {log.bags}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{log.reference || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{log.notes || '-'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setLogToDelete(log)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete stock movement log"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Inter-Godown Transfers */}
        {historyTab === 'transfers' && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Challan No</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Source (From)</th>
                  <th className="py-2.5 px-3 font-semibold">Destination (To)</th>
                  <th className="py-2.5 px-3 font-semibold">Brand</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Bags</th>
                  <th className="py-2.5 px-3 font-semibold">Vehicle / Driver</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockTransfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{trf.transferNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{formatDate(trf.date)}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{trf.fromGodownName}</td>
                    <td className="py-2.5 px-3 font-medium text-emerald-700 dark:text-emerald-400">{trf.toGodownName}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{trf.brandName}</td>
                    <td className="py-2.5 px-3 font-mono font-extrabold text-center text-blue-600 dark:text-blue-400 text-sm">
                      {trf.quantity} Bags
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {trf.vehicleNumber} ({trf.driverName})
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {trf.status || 'Completed'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setTransferToDelete(trf)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete transfer challan record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: INTER-GODOWN STOCK TRANSFER                                      */}
      {/* ========================================================================= */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Inter-Godown Stock Transfer (गोदाम ट्रांसफर)
                </h3>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-4">
              {/* Source & Destination Godowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Source Godown (From) *
                  </label>
                  <select
                    value={transferData.fromGodownId}
                    onChange={(e) => setTransferData({ ...transferData, fromGodownId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {godowns.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Destination Godown (To) *
                  </label>
                  <select
                    value={transferData.toGodownId}
                    onChange={(e) => setTransferData({ ...transferData, toGodownId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {godowns.filter(g => g.id !== transferData.fromGodownId).map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cement Brand & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cement Brand *
                  </label>
                  <select
                    value={transferData.brandName}
                    onChange={(e) => setTransferData({ ...transferData, brandName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {brands.map(b => {
                      const invItem = inventory.find(i => i.brandName === b.name);
                      const availInFrom = (invItem?.godownStocks && invItem.godownStocks[transferData.fromGodownId]) !== undefined
                        ? invItem.godownStocks[transferData.fromGodownId]
                        : (invItem?.bagsInStock || 0);
                      return (
                        <option key={b.id} value={b.name}>
                          {b.name} (Avail: {availInFrom} bags)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transfer Quantity (Bags) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={transferData.quantity}
                    onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-base font-extrabold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Vehicle & Driver Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Truck / Vehicle No (Optional)
                  </label>
                  <input
                    type="text"
                    value={transferData.vehicleNumber}
                    onChange={(e) => setTransferData({ ...transferData, vehicleNumber: e.target.value })}
                    placeholder="e.g. MP-28-G-4589"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Driver / Yard Staff Name
                  </label>
                  <input
                    type="text"
                    value={transferData.driverName}
                    onChange={(e) => setTransferData({ ...transferData, driverName: e.target.value })}
                    placeholder="e.g. Satish Yadav"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transfer Remarks / Notes
                </label>
                <input
                  type="text"
                  value={transferData.notes}
                  onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                  placeholder="Reason for transfer..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-95"
                >
                  Transfer Bags & Generate Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANAGE GODOWNS                                                   */}
      {/* ========================================================================= */}
      {isGodownModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-blue-600" />
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Manage Godowns & Storage Yards
                </h3>
              </div>
              <button
                onClick={() => setIsGodownModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List Existing Godowns */}
            <div className="mt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Godowns ({godowns.length})</h4>
              <div className="space-y-2">
                {godowns.map(g => (
                  <div key={g.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{g.name} <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-normal">({g.code})</span></p>
                      <p className="text-[11px] text-slate-500">{g.location} • Incharge: {g.incharge} ({g.phone})</p>
                      <p className="text-[10px] text-slate-400">Max Capacity: {formatNumber(g.capacity)} Bags</p>
                    </div>

                    <button
                      onClick={() => deleteGodown(g.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      title="Delete Godown"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Godown Form */}
            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">+ Add New Godown / Yard</h4>
              <form onSubmit={handleGodownSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Godown Name *</label>
                    <input
                      type="text"
                      required
                      value={godownForm.name}
                      onChange={(e) => setGodownForm({ ...godownForm, name: e.target.value })}
                      placeholder="e.g. Highway Depot 2"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Godown Code *</label>
                    <input
                      type="text"
                      value={godownForm.code}
                      onChange={(e) => setGodownForm({ ...godownForm, code: e.target.value })}
                      placeholder="e.g. GD-04"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Location Address</label>
                    <input
                      type="text"
                      value={godownForm.location}
                      onChange={(e) => setGodownForm({ ...godownForm, location: e.target.value })}
                      placeholder="e.g. Near Seoni Bypass"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Capacity (Bags)</label>
                    <input
                      type="number"
                      value={godownForm.capacity}
                      onChange={(e) => setGodownForm({ ...godownForm, capacity: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Incharge Name</label>
                    <input
                      type="text"
                      value={godownForm.incharge}
                      onChange={(e) => setGodownForm({ ...godownForm, incharge: e.target.value })}
                      placeholder="Manager / Incharge name"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Incharge Contact Mobile</label>
                    <input
                      type="tel"
                      value={godownForm.phone}
                      onChange={(e) => setGodownForm({ ...godownForm, phone: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                  >
                    Save Godown
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MANUAL STOCK ADJUSTMENT                                          */}
      {/* ========================================================================= */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Manual Stock Adjustment
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Godown *
                </label>
                <select
                  value={adjustData.godownId}
                  onChange={(e) => setAdjustData({ ...adjustData, godownId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {godowns.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cement Brand *
                </label>
                <select
                  value={adjustData.brandName}
                  onChange={(e) => setAdjustData({ ...adjustData, brandName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adjustment Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Stock In', 'Stock Out'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAdjustData({ ...adjustData, type })}
                      className={`rounded-xl py-2 text-xs font-bold transition ${
                        adjustData.type === type
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
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
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  value={adjustData.notes}
                  onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                >
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RECORD DAMAGED BAGS                                              */}
      {/* ========================================================================= */}
      {isDamageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-heading text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="h-5 w-5" />
                <span>Record Damaged Cement Bags</span>
              </h3>
              <button
                onClick={() => setIsDamageModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDamageSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Godown *
                </label>
                <select
                  value={damageData.godownId}
                  onChange={(e) => setDamageData({ ...damageData, godownId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {godowns.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cement Brand *
                </label>
                <select
                  value={damageData.brandName}
                  onChange={(e) => setDamageData({ ...damageData, brandName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Damaged Quantity (Bags) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={damageData.damagedBags}
                  onChange={(e) => setDamageData({ ...damageData, damagedBags: e.target.value })}
                  className="w-full rounded-xl border border-rose-300 bg-white p-2.5 text-base font-bold text-rose-600 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Damage Cause / Notes
                </label>
                <input
                  type="text"
                  value={damageData.notes}
                  onChange={(e) => setDamageData({ ...damageData, notes: e.target.value })}
                  placeholder="e.g. Monsoon rain wet bags or burst during handling"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDamageModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700"
                >
                  Record Damaged Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD NEW BRAND                                                    */}
      {/* ========================================================================= */}
      {isAddBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Add New Cement Brand / Product
              </h3>
              <button
                onClick={() => setIsAddBrandModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddBrandSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={newBrandForm.brandName}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, brandName: e.target.value })}
                  placeholder="e.g. Wonder Cement"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Code</label>
                  <input
                    type="text"
                    value={newBrandForm.code}
                    onChange={(e) => setNewBrandForm({ ...newBrandForm, code: e.target.value })}
                    placeholder="WND"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs uppercase font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grade / Type</label>
                  <input
                    type="text"
                    value={newBrandForm.type}
                    onChange={(e) => setNewBrandForm({ ...newBrandForm, type: e.target.value })}
                    placeholder="PPC 53 Grade"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Bags in Stock</label>
                  <input
                    type="number"
                    value={newBrandForm.bagsInStock}
                    onChange={(e) => setNewBrandForm({ ...newBrandForm, bagsInStock: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={newBrandForm.minStockAlert}
                    onChange={(e) => setNewBrandForm({ ...newBrandForm, minStockAlert: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={newBrandForm.costPrice}
                    onChange={(e) => setNewBrandForm({ ...newBrandForm, costPrice: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Selling Rate / Bag (₹)</label>
                  <input
                    type="number"
                    value={newBrandForm.unitPrice}
                    onChange={(e) => setNewBrandForm({ ...newBrandForm, unitPrice: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBrandModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                >
                  Add Brand to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODALS                                                */}
      {/* ========================================================================= */}

      {/* 1. DELETE BRAND / STOCK ITEM MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Delete Inventory Brand?
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">{itemToDelete.brandName}</strong> from inventory stock?
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/60 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Brand Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{itemToDelete.brandName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current In Stock:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{formatNumber(itemToDelete.bagsInStock)} Bags</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Damaged Bags:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{itemToDelete.damagedBags || 0} Bags</span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>This will remove this product from the inventory stock list.</span>
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteInventoryItem(itemToDelete.brandId || itemToDelete.brandName);
                  setItemToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition"
              >
                Delete Brand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DELETE STOCK LOG MODAL */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Delete Stock Movement Log?
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Delete audit log for <strong className="text-slate-800 dark:text-slate-200">{logToDelete.brandName}</strong> ({logToDelete.type})?
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/60 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-mono text-slate-900 dark:text-white">{formatDate(logToDelete.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type & Bags:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{logToDelete.type} • {logToDelete.bags} Bags</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{logToDelete.reference || '-'}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStockLog(logToDelete.id);
                  setLogToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition"
              >
                Delete Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. DELETE TRANSFER RECORD MODAL */}
      {transferToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Delete Transfer Record?
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Delete challan <strong className="text-blue-600 dark:text-blue-400">{transferToDelete.transferNumber}</strong>?
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/60 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Route:</span>
                <span className="font-medium text-slate-900 dark:text-white">{transferToDelete.fromGodownName} ➔ {transferToDelete.toGodownName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Brand & Quantity:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{transferToDelete.brandName} • {transferToDelete.quantity} Bags</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle / Driver:</span>
                <span className="text-slate-700 dark:text-slate-300">{transferToDelete.vehicleNumber} ({transferToDelete.driverName})</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTransferToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStockTransfer(transferToDelete.id);
                  setTransferToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition"
              >
                Delete Challan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
