import React, { useState } from "react";
import { Mail, Key, Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";

export default function RegisterWithOTP({ onBackToLogin, onRegister, initialData }) {
  const [step, setStep] = useState(1); // 1: Basic info, 2: OTP verification
  const [form, setForm] = useState(initialData || {
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
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    console.log('🔧 DEBUG - OTP Send Response:', data); // ADD THIS LINE

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    if (data.requiresOtp) {
      setStep(2);
      showToast("OTP sent to your email", "success");
    }
  } catch (error) {
    console.log('🔧 DEBUG - OTP Send Error:', error); // ADD THIS LINE
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
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...form,
        otp: otp
      }),
    });

    const data = await response.json();

    console.log('🔧 DEBUG - Server Response:', data); // ADD THIS LINE

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    showToast("Registration successful!", "success");
    onRegister(data);
  } catch (error) {
    console.log('🔧 DEBUG - Error:', error); // ADD THIS LINE
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
};

  const showToast = (message, type = "error") => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 4000);
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-down border ${
          notification.type === "success" 
            ? "bg-green-500 text-white border-green-400" 
            : "bg-red-500 text-white border-red-400"
        }`}>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-500 rounded-2xl">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 ? "Create Account" : "Verify OTP"}
          </h1>
          <p className="text-gray-600">
            {step === 1 ? "Join our food ordering platform" : "Enter OTP sent to your email"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-6">
            <div className={`flex items-center ${step >= 1 ? "text-red-500" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? "bg-red-500 border-red-500 text-white" : "bg-white border-gray-300"
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
            <div className={`flex items-center ${step >= 2 ? "text-red-500" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? "bg-red-500 border-red-500 text-white" : "bg-white border-gray-300"
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Verify</span>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  name="fullname"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  value={form.fullname}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="w-full p-3 pr-12 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Password must be at least 6 characters long
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${
                  loading 
                    ? "bg-gray-400 text-white cursor-not-allowed" 
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
              <div className="text-center">
                <Mail className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">We sent a 6-digit code to</p>
                <p className="font-semibold text-gray-900">{form.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP Code
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
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${
                  loading || otp.length !== 6
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  "Verify & Register"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Details
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="text-center pt-4 border-t border-gray-200">
            <button
              onClick={onBackToLogin}
              className="text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}