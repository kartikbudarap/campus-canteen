import React, { useState, useEffect } from "react";
import { Mail, CheckCircle, Key } from "lucide-react";

export default function VerifyEmail({ userEmail, onVerificationComplete, onResendEmail, tempToken }) {
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [countdown, setCountdown] = useState(0);
  const [otp, setOtp] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const showToast = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tempToken && { Authorization: `Bearer ${tempToken}` })
        },
        body: JSON.stringify({ 
          email: userEmail, 
          otp: otp 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setVerificationStatus('success');
      onVerificationComplete(data);
    } catch (error) {
      showToast(error.message, 'error');
      setVerificationStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      await onResendEmail();
      setCountdown(60);
      setOtp('');
      showToast('New OTP sent to your email!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (verificationStatus === 'success') {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto animate-scale-in">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Email verified!</h1>
          <p className="text-surface-500 mt-2 max-w-sm mx-auto">
            Your account is now fully active. You can start exploring and ordering right away.
          </p>
        </div>
        {/* If for some reason onVerificationComplete doesn't navigate: */}
        <button
          onClick={() => window.location.href = '/'}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white mt-4"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Verify your email</h1>
        <p className="text-surface-500 mt-1.5">
          We sent a code to <span className="font-semibold text-surface-900">{userEmail || "your email"}</span>
        </p>
      </div>

      <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 flex gap-3">
        <Mail className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-brand-900">
          <p className="font-semibold mb-1">Check your inbox</p>
          <p className="text-brand-700">Enter the 6-digit code below to confirm your email address. It expires in 10 minutes.</p>
        </div>
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-5">
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
              required
            />
          </div>
        </div>

        <div className="space-y-3">
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
            ) : "Verify email"}
          </button>
          
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={loading || countdown > 0}
            className="w-full py-2.5 text-surface-500 hover:text-surface-700 font-medium transition-colors text-sm"
          >
            {countdown > 0 ? `Resend code in ${countdown}s` : "Didn't receive code? Resend"}
          </button>
        </div>
      </form>
    </div>
  );
}