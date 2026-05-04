import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, ShoppingBag, User, LogIn, Eye, EyeOff } from "lucide-react";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const [notification, setNotification] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      setNotification("Email and password are required");
      return;
    }

    setLoading(true);
    setNotification(null);
    
    try {
      await onLogin(form);
    } catch (error) {
      setNotification(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "user", label: "Student", icon: User, desc: "Browse & order food" },
    { value: "seller", label: "Seller", icon: ShoppingBag, desc: "Manage orders" },
    { value: "admin", label: "Admin", icon: ChefHat, desc: "Full control" },
  ];

  return (
    <div className="space-y-6">
      {/* Error notification */}
      {notification && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in-down">
          <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold">!</span>
          </div>
          {notification}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Sign in to your account</h1>
        <p className="text-surface-500 mt-1.5">Choose your role and enter your credentials</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-semibold text-surface-700 mb-2.5">
            Sign in as
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {roles.map((roleOption) => {
              const Icon = roleOption.icon;
              const isActive = form.role === roleOption.value;
              return (
                <button
                  key={roleOption.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: roleOption.value })}
                  disabled={loading}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-center group whitespace-normal ${
                    isActive
                      ? "bg-brand-50 border-brand-500 text-brand-700 shadow-sm"
                      : "bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50"
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${
                    isActive ? 'text-brand-500' : 'text-surface-400 group-hover:text-surface-500'
                  }`} />
                  <span className={`text-xs font-semibold block ${
                    isActive ? 'text-brand-700' : 'text-surface-700'
                  }`}>{roleOption.label}</span>
                  <span className={`text-[10px] block mt-0.5 ${
                    isActive ? 'text-brand-500' : 'text-surface-400'
                  }`}>{roleOption.desc}</span>
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-surface-700 mb-2">
            Email address
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border-2 border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 text-sm disabled:opacity-50"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-surface-700">
              Password
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border-2 border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 pr-12 text-sm disabled:opacity-50"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors p-1"
              disabled={loading}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
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
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-4.5 h-4.5" />
              Sign in as {roles.find(r => r.value === form.role)?.label}
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials — keep for dev */}
      <details className="group">
        <summary className="text-xs text-surface-400 cursor-pointer hover:text-surface-500 transition-colors font-medium flex items-center gap-1.5">
          <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Demo credentials
        </summary>
        <div className="mt-2 bg-surface-50 border border-surface-200 rounded-xl p-3 text-xs text-surface-600 space-y-1">
          <p><span className="font-semibold text-surface-700">Admin:</span> admin@food.com / admin123</p>
          <p><span className="font-semibold text-surface-700">Seller:</span> seller@food.com / seller123</p>
          <p><span className="font-semibold text-surface-700">User:</span> user@food.com / user123</p>
        </div>
      </details>
    </div>
  );
}