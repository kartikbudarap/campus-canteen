import React, { useState } from "react";
import { Mail, ArrowLeft, Key, Eye, EyeOff, CheckCircle, Shield, Lock } from "lucide-react";

export default function ForgotPassword({ onBackToLogin, onLogin }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!form.email) {
      showToast("Email is required", "error");
      return;
    }

    setLoading(true);
    setNotification(null);
    
    try {
      console.log('🔧 FORGOT PASSWORD - Sending OTP for:', form.email);
      
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await response.json();
      console.log('🔧 FORGOT PASSWORD - Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep(2);
      showToast("OTP sent to your email", "success");
    } catch (error) {
      console.log('🔧 FORGOT PASSWORD - Error:', error);
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
      console.log('🔧 FORGOT PASSWORD - Verifying OTP:', form.otp);
      
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: form.email, 
          otp: form.otp 
        }),
      });

      const data = await response.json();
      console.log('🔧 FORGOT PASSWORD - OTP verification response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setStep(3);
      showToast("OTP verified successfully", "success");
    } catch (error) {
      console.log('🔧 FORGOT PASSWORD - OTP verification error:', error);
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
      console.log('🔧 FORGOT PASSWORD - Resetting password for:', form.email);
      
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: form.email, 
          otp: form.otp,
          newPassword: form.newPassword 
        }),
      });

      const data = await response.json();
      console.log('🔧 FORGOT PASSWORD - Reset password response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      showToast("Password reset successfully! Please login with your new password", "success");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (error) {
      console.log('🔧 FORGOT PASSWORD - Reset password error:', error);
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const resendOTP = async () => {
    try {
      console.log('🔧 FORGOT PASSWORD - Resending OTP for:', form.email);
      
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await response.json();
      console.log('🔧 FORGOT PASSWORD - Resend OTP response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      showToast("OTP resent to your email", "success");
    } catch (error) {
      console.log('🔧 FORGOT PASSWORD - Resend OTP error:', error);
      showToast(error.message, "error");
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 1: return <Mail className="w-6 h-6" />;
      case 2: return <Shield className="w-6 h-6" />;
      case 3: return <Lock className="w-6 h-6" />;
      default: return <Key className="w-6 h-6" />;
    }
  };

  const getStepColor = () => {
    return "red"; // Using red theme to match your app
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-down border ${
          notification.type === "success" 
            ? "bg-green-500 text-white border-green-400 shadow-green-200" 
            : "bg-red-500 text-white border-red-400 shadow-red-200"
        }`}>
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">{notification.type === "success" ? "✓" : "!"}</span>
          </div>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`p-4 bg-${getStepColor()}-500 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105`}>
              <div className="text-white">
                {getStepIcon()}
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {step === 1 && "Reset Your Password"}
            {step === 2 && "Verify Your Identity"}
            {step === 3 && "Create New Password"}
          </h1>
          <p className="text-gray-600 text-lg">
            {step === 1 && "We'll send a verification code to your email"}
            {step === 2 && "Enter the 6-digit code we sent you"}
            {step === 3 && "Choose a strong, secure password"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-8 transition-all duration-300 hover:shadow-2xl">
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step >= stepNumber 
                      ? `bg-${getStepColor()}-500 border-${getStepColor()}-500 text-white shadow-md` 
                      : "bg-white border-gray-300 text-gray-500"
                  } ${step === stepNumber ? 'scale-110 ring-4 ring-red-100' : ''}`}>
                    {step > stepNumber ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{stepNumber}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    step >= stepNumber ? `text-${getStepColor()}-600` : "text-gray-500"
                  }`}>
                    {stepNumber === 1 && "Email"}
                    {stepNumber === 2 && "Verify"}
                    {stepNumber === 3 && "Reset"}
                  </span>
                </div>
                {stepNumber < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                    step > stepNumber ? `bg-${getStepColor()}-500` : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-red-500" />
                  <input
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  We'll send a 6-digit verification code to this email
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3 ${
                  loading 
                    ? "bg-gray-400 text-white cursor-not-allowed" 
                    : `bg-${getStepColor()}-500 hover:bg-${getStepColor()}-600 text-white`
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Verification Code
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    name="otp"
                    type="text"
                    placeholder="• • • • • •"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    className="w-full p-4 text-center text-3xl font-bold tracking-widest rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    value={form.otp}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{form.email}</span>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3 ${
                    loading 
                      ? "bg-gray-400 text-white cursor-not-allowed" 
                      : `bg-${getStepColor()}-500 hover:bg-${getStepColor()}-600 text-white`
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying Code...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Verify & Continue
                    </>
                  )}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={resendOTP}
                    className={`text-${getStepColor()}-500 hover:text-${getStepColor()}-600 font-semibold transition-all duration-200 py-2 px-4 rounded-lg hover:bg-red-50`}
                  >
                    Didn't receive code? Resend OTP
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-red-500" />
                  <input
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  • Must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-red-500" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3 ${
                  loading 
                    ? "bg-gray-400 text-white cursor-not-allowed" 
                    : `bg-${getStepColor()}-500 hover:bg-${getStepColor()}-600 text-white`
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Password...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Reset Password
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="text-center pt-6 border-t border-gray-100">
            <button
              onClick={onBackToLogin}
              className={`text-${getStepColor()}-500 hover:text-${getStepColor()}-600 font-semibold flex items-center justify-center gap-2 transition-all duration-200 py-2 px-4 rounded-lg hover:bg-red-50`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Your security is our priority. All data is encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}