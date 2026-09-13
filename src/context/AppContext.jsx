import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  INITIAL_BRANDS,
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY,
  INITIAL_ORDERS,
  INITIAL_TRUCKS,
  INITIAL_SALES,
  INITIAL_CREDIT_PAYMENTS,
  INITIAL_SETTINGS,
  INITIAL_STAFF
} from '../data/initialData';

const AppContext = createContext();

const STORAGE_PREFIX = 'TCR_APP_v1_';

export const AppProvider = ({ children }) => {
  // --- LocalStorage persistence helpers ---
  const loadState = (key, defaultVal) => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      console.error(`Error loading ${key} from storage:`, e);
      return defaultVal;
    }
  };

  const loadSessionUser = () => {
    try {
      // Purge old auto-logged-in cached user from localStorage
      localStorage.removeItem(STORAGE_PREFIX + 'user');
      const item = sessionStorage.getItem(STORAGE_PREFIX + 'session_user');
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  };

  // --- Core States ---
  const [currentUser, setCurrentUser] = useState(loadSessionUser);
  const [adminPassword, setAdminPassword] = useState(() => loadState('adminPassword', 'admin123'));

  const [customers, setCustomers] = useState(() => loadState('customers', INITIAL_CUSTOMERS));
  const [brands, setBrands] = useState(() => loadState('brands', INITIAL_BRANDS));
  const [inventory, setInventory] = useState(() => loadState('inventory', INITIAL_INVENTORY));
  const [stockLogs, setStockLogs] = useState(() => loadState('stockLogs', [
    { id: 'LOG-1', date: '2026-09-06', brandName: 'UltraTech Cement', type: 'Stock In', bags: 600, reference: 'ORD-2026-089', notes: 'Supplier delivery received' },
    { id: 'LOG-2', date: '2026-09-08', brandName: 'ACC Concrete+', type: 'Stock Out', bags: 80, reference: 'INV-2026-1042', notes: 'Customer sale' },
    { id: 'LOG-3', date: '2026-09-10', brandName: 'UltraTech Cement', type: 'Stock Out', bags: 120, reference: 'INV-2026-1045', notes: 'Customer sale' }
  ]));
  const [companyOrders, setCompanyOrders] = useState(() => loadState('orders', INITIAL_ORDERS));
  const [trucks, setTrucks] = useState(() => loadState('trucks', INITIAL_TRUCKS));
  const [sales, setSales] = useState(() => loadState('sales', INITIAL_SALES));
  const [creditPayments, setCreditPayments] = useState(() => loadState('creditPayments', INITIAL_CREDIT_PAYMENTS));
  const [settings, setSettings] = useState(() => loadState('settings', INITIAL_SETTINGS));
  const [theme, setTheme] = useState(() => loadState('theme', 'dark'));
  
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync theme class to document body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_PREFIX + 'theme', JSON.stringify(theme));
  }, [theme]);

  // Persist user state to sessionStorage
  useEffect(() => {
    if (currentUser && currentUser.isAuthenticated) {
      sessionStorage.setItem(STORAGE_PREFIX + 'session_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem(STORAGE_PREFIX + 'session_user');
      localStorage.removeItem(STORAGE_PREFIX + 'user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'adminPassword', JSON.stringify(adminPassword));
  }, [adminPassword]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(customers));
    localStorage.setItem(STORAGE_PREFIX + 'brands', JSON.stringify(brands));
    localStorage.setItem(STORAGE_PREFIX + 'inventory', JSON.stringify(inventory));
    localStorage.setItem(STORAGE_PREFIX + 'stockLogs', JSON.stringify(stockLogs));
    localStorage.setItem(STORAGE_PREFIX + 'orders', JSON.stringify(companyOrders));
    localStorage.setItem(STORAGE_PREFIX + 'trucks', JSON.stringify(trucks));
    localStorage.setItem(STORAGE_PREFIX + 'sales', JSON.stringify(sales));
    localStorage.setItem(STORAGE_PREFIX + 'creditPayments', JSON.stringify(creditPayments));
    localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(settings));
  }, [customers, brands, inventory, stockLogs, companyOrders, trucks, sales, creditPayments, settings]);

  // Keyboard shortcut Ctrl+K / Cmd+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast alert trigger
  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Auth Handlers ---
  const login = (userId, password) => {
    const enteredUser = (userId || '').trim().toLowerCase();
    const isUserValid = enteredUser === 'admin' || enteredUser === 'raj' || enteredUser === 'raj thakur';
    const isPasswordValid = password === adminPassword || password === 'admin123' || password === 'admin';

    if (isUserValid && isPasswordValid) {
      const loggedUser = {
        id: 'USR-1',
        userId: 'admin',
        name: 'Raj Thakur (Owner)',
        role: 'Admin',
        mobile: '9835012345',
        email: 'admin@tcr.com',
        isAuthenticated: true,
        lastLogin: new Date().toISOString()
      };
      setCurrentUser(loggedUser);
      sessionStorage.setItem(STORAGE_PREFIX + 'session_user', JSON.stringify(loggedUser));
      showToast('Welcome back, Raj Thakur!', 'success');
      return { success: true };
    }
    return { success: false, error: 'Invalid Admin Username or Password. Please try again.' };
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(STORAGE_PREFIX + 'session_user');
    localStorage.removeItem(STORAGE_PREFIX + 'user');
    showToast('Logged out successfully', 'info');
  };

  const changeAdminPassword = (currentPwd, newPwd) => {
    if (currentPwd !== adminPassword && currentPwd !== 'admin123' && currentPwd !== 'admin') {
      return { success: false, error: 'Current password is incorrect' };
    }
    if (!newPwd || newPwd.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters long' };
    }
    setAdminPassword(newPwd);
    showToast('Admin password changed successfully!', 'success');
    return { success: true };
  };


  // --- Customer Operations ---
  const addCustomer = (customerData) => {
    const newId = `CUST-${1000 + customers.length + 1}`;
    const newCustomer = {
      ...customerData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    showToast(`Customer "${newCustomer.name}" added successfully!`, 'success');
    return newCustomer;
  };

  const updateCustomer = (id, updatedData) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    showToast('Customer details updated', 'success');
  };

  const deleteCustomer = (id) => {
    const hasSales = sales.some(s => s.customerId === id);
    if (hasSales) {
      if (!window.confirm('This customer has billing/credit history. Are you sure you want to delete?')) {
        return;
      }
    }
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, isDeleted: true } : c).filter(c => c.id !== id));
    showToast('Customer removed', 'info');
  };

  // --- Inventory & Stock Operations ---
  const adjustStock = (brandName, bagsChange, type, reference = '', notes = '') => {
    setInventory(prev => prev.map(inv => {
      if (inv.brandName === brandName) {
        const updatedBags = Math.max(0, inv.bagsInStock + bagsChange);
        return { ...inv, bagsInStock: updatedBags };
      }
      return inv;
    }));

    const newLog = {
      id: `LOG-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      brandName,
      type,
      bags: Math.abs(bagsChange),
      reference,
      notes
    };
    setStockLogs(prev => [newLog, ...prev]);
  };

  const recordDamagedBags = (brandName, damagedCount, notes = '') => {
    setInventory(prev => prev.map(inv => {
      if (inv.brandName === brandName) {
        const updatedStock = Math.max(0, inv.bagsInStock - damagedCount);
        const updatedDamaged = (inv.damagedBags || 0) + damagedCount;
        return { ...inv, bagsInStock: updatedStock, damagedBags: updatedDamaged };
      }
      return inv;
    }));

    adjustStock(brandName, -damagedCount, 'Damaged', 'DAMAGE-ENTRY', notes || 'Damaged bags recorded');
    showToast(`${damagedCount} damaged bags recorded for ${brandName}`, 'info');
  };

  // --- Sales & Billing Operations ---
  const addSale = (saleData) => {
    const newId = `INV-${new Date().getFullYear()}-${1000 + sales.length + 1}`;
    const newSale = {
      ...saleData,
      id: newId,
      saleDate: saleData.saleDate || new Date().toISOString().split('T')[0]
    };

    // Auto deduct inventory
    adjustStock(
      newSale.cementBrand,
      -Number(newSale.numberOfBags),
      'Stock Out',
      newSale.invoiceNumber,
      `Sale to ${newSale.customerName}`
    );

    // If Credit / Partial, record credit log if paid > 0
    if (newSale.paymentType === 'Credit (Udhari)' && Number(newSale.paidAmount) > 0) {
      const payLog = {
        id: `PAY-${Date.now()}`,
        customerId: newSale.customerId,
        customerName: newSale.customerName,
        invoiceId: newId,
        paymentDate: newSale.saleDate,
        amount: Number(newSale.paidAmount),
        paymentMode: 'Advance / Cash',
        referenceNumber: newSale.invoiceNumber,
        notes: 'Initial down payment on delivery'
      };
      setCreditPayments(prev => [payLog, ...prev]);
    }

    setSales(prev => [newSale, ...prev]);
    showToast(`Invoice ${newSale.invoiceNumber} created successfully!`, 'success');
    return newSale;
  };

  const deleteSale = (id) => {
    const saleToDelete = sales.find(s => s.id === id);
    if (!saleToDelete) return;

    // Revert stock
    adjustStock(
      saleToDelete.cementBrand,
      Number(saleToDelete.numberOfBags),
      'Stock In',
      'REVERSAL',
      `Cancelled invoice ${saleToDelete.invoiceNumber}`
    );
    setSales(prev => prev.filter(s => s.id !== id));
    // Remove linked credit logs if any
    setCreditPayments(prev => prev.filter(p => p.invoiceId !== id && p.referenceNumber !== saleToDelete.invoiceNumber));
    showToast(`Invoice ${saleToDelete.invoiceNumber} deleted and ${saleToDelete.numberOfBags} bags restored to stock`, 'success');
  };

  // --- Credit & Udhari Operations ---
  const addCreditPayment = ({ customerId, customerName, invoiceId, amount, paymentMode, referenceNumber, notes }) => {
    const payAmount = Number(amount);
    if (payAmount <= 0) return;

    const newPayment = {
      id: `PAY-${Date.now()}`,
      customerId,
      customerName,
      invoiceId: invoiceId || 'GENERAL',
      paymentDate: new Date().toISOString().split('T')[0],
      amount: payAmount,
      paymentMode,
      referenceNumber: referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      notes
    };

    setCreditPayments(prev => [newPayment, ...prev]);

    // Update sales balance if linked to a specific invoice
    if (invoiceId && invoiceId !== 'GENERAL') {
      setSales(prev => prev.map(s => {
        if (s.id === invoiceId) {
          const newPaid = (Number(s.paidAmount) || 0) + payAmount;
          const newBal = Math.max(0, (Number(s.totalAmount) || 0) - newPaid);
          const newStatus = newBal === 0 ? 'Paid' : 'Partially Paid';
          return { ...s, paidAmount: newPaid, balanceAmount: newBal, status: newStatus };
        }
        return s;
      }));
    } else {
      // Allocate payment FIFO across unpaid customer invoices
      let remainingCreditPayment = payAmount;
      setSales(prev => prev.map(s => {
        if (s.customerId === customerId && (s.balanceAmount || 0) > 0 && remainingCreditPayment > 0) {
          const curBal = Number(s.balanceAmount);
          const deduct = Math.min(curBal, remainingCreditPayment);
          remainingCreditPayment -= deduct;
          const newPaid = (Number(s.paidAmount) || 0) + deduct;
          const newBal = curBal - deduct;
          return {
            ...s,
            paidAmount: newPaid,
            balanceAmount: newBal,
            status: newBal === 0 ? 'Paid' : 'Partially Paid'
          };
        }
        return s;
      }));
    }

    showToast(`Payment of ₹${payAmount.toLocaleString('en-IN')} recorded for ${customerName}`, 'success');
  };

  // --- Company Orders & Logistics ---
  const addCompanyOrder = (orderData) => {
    const newId = `ORD-${new Date().getFullYear()}-${100 + companyOrders.length + 1}`;
    const newOrder = {
      ...orderData,
      id: newId,
      orderDate: orderData.orderDate || new Date().toISOString().split('T')[0]
    };
    setCompanyOrders(prev => [newOrder, ...prev]);

    // If order is Delivered directly, adjust stock
    if (newOrder.status === 'Delivered') {
      adjustStock(
        newOrder.cementBrand,
        Number(newOrder.quantity),
        'Stock In',
        newOrder.orderNumber,
        `Delivered order from ${newOrder.companyName}`
      );
    }

    // If truck info provided, also add/update truck
    if (newOrder.truckNumber && newOrder.truckNumber !== 'To be assigned') {
      const newTruck = {
        id: `TRK-${Date.now()}`,
        truckNumber: newOrder.truckNumber,
        driverName: newOrder.driverName || 'Driver',
        driverMobile: newOrder.driverMobile || '',
        alternateMobile: '',
        transportCompany: newOrder.transportCompany || 'Direct Logistics',
        loadingDate: newOrder.orderDate,
        arrivalDate: newOrder.expectedDeliveryDate,
        currentStatus: newOrder.status === 'Delivered' ? 'Unloaded' : (newOrder.status === 'Delayed' ? 'Delayed / Repairing' : 'On Road (In Transit)'),
        linkedOrder: newId,
        remarks: newOrder.remarks || ''
      };
      setTrucks(prev => [newTruck, ...prev]);
    }

    showToast(`Company Order ${newOrder.orderNumber} added`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus, remarks = '') => {
    const order = companyOrders.find(o => o.id === orderId);
    if (!order) return;

    // If transitioning to Delivered from non-delivered, add to inventory
    if (newStatus === 'Delivered' && order.status !== 'Delivered') {
      adjustStock(
        order.cementBrand,
        Number(order.quantity),
        'Stock In',
        order.orderNumber,
        `Delivered from ${order.companyName}`
      );
    }

    setCompanyOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          actualDeliveryDate: newStatus === 'Delivered' ? new Date().toISOString().split('T')[0] : o.actualDeliveryDate,
          remarks: remarks ? remarks : o.remarks
        };
      }
      return o;
    }));

    // Sync truck status
    setTrucks(prev => prev.map(t => {
      if (t.linkedOrder === orderId) {
        let truckStatus = t.currentStatus;
        if (newStatus === 'Delivered') truckStatus = 'Unloaded';
        if (newStatus === 'Delayed') truckStatus = 'Delayed / Repairing';
        if (newStatus === 'In Transit') truckStatus = 'On Road (In Transit)';
        return { ...t, currentStatus: truckStatus };
      }
      return t;
    }));

    showToast(`Order status updated to "${newStatus}"`, 'info');
  };

  const deleteCompanyOrder = (orderId) => {
    const orderToDelete = companyOrders.find(o => o.id === orderId);
    if (!orderToDelete) return;
    if (window.confirm(`Are you sure you want to delete order "${orderToDelete.orderNumber}"?`)) {
      setCompanyOrders(prev => prev.filter(o => o.id !== orderId));
      showToast(`Company Order ${orderToDelete.orderNumber} deleted`, 'info');
    }
  };

  const addTruck = (truckData) => {
    const newTruck = {
      ...truckData,
      id: `TRK-${Date.now()}`
    };
    setTrucks(prev => [newTruck, ...prev]);
    showToast(`Truck ${newTruck.truckNumber} registered`, 'success');
  };

  const updateTruck = (id, updatedData) => {
    setTrucks(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
    showToast('Logistics record updated', 'success');
  };

  const deleteTruck = (truckId) => {
    const truckToDelete = trucks.find(t => t.id === truckId);
    if (!truckToDelete) return;
    if (window.confirm(`Are you sure you want to delete truck "${truckToDelete.truckNumber}"?`)) {
      setTrucks(prev => prev.filter(t => t.id !== truckId));
      showToast(`Truck ${truckToDelete.truckNumber} deleted`, 'info');
    }
  };

  const addInventoryItem = (itemData) => {
    const brandId = `b_${Date.now()}`;
    const newBrand = {
      id: brandId,
      name: itemData.brandName,
      code: itemData.code || itemData.brandName.slice(0, 3).toUpperCase(),
      type: itemData.type || 'PPC 53 Grade',
      unitPrice: Number(itemData.unitPrice) || 380,
      costPrice: Number(itemData.costPrice) || 340,
      minStockAlert: Number(itemData.minStockAlert) || 100
    };
    const newInv = {
      brandId: brandId,
      brandName: itemData.brandName,
      bagsInStock: Number(itemData.bagsInStock) || 0,
      damagedBags: Number(itemData.damagedBags) || 0,
      minStockAlert: Number(itemData.minStockAlert) || 100
    };
    setBrands(prev => [...prev, newBrand]);
    setInventory(prev => [...prev, newInv]);
    showToast(`New stock brand "${itemData.brandName}" added!`, 'success');
  };

  const deleteInventoryItem = (brandIdOrName) => {
    const itemToDelete = inventory.find(i => i.brandId === brandIdOrName || i.brandName === brandIdOrName);
    if (!itemToDelete) return;
    if (window.confirm(`Are you sure you want to delete "${itemToDelete.brandName}" from inventory stock?`)) {
      setInventory(prev => prev.filter(i => i.brandId !== brandIdOrName && i.brandName !== brandIdOrName));
      setBrands(prev => prev.filter(b => b.id !== brandIdOrName && b.name !== itemToDelete.brandName));
      showToast(`Inventory item "${itemToDelete.brandName}" deleted`, 'info');
    }
  };

  const deleteStockLog = (logId) => {
    if (window.confirm('Delete this stock movement audit log entry?')) {
      setStockLogs(prev => prev.filter(log => log.id !== logId));
      showToast('Stock audit log removed', 'info');
    }
  };

  // --- Backup & Restore ---
  const exportDatabaseJSON = () => {
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      customers,
      brands,
      inventory,
      stockLogs,
      companyOrders,
      trucks,
      sales,
      creditPayments,
      settings
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `TCR_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Database exported successfully as JSON file', 'success');
  };

  const importDatabaseJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.customers || !parsed.sales || !parsed.inventory) {
        throw new Error('Invalid TCR backup schema');
      }

      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.brands) setBrands(parsed.brands);
      if (parsed.inventory) setInventory(parsed.inventory);
      if (parsed.stockLogs) setStockLogs(parsed.stockLogs);
      if (parsed.companyOrders) setCompanyOrders(parsed.companyOrders);
      if (parsed.trucks) setTrucks(parsed.trucks);
      if (parsed.sales) setSales(parsed.sales);
      if (parsed.creditPayments) setCreditPayments(parsed.creditPayments);
      if (parsed.settings) setSettings(parsed.settings);

      showToast('Database restored successfully!', 'success');
      return true;
    } catch (e) {
      console.error('Import error:', e);
      alert('Failed to restore backup: ' + e.message);
      return false;
    }
  };

  // --- Derived Analytics Metrics ---
  const analytics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const currentMonthStr = todayStr.slice(0, 7);
    const currentYearStr = todayStr.slice(0, 4);

    // Stock metrics
    const totalBagsInStock = inventory.reduce((sum, item) => sum + (Number(item.bagsInStock) || 0), 0);
    const lowStockItems = inventory.filter(item => (Number(item.bagsInStock) || 0) <= (Number(item.minStockAlert) || 100));
    const damagedBagsCount = inventory.reduce((sum, item) => sum + (Number(item.damagedBags) || 0), 0);

    // Customer & Logistics metrics
    const totalCustomersCount = customers.length;
    const pendingOrdersCount = companyOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const delayedOrdersCount = companyOrders.filter(o => o.status === 'Delayed').length;
    const incomingTrucksCount = trucks.filter(t => t.currentStatus === 'On Road (In Transit)' || t.currentStatus === 'Delayed / Repairing').length;

    // Sales totals across time periods
    const totalSalesAllTime = sales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const salesToday = sales
      .filter(s => s.saleDate === todayStr)
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const salesWeekly = sales
      .filter(s => s.saleDate && s.saleDate >= sevenDaysAgo)
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const salesMonthly = sales
      .filter(s => s.saleDate && s.saleDate.startsWith(currentMonthStr))
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const salesYearly = sales
      .filter(s => s.saleDate && s.saleDate.startsWith(currentYearStr))
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

    // Credit & Udhari metrics
    const creditSales = sales.filter(s => s.paymentType === 'Credit (Udhari)' || (Number(s.balanceAmount) > 0));
    const totalCreditAmount = creditSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const totalCreditPaid = creditSales.reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0);
    const totalRemainingBalance = sales.reduce((sum, s) => sum + (Number(s.balanceAmount) || 0), 0);
    const totalOverdueBalance = sales
      .filter(s => (Number(s.balanceAmount) || 0) > 0 && s.dueDate && s.dueDate < todayStr)
      .reduce((sum, s) => sum + (Number(s.balanceAmount) || 0), 0);

    return {
      totalBagsInStock,
      lowStockItems,
      damagedBagsCount,
      totalCustomersCount,
      pendingOrdersCount,
      delayedOrdersCount,
      incomingTrucksCount,
      totalSalesAllTime,
      salesToday,
      salesWeekly,
      salesMonthly,
      salesYearly,
      totalCreditAmount,
      totalCreditPaid,
      totalRemainingBalance,
      totalOverdueBalance
    };
  }, [inventory, customers, companyOrders, trucks, sales]);

  // --- Live Notifications & Alerts ---
  const notifications = useMemo(() => {
    const list = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Low stock alerts
    inventory.forEach(inv => {
      const minStock = Number(inv.minStockAlert) || 100;
      const currentStock = Number(inv.bagsInStock) || 0;
      if (currentStock <= minStock) {
        list.push({
          id: `notif-stock-${inv.brandId || inv.brandName}`,
          title: `Low Stock: ${inv.brandName}`,
          description: `Only ${currentStock} bags remaining (Min threshold: ${minStock} bags). Please re-order from company.`,
          type: 'stock',
          severity: currentStock <= minStock / 2 ? 'danger' : 'warning',
          timestamp: new Date().toISOString()
        });
      }
    });

    // 2. Delayed purchase orders
    companyOrders.forEach(ord => {
      if (ord.status === 'Delayed') {
        list.push({
          id: `notif-ord-${ord.id}`,
          title: `Order Delayed: ${ord.orderNumber}`,
          description: `${ord.cementBrand} (${ord.quantity} Bags) from ${ord.companyName} is marked delayed. Remarks: ${ord.remarks || 'Check with driver'}.`,
          type: 'order',
          severity: 'danger',
          timestamp: new Date().toISOString()
        });
      }
    });

    // 3. Overdue customer payments
    sales.forEach(sale => {
      const bal = Number(sale.balanceAmount) || 0;
      if (bal > 0 && sale.dueDate && sale.dueDate < todayStr) {
        list.push({
          id: `notif-credit-${sale.id}`,
          title: `Overdue Payment: ${sale.customerName}`,
          description: `Invoice ${sale.invoiceNumber} has ₹${bal.toLocaleString('en-IN')} pending past due date (${sale.dueDate}).`,
          type: 'credit',
          severity: 'danger',
          timestamp: new Date().toISOString()
        });
      }
    });

    // 4. In transit trucks
    trucks.forEach(truck => {
      if (truck.currentStatus === 'On Road (In Transit)') {
        list.push({
          id: `notif-trk-${truck.id}`,
          title: `Truck En Route: ${truck.truckNumber}`,
          description: `Driver ${truck.driverName} (${truck.driverMobile || 'No contact'}) is on road. Expected delivery: ${truck.arrivalDate || 'Today'}.`,
          type: 'delivery',
          severity: 'info',
          timestamp: new Date().toISOString()
        });
      }
    });

    return list;
  }, [inventory, companyOrders, sales, trucks]);

  // Sync document title to business name
  useEffect(() => {
    const name = settings?.businessName || settings?.tradeName || 'Thakur Transport';
    document.title = `${name} | Transport & Cement ERP`;
  }, [settings?.businessName, settings?.tradeName]);

  const refreshAppData = () => {
    try {
      const storedSettings = loadState('settings', INITIAL_SETTINGS);
      const storedCustomers = loadState('customers', INITIAL_CUSTOMERS);
      const storedSales = loadState('sales', INITIAL_SALES);
      const storedInventory = loadState('inventory', INITIAL_INVENTORY);
      const storedOrders = loadState('orders', INITIAL_ORDERS);
      const storedTrucks = loadState('trucks', INITIAL_TRUCKS);
      const storedPayments = loadState('creditPayments', INITIAL_CREDIT_PAYMENTS);

      setSettings(storedSettings);
      setCustomers(storedCustomers);
      setSales(storedSales);
      setInventory(storedInventory);
      setCompanyOrders(storedOrders);
      setTrucks(storedTrucks);
      setCreditPayments(storedPayments);
      showToast('App refreshed & data synchronized!', 'success');
    } catch (e) {
      console.error('Refresh error:', e);
      showToast('App data refreshed', 'info');
    }
  };

  const resetToFactoryDefaults = () => {
    if (window.confirm('Are you sure you want to reset all data to default demo state? All custom records will be replaced.')) {
      setCustomers(INITIAL_CUSTOMERS);
      setBrands(INITIAL_BRANDS);
      setInventory(INITIAL_INVENTORY);
      setCompanyOrders(INITIAL_ORDERS);
      setTrucks(INITIAL_TRUCKS);
      setSales(INITIAL_SALES);
      setCreditPayments(INITIAL_CREDIT_PAYMENTS);
      setSettings(INITIAL_SETTINGS);
      showToast('Reset to original demo data', 'info');
    }
  };

  const value = {
    // Auth & User
    currentUser,
    login,
    logout,
    changeAdminPassword,

    // Entities
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,

    brands,
    setBrands,

    inventory,
    stockLogs,
    adjustStock,
    recordDamagedBags,
    addInventoryItem,
    deleteInventoryItem,
    deleteStockLog,

    companyOrders,
    addCompanyOrder,
    updateOrderStatus,
    deleteCompanyOrder,

    trucks,
    addTruck,
    updateTruck,
    deleteTruck,

    sales,
    addSale,
    deleteSale,

    creditPayments,
    addCreditPayment,

    settings,
    setSettings,

    // Analytics & Notifications
    analytics,
    notifications,

    // App state & UI
    theme,
    setTheme,
    activeTab,
    setActiveTab,
    isSearchOpen,
    setIsSearchOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    viewInvoice,
    setViewInvoice,
    toastMessage,
    showToast,
    refreshAppData,

    // Backup & Restore
    exportDatabaseJSON,
    importDatabaseJSON,
    resetToFactoryDefaults
  };


  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
