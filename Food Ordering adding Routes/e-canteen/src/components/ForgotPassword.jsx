import React, { useState } from "react";
import { Mail, Key, Eye, EyeOff, Shield, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!form.email) {
      showToast("Email is required", "error");
      return;
    }
    setLoading(true);
    setNotification(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep(2);
      showToast("OTP sent to your email", "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!form.otp || form.otp.length !== 6) {
      showToast("Please enter a valid 6-digit OTP", "error");
      return;
    }
    setLoading(true);
    setNotification(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: form.otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid OTP');
      setStep(3);
      showToast("OTP verified successfully", "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!form.newPassword || !form.confirmPassword) {
      showToast("All fields are required", "error");
      return;
    }
    if (form.newPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    setNotification(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: form.email, 
          otp: form.otp,
          newPassword: form.newPassword 
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset password');
      showToast("Password reset successfully! Please login with your new password", "success");
      // App.jsx routing will handle redirection or user will click back to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to resend OTP');
      showToast("OTP resent to your email", "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in-down border ${
          notification.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
            notification.type === "success" ? "bg-emerald-100" : "bg-red-100"
          }`}>
            <span className="text-xs font-bold">{notification.type === "success" ? "✓" : "!"}</span>
          </div>
          {notification.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
          {step === 1 && "Reset your password"}
          {step === 2 && "Verify your identity"}
          {step === 3 && "Create new password"}
        </h1>
        <p className="text-surface-500 mt-1.5">
          {step === 1 && "Enter your email to receive a verification code."}
          {step === 2 && `Enter the 6-digit code sent to ${form.email}`}
          {step === 3 && "Choose a strong, secure password."}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center px-2">
        {[1, 2, 3].map((stepNumber) => (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > stepNumber 
                  ? "bg-brand-500 text-white" 
                  : step === stepNumber
                    ? "bg-brand-50 border-2 border-brand-500 text-brand-600"
                    : "bg-surface-100 text-surface-400"
              }`}>
                {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                step >= stepNumber ? "text-brand-600" : "text-surface-400"
              }`}>
                {stepNumber === 1 && "Email"}
                {stepNumber === 2 && "Verify"}
                {stepNumber === 3 && "Reset"}
              </span>
            </div>
            {stepNumber < 3 && (
              <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${
                step > stepNumber ? "bg-brand-500" : "bg-surface-200"
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Email Form */}
      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-4.5 h-4.5" />
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 text-sm"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-lg flex items-center justify-center gap-2.5 ${
              loading
                ? "bg-surface-300 text-surface-500 cursor-not-allowed"
                : "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending code...
              </>
            ) : "Send verification code"}
          </button>
        </form>
      )}

      {/* Step 2: OTP Form */}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-5 mt-6">
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Verification code</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-4.5 h-4.5" />
              <input
                name="otp"
                type="text"
                placeholder="000000"
                maxLength="6"
                pattern="[0-9]{6}"
                value={form.otp}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 text-center text-2xl font-bold tracking-[0.3em] rounded-xl border-2 border-surface-200 bg-white text-surface-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200"
                disabled={loading}
                required
              />
            </div>
          </div>
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || form.otp.length !== 6}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-lg flex items-center justify-center gap-2.5 ${
                loading || form.otp.length !== 6
                  ? "bg-surface-300 text-surface-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : "Verify code"}
            </button>
            <button
              type="button"
              onClick={resendOTP}
              className="w-full py-2.5 text-surface-500 hover:text-surface-700 font-medium transition-colors text-sm"
            >
              Didn't receive code? Resend
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Reset Password Form */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">New password</label>
            <div className="relative">
              <input
                name="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 text-sm"
                value={form.newPassword}
                onChange={handleChange}
                required
                minLength={6}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Confirm password</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 text-sm"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors p-1"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-lg flex items-center justify-center gap-2.5 ${
              loading
                ? "bg-surface-300 text-surface-500 cursor-not-allowed"
                : "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating password...
              </>
            ) : "Reset password"}
          </button>
        </form>
      )}
      
      {step === 2 && (
        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-full py-2.5 text-surface-500 hover:text-surface-700 font-medium transition-colors text-sm flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to email input
        </button>
      )}
    </div>
  );
}