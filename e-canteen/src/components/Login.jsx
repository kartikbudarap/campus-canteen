import React, { useState } from "react";
import { ChefHat, ShoppingBag, User, LogIn, Eye, EyeOff } from "lucide-react";

export default function Login({ onLogin , onForgotPassword  }) {
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

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <ChefHat className="w-5 h-5" />;
      case "seller":
        return <ShoppingBag className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case "admin":
        return "Manage menu, view analytics, and oversee operations";
      case "seller":
        return "Process orders and manage order status";
      case "user":
        return "Browse menu and place food orders";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-down border border-red-400">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm">!</span>
          </div>
          <span className="font-medium">{notification}</span>
        </div>
      )}
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-500 rounded-2xl">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6"
        >
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Login As
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "user", label: "User", icon: User },
                { value: "seller", label: "Seller", icon: ShoppingBag },
                { value: "admin", label: "Admin", icon: ChefHat },
              ].map((roleOption) => {
                const Icon = roleOption.icon;
                return (
                  <button
                    key={roleOption.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: roleOption.value })}
                    disabled={loading}
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      form.role === roleOption.value
                        ? "bg-red-500 text-white border-red-500 shadow-sm"
                        : "bg-white border-gray-300 text-gray-700 hover:border-red-300"
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">{roleOption.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Role Description */}
            <p className="text-sm text-gray-500 mt-3 text-center">
              {getRoleDescription(form.role)}
            </p>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 disabled:opacity-50"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 pr-12 disabled:opacity-50"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
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
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In as {form.role.charAt(0).toUpperCase() + form.role.slice(1)}
              </>
            )}
          </button>
          {/* Forgot Password Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <button
              type="button" // IMPORTANT: Add this
              onClick={onForgotPassword} // ← USE THE PROP
              className="text-red-500 hover:text-red-600 font-medium transition-colors"
              disabled={loading}
            >
              Forgot your password?
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin@food.com / admin123</p>
              <p><strong>Seller:</strong> seller@food.com / seller123</p>
              <p><strong>User:</strong> user@food.com / user123</p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Food Ordering System • 2024
          </p>
        </div>
      </div>
    </div>
  );
}