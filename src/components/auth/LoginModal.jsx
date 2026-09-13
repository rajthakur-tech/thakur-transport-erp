import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  Send
} from 'lucide-react';

export const LoginModal = () => {
  const { login, settings, resetAdminPasswordViaOtp, adminUsername } = useApp();
  
  // Sign in state
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password / OTP Flow State
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [otpStage, setOtpStage] = useState('request'); // 'request' | 'verify' | 'new_password' | 'success'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [simulatedSms, setSimulatedSms] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  // New Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const rawPhone = settings?.contactPhone || '9835012345';
  const maskedPhone = rawPhone.length >= 4 
    ? `+91 ${'*'.repeat(Math.max(0, rawPhone.length - 4))}${rawPhone.slice(-4)}`
    : `+91 ${rawPhone}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(userId, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
      setIsLoading(false);
    }, 300);
  };

  const handleSendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setEnteredOtp('');
    setOtpError('');
    setOtpStage('verify');
    setResendTimer(30);

    // Show simulated live SMS notification
    setSimulatedSms({
      phone: rawPhone,
      code,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setOtpError('');

    if (enteredOtp.trim() === generatedOtp.trim()) {
      setOtpStage('new_password');
      setOtpError('');
      setSimulatedSms(null);
    } else {
      setOtpError('Invalid OTP code. Please enter the exact 6-digit code received on SMS.');
    }
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setOtpError('');

    if (newPassword.length < 4) {
      setOtpError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setOtpError('New Password and Confirm Password do not match.');
      return;
    }

    const res = resetAdminPasswordViaOtp(newPassword);
    if (res.success) {
      setOtpStage('success');
      setOtpSuccessMsg('Password has been reset successfully! You can now log in with your new password.');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setOtpError(res.error || 'Failed to reset password.');
    }
  };

  const handleBackToLogin = () => {
    setIsForgotMode(false);
    setOtpStage('request');
    setOtpError('');
    setSimulatedSms(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900">
        
        {/* Header decoration */}
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-7 text-center text-white">
          <div className="mx-auto mb-2.5 flex h-13 w-13 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            {settings?.businessName || 'Thakur Transport'}
          </h2>
          <p className="mt-0.5 text-xs text-blue-100">Administrator Portal & Dealership ERP</p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-900/40 px-3 py-1 text-[11px] text-blue-200 backdrop-blur-sm border border-blue-400/20">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isForgotMode ? 'Secure OTP Verification' : 'Single-Admin Secure Access'}</span>
          </div>
        </div>

        {/* Live Simulated SMS Alert Banner */}
        {simulatedSms && (
          <div className="border-b border-amber-200 bg-amber-50 p-3.5 text-xs dark:border-amber-900/50 dark:bg-amber-950/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                <Smartphone className="h-4 w-4 text-amber-600 shrink-0" />
                <span>SMS Received (+91 {simulatedSms.phone})</span>
              </div>
              <span className="text-[10px] text-amber-700 dark:text-amber-400">{simulatedSms.timestamp}</span>
            </div>
            <p className="mt-1 text-slate-800 dark:text-slate-200">
              Your Thakur Transport ERP OTP is: <span className="font-mono text-base font-extrabold text-blue-600 dark:text-blue-400 tracking-wider bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">{simulatedSms.code}</span>
            </p>
            <button
              type="button"
              onClick={() => setEnteredOtp(simulatedSms.code)}
              className="mt-2 text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline"
            >
              ⚡ Click to Auto-Fill OTP ({simulatedSms.code})
            </button>
          </div>
        )}

        {/* --- VIEW 1: NORMAL LOGIN FORM --- */}
        {!isForgotMode && (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  placeholder={adminUsername || 'admin'}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Admin Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(true);
                    setOtpStage('request');
                    setOtpError('');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span>Remember Login</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Mr. Raj Thakur</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* --- VIEW 2: OTP FORGOT PASSWORD FLOW --- */}
        {isForgotMode && (
          <div className="p-6 sm:p-8 space-y-4">
            {otpError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {/* STAGE 1: Request OTP */}
            {otpStage === 'request' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <span>Registered Admin Mobile</span>
                  </div>
                  <p className="mt-1.5 font-mono text-base font-extrabold text-slate-900 dark:text-white">
                    {maskedPhone}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    A secure 6-digit one-time password (OTP) will be dispatched to this registered number to authorize password reset.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.98] transition"
                >
                  <Send className="h-4 w-4" />
                  <span>Send OTP via SMS</span>
                </button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white pt-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            )}

            {/* STAGE 2: Verify OTP */}
            {otpStage === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Enter 6-Digit OTP received on {maskedPhone}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center font-mono text-xl tracking-[0.4em] font-bold rounded-xl border border-slate-300 bg-white py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  {resendTimer > 0 ? (
                    <span className="text-slate-400">
                      Resend OTP in <strong className="font-mono text-slate-600 dark:text-slate-300">{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400 font-semibold"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Resend OTP SMS</span>
                    </button>
                  )}
                  <span className="text-[11px] text-slate-400">Valid for 10 min</span>
                </div>

                <button
                  type="submit"
                  disabled={enteredOtp.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify OTP</span>
                </button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white pt-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Cancel and Back to Sign In</span>
                </button>
              </form>
            )}

            {/* STAGE 3: Set New Password */}
            {otpStage === 'new_password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>OTP Verified! Create your new Admin Password.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Admin Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 hover:opacity-95 active:scale-[0.98] transition"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Set & Save New Password</span>
                </button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white pt-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
              </form>
            )}

            {/* STAGE 4: Success Message */}
            {otpStage === 'success' && (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  Password Updated!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {otpSuccessMsg}
                </p>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition mt-2"
                >
                  <span>Sign In Now</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
