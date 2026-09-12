import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginModal } from './components/auth/LoginModal';
import { Dashboard } from './components/dashboard/Dashboard';
import { CustomerManager } from './components/customers/CustomerManager';
import { CompanyOrderManager } from './components/orders/CompanyOrderManager';
import { LogisticsManager } from './components/logistics/LogisticsManager';
import { InventoryManager } from './components/inventory/InventoryManager';
import { SalesManager } from './components/sales/SalesManager';
import { CreditManager } from './components/credit/CreditManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { SettingsManager } from './components/settings/SettingsManager';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainAppContent = () => {
  const {
    currentUser,
    activeTab,
    toastMessage
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If unauthenticated, display the login modal
  if (!currentUser || !currentUser.isAuthenticated) {
    return <LoginModal />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Top Navbar */}
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Dynamic Main View */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'customers' && <CustomerManager />}
          {activeTab === 'orders' && <CompanyOrderManager />}
          {activeTab === 'logistics' && <LogisticsManager />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'sales' && <SalesManager />}
          {activeTab === 'credit' && <CreditManager />}
          {activeTab === 'reports' && <ReportsManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </main>
      </div>

      {/* Global Overlays */}
      <NotificationsDrawer />
      <GlobalSearchModal />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 dark:bg-slate-800 animate-in slide-in-from-bottom-5 duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'danger' && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="h-4 w-4 text-blue-400 shrink-0" />}
          <span>{toastMessage.message}</span>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
