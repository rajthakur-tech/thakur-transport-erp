import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatINR,
  formatDate,
  generateOrderNumber,
  getStatusBadgeColor
} from '../../utils/helpers';
import {
  Building,
  Plus,
  Search,
  Filter,
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Eye,
  Edit2,
  X,
  AlertCircle,
  Calendar,
  Layers,
  ChevronDown,
  Trash2
} from 'lucide-react';

export const CompanyOrderManager = () => {
  const {
    companyOrders,
    addCompanyOrder,
    updateOrderStatus,
    deleteCompanyOrder,
    brands,
    currentUser
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [statusChangeNotes, setStatusChangeNotes] = useState('');
  const [newStatusValue, setNewStatusValue] = useState('Delivered');

  // Form State
  const initialForm = {
    companyName: 'UltraTech Cement Ltd',
    cementBrand: 'UltraTech Cement',
    quantity: 500,
    rate: 340,
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    status: 'Ordered',
    truckNumber: '',
    driverName: '',
    driverMobile: '',
    transportCompany: 'Shree Ram Logistics',
    remarks: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return companyOrders.filter(order => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.cementBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.truckNumber && order.truckNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesBrand = brandFilter === 'ALL' || order.cementBrand === brandFilter;

      return matchesSearch && matchesStatus && matchesBrand;
    });
  }, [companyOrders, searchQuery, statusFilter, brandFilter]);

  const handleBrandChange = (brandName) => {
    const b = brands.find(item => item.name === brandName);
    setFormData(prev => ({
      ...prev,
      cementBrand: brandName,
      rate: b?.costPrice || prev.rate,
      companyName: brandName.includes('UltraTech')
        ? 'UltraTech Cement Ltd'
        : brandName.includes('Ambuja')
        ? 'Ambuja Cements Limited'
        : brandName.includes('ACC')
        ? 'ACC Limited'
        : `${brandName} Corp`
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const qty = Number(formData.quantity);
    const rate = Number(formData.rate);
    const totalAmount = qty * rate;

    const brandObj = brands.find(b => b.name === formData.cementBrand);
    const orderNo = generateOrderNumber(brandObj?.code || 'TCR', companyOrders.length);

    addCompanyOrder({
      ...formData,
      quantity: qty,
      rate,
      totalAmount,
      orderNumber: orderNo,
      brandId: brandObj?.id || 'b1'
    });

    setIsModalOpen(false);
  };

  const handleUpdateStatusSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrderForStatus) return;
    updateOrderStatus(selectedOrderForStatus.id, newStatusValue, statusChangeNotes);
    setSelectedOrderForStatus(null);
    setStatusChangeNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Company Order Management
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              Procurement & POs
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Track manufacturer cement purchase orders, dispatch status, delivery deadlines, and automated delay notifications.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(initialForm);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Company Order</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number, manufacturer, brand, or truck..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="Ordered">Ordered</option>
            <option value="In Transit">In Transit</option>
            <option value="Delayed">Delayed ⚠️</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Brand Filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Brands</option>
            {brands.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Order Details</th>
                <th className="py-3 px-4 font-semibold">Manufacturer & Brand</th>
                <th className="py-3 px-4 font-semibold">Quantity & Rate</th>
                <th className="py-3 px-4 font-semibold">Delivery Dates</th>
                <th className="py-3 px-4 font-semibold">Transport / Truck</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  {/* Order Details */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {order.orderNumber}
                    </span>
                    <div className="text-[11px] text-slate-400">Ordered: {formatDate(order.orderDate)}</div>
                  </td>

                  {/* Company & Brand */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{order.companyName}</div>
                    <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{order.cementBrand}</div>
                  </td>

                  {/* Quantity & Rate */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {order.quantity} Bags
                    </div>
                    <div className="text-[11px] text-slate-500">
                      @ ₹{order.rate}/Bag • <span className="font-semibold text-slate-800 dark:text-slate-200">{formatINR(order.totalAmount)}</span>
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>Exp: {formatDate(order.expectedDeliveryDate)}</span>
                    </div>
                    {order.actualDeliveryDate && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        Received: {formatDate(order.actualDeliveryDate)}
                      </div>
                    )}
                  </td>

                  {/* Transport */}
                  <td className="py-3.5 px-4">
                    {order.truckNumber ? (
                      <div>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {order.truckNumber}
                        </span>
                        {order.driverName && (
                          <div className="text-[10px] text-slate-500">
                            {order.driverName} {order.driverMobile ? `(${order.driverMobile})` : ''}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not Assigned</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeColor(order.status)}`}>
                      {order.status === 'Delayed' && '⚠️ '}
                      {order.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedOrderForStatus(order);
                          setNewStatusValue(order.status);
                          setStatusChangeNotes(order.remarks || '');
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        title="Update status"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => deleteCompanyOrder(order.id)}
                        className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-xs text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 transition"
                        title="Delete Company Order"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW COMPANY ORDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  Place New Cement Company Order
                </h3>
                <p className="text-xs text-slate-500">Factory purchase order & transport allocation.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cement Brand *
                  </label>
                  <select
                    value={formData.cementBrand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name} ({b.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Manufacturer Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity (Bags) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Rate Per Bag (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Order Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Transportation Details Section */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Logistics & Vehicle Information (Optional)
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Truck Number
                  </label>
                  <input
                    type="text"
                    value={formData.truckNumber}
                    onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. BR-01-GB-4589"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono uppercase text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Driver Name & Contact
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      placeholder="Driver Name"
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <input
                      type="tel"
                      value={formData.driverMobile}
                      onChange={(e) => setFormData({ ...formData, driverMobile: e.target.value })}
                      placeholder="Driver Phone"
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transport Company & Remarks
                  </label>
                  <input
                    type="text"
                    value={formData.transportCompany}
                    onChange={(e) => setFormData({ ...formData, transportCompany: e.target.value })}
                    placeholder="Transporter Name or special PO notes"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-300 flex items-center justify-between">
                <span>Calculated PO Total Amount:</span>
                <span className="font-heading text-base font-extrabold text-blue-700 dark:text-blue-400">
                  {formatINR(Number(formData.quantity) * Number(formData.rate))}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                >
                  Confirm & Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {selectedOrderForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Update Order #{selectedOrderForStatus.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrderForStatus(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Change Delivery Status
                </label>
                <select
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Ordered">Ordered (Waiting for factory loading)</option>
                  <option value="In Transit">In Transit (Dispatched on Highway)</option>
                  <option value="Delayed">Delayed ⚠️ (Breakdown/Traffic Alert)</option>
                  <option value="Delivered">Delivered (Received & Add to Warehouse Stock)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {newStatusValue === 'Delivered' && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="font-bold">✓ Inventory Automatic Inflow:</span> {selectedOrderForStatus.quantity} bags of {selectedOrderForStatus.cementBrand} will be added to warehouse stock.
                </div>
              )}

              {newStatusValue === 'Delayed' && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                  <span className="font-bold">⚠️ Delayed Alert:</span> This order will generate an urgent dashboard alert for follow up.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Status Reason
                </label>
                <textarea
                  rows={2}
                  value={statusChangeNotes}
                  onChange={(e) => setStatusChangeNotes(e.target.value)}
                  placeholder="e.g. Received at godown, or Truck delayed near toll plaza"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForStatus(null)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
