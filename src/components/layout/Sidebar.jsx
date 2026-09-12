import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Building,
  Truck,
  Boxes,
  Receipt,
  CreditCard,
  FileBarChart2,
  Settings,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    analytics,
    settings
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'sales', label: 'Sales & Billing', icon: Receipt, badge: 'New Sale' },
    { id: 'customers', label: 'Customer KYC', icon: Users, badge: analytics.totalCustomersCount },
    { id: 'credit', label: 'Credit (Udhari)', icon: CreditCard, badge: analytics.totalOverdueBalance > 0 ? 'Due' : null, badgeColor: 'bg-rose-500' },
    { id: 'inventory', label: 'Inventory (Stock)', icon: Boxes, badge: analytics.lowStockItems.length > 0 ? `${analytics.lowStockItems.length} Low` : null, badgeColor: 'bg-amber-500' },
    { id: 'orders', label: 'Company Orders', icon: Building, badge: analytics.pendingOrdersCount > 0 ? analytics.pendingOrdersCount : null },
    { id: 'logistics', label: 'Trucks & Drivers', icon: Truck, badge: analytics.incomingTrucksCount > 0 ? analytics.incomingTrucksCount : null },
    { id: 'reports', label: 'Reports & Export', icon: FileBarChart2, badge: 'PDF/XLS' },
    { id: 'settings', label: 'Settings & Backup', icon: Settings, badge: null },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header inside sidebar (mobile close) */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
              TCR
            </div>
            <span className="font-heading font-bold text-slate-900 dark:text-white">
              Navigation Menu
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links list */}
        <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-0.5">
          {/* Business Quick Info Banner (Admin Panel - Above Dashboard) */}
          <div className="mb-2.5">
            <div className="rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-2.5 text-white shadow-sm shadow-blue-500/15">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-100">
                  Admin Panel
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-1.5 py-0.5 text-[9px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active
                </span>
              </div>
              <h3 className="mt-1 font-heading text-xs font-bold leading-tight truncate text-white/95">
                {settings.tradeName || settings.businessName || 'Thakur Transport'}
              </h3>
              <div className="mt-1.5 flex items-center justify-between border-t border-blue-500/30 pt-1 text-[10px]">
                <span className="text-blue-200">Stock in Hand:</span>
                <span className="font-bold text-white">{(analytics.totalBagsInStock || 0).toLocaleString('en-IN')} Bags</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 dark:bg-blue-600 dark:text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor
                        ? `${item.badgeColor} text-white`
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Compact Footer Status */}
        <div className="border-t border-slate-200 px-3 py-2 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>TT v1.0 • Admin ERP</span>
            <span className="flex items-center gap-1 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
