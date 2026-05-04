import React, { useState } from "react";
import { Mail, Key, Eye, EyeOff, ArrowLeft, UserPlus, CheckCircle } from "lucide-react";

export default function RegisterWithOTP({ onRegister }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "user"
  });
  const [otp, setOtp] = useState("");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const showToast = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!form.fullname || !form.email || !form.password) {
      showToast("All fields are required", "error");
      return;
    }

    if (form.password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      if (data.requiresOtp) {
        setStep(2);
        showToast("OTP sent to your email", "success");
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      showToast("Please enter a valid 6-digit OTP", "error");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      showToast("Registration successful!", "success");
      onRegister(data);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inline Notification */}
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
          {step === 1 ? "Create your account" : "Verify your email"}
        </h1>
        <p className="text-surface-500 mt-1.5">
          {step === 1 ? "Start ordering from campus canteens" : `Enter the code sent to ${form.email}`}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step >= 1 ? "bg-brand-500 text-white" : "bg-surface-200 text-surface-500"
          }`}>
            {step > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
          </div>
          <span className={`text-xs font-semibold ${step >= 1 ? "text-brand-600" : "text-surface-400"}`}>Details</span>
        </div>
        <div className={`flex-1 h-0.5 rounded-full transition-all ${step >= 2 ? "bg-brand-500" : "bg-surface-200"}`} />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step >= 2 ? "bg-brand-500 text-white" : "bg-surface-200 text-surface-500"
          }`}>
            2
          </div>
          <span className={`text-xs font-semibold ${step >= 2 ? "text-brand-600" : "text-surface-400"}`}>Verify</span>
        </div>
      </div>

      {/* Step 1: Registration Form */}
      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Full name</label>
            <input
              name="fullname"
              type="text"
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-xl border-2 border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 text-sm"
              value={form.fullname}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Email address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 text-sm"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 text-sm"
                value={form.password}
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
            <p className="text-xs text-surface-400 mt-1.5">Must be at least 6 characters</p>
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
                Sending OTP...
              </>
            ) : (
              <>
                <UserPlus className="w-4.5 h-4.5" />
                Create account
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <form onSubmit={handleVerifyAndRegister} className="space-y-5">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-brand-500" />
            </div>
            <div>
              <p className="text-sm text-surface-500">We sent a 6-digit code to</p>
              <p className="font-semibold text-surface-900 text-sm">{form.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Verification code</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="000000"
                maxLength="6"
                value={otp}
                onChange={handleOtpChange}
                className="w-full pl-10 pr-4 py-3 text-center text-2xl font-bold tracking-[0.3em] rounded-xl border-2 border-surface-200 bg-white text-surface-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-lg flex items-center justify-center gap-2.5 ${
              loading || otp.length !== 6
                ? "bg-surface-300 text-surface-500 cursor-not-allowed"
                : "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & create account"
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-2.5 text-surface-500 hover:text-surface-700 font-medium transition-colors text-sm flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to details
          </button>
        </form>
      )}
    </div>
  );
}