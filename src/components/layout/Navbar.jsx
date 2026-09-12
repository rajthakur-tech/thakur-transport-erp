import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Sun,
  Moon,
  Search,
  Bell,
  RotateCcw,
  User,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Building2,
  Lock,
  CheckCircle2
} from 'lucide-react';

export const Navbar = ({ toggleSidebar }) => {
  const {
    currentUser,
    logout,
    theme,
    setTheme,
    setIsSearchOpen,
    setIsNotificationsOpen,
    notifications,
    settings,
    setActiveTab,
    refreshAppData,
    showToast
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const unreadCount = notifications.length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (refreshAppData) {
      refreshAppData();
    } else {
      showToast('App refreshed & synchronized!', 'success');
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 650);
  };

  const businessDisplayName = settings?.businessName || settings?.tradeName || 'Thakur Transport';
  const logoInitials = businessDisplayName
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'TT';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
      {/* Left side: Hamburger & Brand Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <span className="font-extrabold text-sm tracking-wider">{logoInitials}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-heading text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                {businessDisplayName}
              </h1>
              <span className="hidden sm:inline-flex rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                ADMIN
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              {settings.address?.split(',')[0] || 'Barghat, Seoni (MP)'} • Transport & Dealership ERP
            </p>
          </div>
        </div>
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs font-medium text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-200/70 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
        >
          <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <span className="hidden md:inline">Search records...</span>
          <kbd className="hidden md:inline-block rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm dark:bg-slate-700 dark:text-slate-300">
            Ctrl K
          </kbd>
        </button>

        {/* Update / Refresh WebApp Button (Point 5) */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="group relative rounded-xl p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-all active:scale-90"
          title="Refresh & Update WebApp Data"
          aria-label="Refresh & Update"
        >
          <RotateCcw className={`h-5 w-5 transition-transform duration-500 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : 'group-hover:rotate-180'}`} />
          <span className="sr-only">Update App</span>
        </button>

        {/* Notifications Button */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Notifications"
          title="Live Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse-subtle">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 text-left transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-sm">
              R
            </div>
            <div className="hidden text-xs md:block">
              <div className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                Raj Thakur
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-3 w-3" />
                Administrator
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser?.name || 'Er. Raj Thakur'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Username: admin</p>
                <div className="mt-1.5 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  Sole Administrator
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Dealership Settings
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  Logout Admin Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
