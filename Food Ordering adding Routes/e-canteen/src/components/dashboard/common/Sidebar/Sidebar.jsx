import React from 'react';
import { Home, ShoppingCart, LogOut, Utensils } from 'lucide-react';
import SidebarItem from './SidebarItem';

export default function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen,
  activeTab, 
  setActiveTab, 
  navItems, 
  userProfile, 
  cart,
  onLogout,
  title = "Campus Canteen",
  role = "user"
}) {
  
  // Role-based styling configuration
  const theme = {
    user: { bg: 'bg-brand-500', text: 'text-brand-500', hover: 'hover:bg-brand-50', border: 'border-brand-200' },
    seller: { bg: 'bg-purple-600', text: 'text-purple-600', hover: 'hover:bg-purple-50', border: 'border-purple-200' },
    admin: { bg: 'bg-sky-600', text: 'text-sky-600', hover: 'hover:bg-sky-50', border: 'border-sky-200' }
  }[role] || { bg: 'bg-brand-500', text: 'text-brand-500', hover: 'hover:bg-brand-50', border: 'border-brand-200' };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay lg:hidden ${sidebarOpen ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-0 sidebar-transition flex flex-col bg-white border-r border-surface-200 shadow-sm ${
          sidebarOpen ? 'w-[260px] translate-x-0' : 'w-[260px] lg:w-20 -translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Area */}
        <div className="h-[72px] flex items-center px-4 border-b border-surface-200 flex-shrink-0">
          <div className="flex items-center gap-3 w-full">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.bg}`}>
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div className={`flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300 ${!sidebarOpen && 'lg:opacity-0 lg:w-0'}`}>
              <h1 className="text-base font-bold text-surface-900 leading-tight">{title}</h1>
              <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">
                {role.toUpperCase()} PANEL
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              activeTab={activeTab}
              setActiveTab={(id) => {
                setActiveTab(id);
                if (window.innerWidth < 1024) setSidebarOpen(false); // Close on mobile after selection
              }}
              sidebarOpen={sidebarOpen}
              theme={theme}
            />
          ))}
        </div>

        {/* Cart Widget (User Only) */}
        {cart && role === 'user' && (
          <div className={`px-3 py-4 transition-all duration-300 ${!sidebarOpen && 'lg:opacity-0 lg:h-0 lg:p-0 lg:overflow-hidden'}`}>
            <div className={`p-4 rounded-xl border bg-surface-50 ${theme.border}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-surface-700">Your Cart</span>
                <span className={`text-sm font-bold ${theme.text}`}>{cart.length} items</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-500">Total amount</span>
                <span className="text-sm font-bold text-surface-900">
                  ₹{cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab("cart");
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                disabled={cart.length === 0}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  cart.length > 0
                    ? `${theme.bg} text-white hover:opacity-90 shadow-sm`
                    : "bg-surface-200 text-surface-400 cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Checkout
              </button>
            </div>
          </div>
        )}

        {/* Footer Area */}
        <div className="p-3 border-t border-surface-200 flex-shrink-0">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-600 font-medium transition-colors ${theme.hover} hover:${theme.text} group`}
            title="Sign out"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${!sidebarOpen && 'lg:opacity-0 lg:w-0'}`}>
              Sign out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}