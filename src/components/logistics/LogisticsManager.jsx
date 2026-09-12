import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatDate,
  getStatusBadgeColor
} from '../../utils/helpers';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Navigation,
  Edit2
} from 'lucide-react';

export const LogisticsManager = () => {
  const {
    trucks,
    addTruck,
    updateTruck,
    companyOrders,
    setActiveTab
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);

  // Form State
  const initialForm = {
    truckNumber: '',
    driverName: '',
    driverMobile: '',
    alternateMobile: '',
    transportCompany: 'Maa Durga Roadlines',
    loadingDate: new Date().toISOString().split('T')[0],
    arrivalDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    currentStatus: 'On Road (In Transit)',
    linkedOrder: '',
    remarks: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const filteredTrucks = trucks.filter(t => {
    const matchesSearch =
      t.truckNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driverMobile.includes(searchQuery) ||
      (t.transportCompany && t.transportCompany.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingTruck(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTruck(t);
    setFormData({
      truckNumber: t.truckNumber || '',
      driverName: t.driverName || '',
      driverMobile: t.driverMobile || '',
      alternateMobile: t.alternateMobile || '',
      transportCompany: t.transportCompany || '',
      loadingDate: t.loadingDate || '',
      arrivalDate: t.arrivalDate || '',
      currentStatus: t.currentStatus || 'On Road (In Transit)',
      linkedOrder: t.linkedOrder || '',
      remarks: t.remarks || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTruck) {
      updateTruck(editingTruck.id, formData);
    } else {
      addTruck(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Truck & Driver Logistics
            </h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              Fleet Tracking
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Monitor incoming cement trucks, driver contacts, transporters, and live shipment stages.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Register Truck / Driver</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by truck number (e.g. BR-01), driver name, phone, or transporter..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="ALL">All Logistics Statuses</option>
          <option value="On Road (In Transit)">On Road (In Transit)</option>
          <option value="Delayed / Repairing">Delayed / Repairing ⚠️</option>
          <option value="Unloaded">Unloaded (Completed)</option>
        </select>
      </div>

      {/* Logistics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTrucks.map((truck) => {
          const linkedOrderObj = companyOrders.find(o => o.id === truck.linkedOrder || o.orderNumber === truck.linkedOrder);

          return (
            <div
              key={truck.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-purple-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                {/* Header inside card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                        {truck.truckNumber}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {truck.transportCompany || 'Private Freight'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(truck)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeColor(truck.currentStatus)}`}>
                    {truck.currentStatus.includes('Delayed') && '⚠️ '}
                    {truck.currentStatus}
                  </span>
                </div>

                {/* Driver & Details */}
                <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Driver Name:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{truck.driverName || 'Not Assigned'}</span>
                  </div>

                  {truck.driverMobile && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Driver Phone:</span>
                      <a href={`tel:${truck.driverMobile}`} className="flex items-center gap-1 font-mono font-semibold text-blue-600 hover:underline dark:text-blue-400">
                        <Phone className="h-3 w-3" />
                        {truck.driverMobile}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Loading Date:</span>
                    <span className="text-slate-700 dark:text-slate-300">{formatDate(truck.loadingDate)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Est. Arrival:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(truck.arrivalDate)}</span>
                  </div>

                  {linkedOrderObj && (
                    <div className="border-t border-slate-200/60 pt-2 text-[11px] dark:border-slate-700/60">
                      <span className="text-slate-500">PO: </span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{linkedOrderObj.orderNumber}</span>
                      <span className="text-slate-600 dark:text-slate-300"> ({linkedOrderObj.quantity} Bags {linkedOrderObj.cementBrand})</span>
                    </div>
                  )}

                  {truck.remarks && (
                    <p className="mt-1 text-[11px] italic text-slate-500 dark:text-slate-400">
                      "{truck.remarks}"
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Quick Call */}
              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                {truck.driverMobile ? (
                  <a
                    href={`tel:${truck.driverMobile}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Driver Now</span>
                  </a>
                ) : (
                  <button
                    onClick={() => handleOpenEdit(truck)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    Add Driver Details
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT TRUCK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                {editingTruck ? 'Edit Logistics Details' : 'Register Vehicle & Driver'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Truck Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.truckNumber}
                    onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. BR-01-GB-4589"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono uppercase text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transport Company
                  </label>
                  <input
                    type="text"
                    value={formData.transportCompany}
                    onChange={(e) => setFormData({ ...formData, transportCompany: e.target.value })}
                    placeholder="e.g. Maa Durga Roadlines"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    placeholder="Driver Full Name"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Driver Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.driverMobile}
                    onChange={(e) => setFormData({ ...formData, driverMobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Loading Date
                  </label>
                  <input
                    type="date"
                    value={formData.loadingDate}
                    onChange={(e) => setFormData({ ...formData, loadingDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Arrival Date
                  </label>
                  <input
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Status
                  </label>
                  <select
                    value={formData.currentStatus}
                    onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="On Road (In Transit)">On Road (In Transit)</option>
                    <option value="Delayed / Repairing">Delayed / Repairing ⚠️</option>
                    <option value="Unloaded">Unloaded (Delivered)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Linked PO / Order No (Optional)
                  </label>
                  <select
                    value={formData.linkedOrder}
                    onChange={(e) => setFormData({ ...formData, linkedOrder: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">None / General Truck</option>
                    {companyOrders.map(o => (
                      <option key={o.id} value={o.id}>{o.orderNumber} ({o.cementBrand})</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Remarks / GPS Status
                  </label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="e.g. Departed Varanasi highway, toll receipt verified"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
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
                  Save Truck Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
