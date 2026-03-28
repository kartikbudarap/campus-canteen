import React from 'react';
import { Menu, ShoppingCart } from 'lucide-react';

export default function Header({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeTab, 
  navItems, 
  userProfile, 
  cart,
  setActiveTab,
  title = "Dashboard"
}) {
  return (
    <nav className="bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {navItems.find(item => item.id === activeTab)?.label || title}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {cart && (
            <button
              onClick={() => setActiveTab("cart")}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          )}
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Welcome, {userProfile.fullName || userProfile.fullname || userProfile.name || 'User'}!
              </div>
              <div className="text-xs text-gray-600">Ready to order?</div>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {(userProfile.fullName || userProfile.fullname || userProfile.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}