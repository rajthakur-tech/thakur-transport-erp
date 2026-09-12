import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  AlertTriangle,
  Clock,
  IndianRupee,
  Truck,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const NotificationsDrawer = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications,
    setActiveTab
  } = useApp();

  if (!isNotificationsOpen) return null;

  const handleNavigate = (type) => {
    setIsNotificationsOpen(false);
    if (type === 'stock') setActiveTab('inventory');
    if (type === 'order' || type === 'delivery') setActiveTab('orders');
    if (type === 'credit') setActiveTab('credit');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsNotificationsOpen(false)}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <Bell className="h-4 w-4" />
              </div>
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Live Notifications & Alerts
              </h2>
            </div>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/50 mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">All Systems Nominal</p>
                <p className="text-xs mt-1">No urgent alerts for stock, payments, or logistics.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isDanger = notif.severity === 'danger';
                const isWarning = notif.severity === 'warning';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNavigate(notif.type)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all hover:scale-[1.01] ${
                      isDanger
                        ? 'border-rose-200 bg-rose-50/60 dark:border-rose-900/40 dark:bg-rose-950/20'
                        : isWarning
                        ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20'
                        : 'border-blue-200 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {notif.type === 'stock' && <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />}
                        {notif.type === 'order' && <Clock className="h-4 w-4 text-rose-600 shrink-0" />}
                        {notif.type === 'credit' && <IndianRupee className="h-4 w-4 text-rose-600 shrink-0" />}
                        {notif.type === 'delivery' && <Truck className="h-4 w-4 text-blue-600 shrink-0" />}
                        
                        <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-white">
                          {notif.title}
                        </h4>
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {notif.description}
                    </p>

                    <div className="mt-2 text-[10px] text-slate-400 font-medium">
                      Click to inspect module →
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              System alerts auto-refresh based on inventory thresholds and payment dates.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
