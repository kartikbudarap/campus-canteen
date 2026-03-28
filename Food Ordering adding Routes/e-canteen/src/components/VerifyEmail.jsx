import React, { useState, useEffect } from "react";
import { Mail, CheckCircle, XCircle, RefreshCw, Key } from "lucide-react";

export default function VerifyEmail({ userEmail, onVerificationComplete, onResendEmail, tempToken }) {
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [countdown, setCountdown] = useState(0);
  const [otp, setOtp] = useState('');

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

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
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
      onVerificationComplete(data); // Pass the response data which should include the real token
    } catch (error) {
      alert(error.message);
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
      setCountdown(60); // 60 seconds cooldown
      setOtp(''); // Clear previous OTP
      alert('New OTP sent to your email!');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white border border-green-200 rounded-2xl shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now access all features.
            </p>
            <button
              onClick={onVerificationComplete}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-500 rounded-2xl">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-600">
              We've sent a 6-digit OTP to
            </p>
            <p className="text-gray-900 font-semibold">{userEmail}</p>
          </div>

          <div className="space-y-4">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit OTP
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="000000"
                  maxLength="6"
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-full pl-10 pr-4 py-3 text-center text-2xl font-bold tracking-widest rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Check your email for the OTP code
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Check your email:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Look for an email from Food Ordering System</li>
                <li>Enter the 6-digit code above</li>
                <li>Code expires in 10 minutes</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 border ${
                  loading || otp.length !== 6
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white border-green-500"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <button
                onClick={handleResendVerification}
                disabled={loading || countdown > 0}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 border ${
                  countdown > 0 || loading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                }`}
              >
                {countdown > 0 ? `Resend (${countdown}s)` : "Resend OTP"}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Didn't receive the OTP? Check your spam folder or resend.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}