import React, { useState } from "react";
import { ChefHat, ShoppingBag, User, UserPlus, Eye, EyeOff, Mail, Lock, User as UserIcon } from "lucide-react";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({
    fullname: "",
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
    
    // Simple validation
    if (!form.fullname || !form.email || !form.password) {
      setNotification("All fields are required");
      return;
    }

    if (form.password.length < 6) {
      setNotification("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setNotification(null);
    
    try {
      await onRegister(form);
    } catch (error) {
      setNotification(error.message || "Registration failed");
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
        return "Manage restaurant operations and analytics";
      case "seller":
        return "Process and manage food orders";
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
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our food ordering platform</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6"
        >
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Register As
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
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      form.role === roleOption.value
                        ? "bg-red-500 text-white border-red-500 shadow-sm"
                        : "bg-white border-gray-300 text-gray-700 hover:border-red-300"
                    }`}
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

          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="fullname"
                type="text"
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                value={form.fullname}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
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
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Password must be at least 6 characters long
            </p>
          </div>

          {/* Register Button */}
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
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create {form.role.charAt(0).toUpperCase() + form.role.slice(1)} Account
              </>
            )}
          </button>

          {/* Account Benefits */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Account Benefits:</h3>
            <div className="text-xs text-gray-600 space-y-2">
              {form.role === "user" && (
                <>
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Browse delicious food items
                  </p>
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Easy online ordering
                  </p>
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Track your orders in real-time
                  </p>
                </>
              )}
              {form.role === "seller" && (
                <>
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Manage incoming orders
                  </p>
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Update order status
                  </p>
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    View order analytics
                  </p>
                </>
              )}
              {form.role === "admin" && (
                <>
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Full menu management
                  </p>
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Business analytics
                  </p>
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    System oversight
                  </p>
                </>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <button 
              onClick={() => window.location.reload()} // This would typically navigate to login
              className="text-red-500 hover:text-red-600 font-medium"
              disabled={loading}
            >
              Sign in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}