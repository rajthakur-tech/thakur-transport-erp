import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building2,
  Database,
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Smartphone,
  FileText
} from 'lucide-react';

export const SettingsManager = () => {
  const {
    settings,
    setSettings,
    currentUser,
    adminUsername,
    exportDatabaseJSON,
    importDatabaseJSON,
    resetToFactoryDefaults,
    theme,
    setTheme,
    changeAdminUsername,
    changeAdminPassword
  } = useApp();

  const fileInputRef = useRef(null);

  // Business Form State
  const [bizForm, setBizForm] = useState({ ...settings });
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Sync bizForm if context settings changes
  React.useEffect(() => {
    setBizForm({ ...settings });
  }, [settings]);

  // Username change state
  const [usernameState, setUsernameState] = useState({
    newUsername: '',
    currentPassword: ''
  });
  const [userMsg, setUserMsg] = useState({ text: '', isError: false });

  // Password change state
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwdMsg, setPwdMsg] = useState({ text: '', isError: false });

  const handleSaveBiz = (e) => {
    e.preventDefault();
    setSettings(bizForm);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      importDatabaseJSON(content);
    };
    reader.readAsText(file);
  };

  const handleUsernameChange = (e) => {
    e.preventDefault();
    setUserMsg({ text: '', isError: false });

    if (!usernameState.newUsername.trim()) {
      setUserMsg({ text: 'Please enter a valid username.', isError: true });
      return;
    }

    const res = changeAdminUsername(usernameState.currentPassword, usernameState.newUsername);
    if (res.success) {
      setUserMsg({ text: `✓ Admin Username updated to "${usernameState.newUsername.trim()}".`, isError: false });
      setUsernameState({ newUsername: '', currentPassword: '' });
    } else {
      setUserMsg({ text: res.error || 'Failed to update username.', isError: true });
    }
    setTimeout(() => setUserMsg({ text: '', isError: false }), 5000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPwdMsg({ text: '', isError: false });

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPwdMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }
    if (passwordState.newPassword.length < 4) {
      setPwdMsg({ text: 'Password must be at least 4 characters.', isError: true });
      return;
    }
    const res = changeAdminPassword(passwordState.currentPassword, passwordState.newPassword);
    if (res.success) {
      setPwdMsg({ text: '✓ Admin Password updated successfully.', isError: false });
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPwdMsg({ text: res.error || 'Current password incorrect.', isError: true });
    }
    setTimeout(() => setPwdMsg({ text: '', isError: false }), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              System Settings & Administration
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              Admin Configuration
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Configure dealership business profile, GSTIN & UPI details, database backup/restore, and security.
          </p>
        </div>
      </div>

      {isSavedNotice && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>Business configuration saved successfully!</span>
        </div>
      )}

      {/* Grid of Settings Modules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Business Profile Form (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Dealership & Business Information
              </h3>
            </div>

            <form onSubmit={handleSaveBiz} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Application / Brand Title
                  </label>
                  <input
                    type="text"
                    value={bizForm.businessName}
                    onChange={(e) => setBizForm({ ...bizForm, businessName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Trade / Legal Entity Name
                  </label>
                  <input
                    type="text"
                    value={bizForm.tradeName}
                    onChange={(e) => setBizForm({ ...bizForm, tradeName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proprietor / Owner Name
                  </label>
                  <input
                    type="text"
                    value={bizForm.ownerName}
                    onChange={(e) => setBizForm({ ...bizForm, ownerName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN Registration Number
                  </label>
                  <input
                    type="text"
                    value={bizForm.gstNumber}
                    onChange={(e) => setBizForm({ ...bizForm, gstNumber: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono font-bold uppercase text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Contact Phone
                  </label>
                  <input
                    type="text"
                    value={bizForm.contactPhone}
                    onChange={(e) => setBizForm({ ...bizForm, contactPhone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={bizForm.email}
                    onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Warehouse & Agency Address
                  </label>
                  <input
                    type="text"
                    value={bizForm.address}
                    onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Banking & UPI */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Bank Details & UPI Payment QR
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bizForm.bankName}
                      onChange={(e) => setBizForm({ ...bizForm, bankName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bizForm.accountNumber}
                      onChange={(e) => setBizForm({ ...bizForm, accountNumber: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      UPI ID (for QR)
                    </label>
                    <input
                      type="text"
                      value={bizForm.upiId}
                      onChange={(e) => setBizForm({ ...bizForm, upiId: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Terms */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Invoice Terms & Conditions
                </label>
                <textarea
                  rows={3}
                  value={bizForm.invoiceTerms}
                  onChange={(e) => setBizForm({ ...bizForm, invoiceTerms: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                >
                  Save Business Profile
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Backup, Security & Theme (1 col) */}
        <div className="space-y-6">
          {/* Backup & Restore Database */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">
              <Database className="h-5 w-5 text-indigo-600" />
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Database Backup & Restore
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Export complete TCR system data (customers, stock, sales, udhari, logistics) to a secure JSON file for local backup or restoring.
            </p>

            <div className="space-y-3">
              <button
                onClick={exportDatabaseJSON}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
              >
                <Download className="h-4 w-4" />
                <span>Backup Database (JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Upload className="h-4 w-4 text-slate-500" />
                <span>Restore Database from File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />

              <div className="pt-2">
                <button
                  onClick={resetToFactoryDefaults}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/50 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Demo Dataset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Theme Preferences */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white mb-3">
              Appearance & Theme
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold transition ${
                  theme === 'light'
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold transition ${
                  theme === 'dark'
                    ? 'bg-blue-950/60 text-blue-300 border-2 border-blue-500'
                    : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                <Moon className="h-4 w-4 text-blue-400" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Security & Credentials */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Security & Admin Credentials
                </h3>
                <p className="text-[11px] text-slate-500">Manage owner username, password & OTP reset phone.</p>
              </div>
            </div>

            {/* Registered Phone for OTP Info Box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs dark:border-blue-900/50 dark:bg-blue-950/30">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Password Reset OTP Phone</span>
              </div>
              <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
                +91 {settings?.contactPhone || '9835012345'}
              </p>
              <p className="mt-0.5 text-[10px] text-blue-700 dark:text-blue-400">
                (When clicking "Forgot Password" on login screen, verification OTP is delivered to this number.)
              </p>
            </div>

            {/* Change Username Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Change Admin Username
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Current: {adminUsername || 'admin'}
                </span>
              </div>

              {userMsg.text && (
                <div className={`mb-3 rounded-xl p-2.5 text-xs font-semibold ${
                  userMsg.isError
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40'
                }`}>
                  {userMsg.text}
                </div>
              )}

              <form onSubmit={handleUsernameChange} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    New Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter new username"
                    value={usernameState.newUsername}
                    onChange={(e) => setUsernameState({ ...usernameState, newUsername: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Current Password (for Verification)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your current password"
                    value={usernameState.currentPassword}
                    onChange={(e) => setUsernameState({ ...usernameState, currentPassword: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
                >
                  Save New Username
                </button>
              </form>
            </div>

            {/* Change Password Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-3">
                <Lock className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Change Admin Password
                </span>
              </div>

              {pwdMsg.text && (
                <div className={`mb-3 rounded-xl p-2.5 text-xs font-semibold ${
                  pwdMsg.isError
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40'
                }`}>
                  {pwdMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Current password"
                    value={passwordState.currentPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="New password (min 4 characters)"
                    value={passwordState.newPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={passwordState.confirmPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 transition"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
