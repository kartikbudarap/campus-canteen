import React from 'react';
import { Home, ShoppingCart, LogOut } from 'lucide-react';
import SidebarItem from './SidebarItem';

export default function Sidebar({ 
  sidebarOpen, 
  activeTab, 
  setActiveTab, 
  navItems, 
  userProfile, 
  cart,
  onLogout,
  title = "Food Ordering",
  subtitle = "Management Panel"
}) {
  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`} style={{ height: '100vh', position: 'sticky', top: 0 }}>
      <div className="flex-1 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-xl">
              <Home className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                <p className="text-xs text-gray-600">{subtitle}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sidebarOpen={sidebarOpen}
            />
          ))}
        </nav>

        {sidebarOpen && cart && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Cart Items</span>
                <span className="text-red-500 font-bold">{cart.length}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="text-red-500 font-bold">
                  ₹{cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setActiveTab("cart")}
                disabled={cart.length === 0}
                className={`w-full py-2 rounded-xl font-medium transition-all duration-200 ${
                  cart.length > 0
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                View Cart
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 mt-auto">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}