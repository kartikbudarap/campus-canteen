import React from 'react';
import { Menu, ShoppingCart, Search, Bell } from 'lucide-react';

export default function Header({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeTab, 
  navItems, 
  userProfile, 
  cart,
  setActiveTab,
  title = "Dashboard",
  role = "user"
}) {
  const activeNavItem = navItems.find(item => item.id === activeTab);
  const pageTitle = activeNavItem?.label || title;
  const userRole = userProfile?.role || role;

  const getGreetingText = () => {
    switch (userRole) {
      case 'admin': return 'System overview';
      case 'seller': return 'Manage your sales';
      default: return 'Ready to order?';
    }
  };

  const themeClass = {
    user: 'bg-brand-500',
    seller: 'bg-purple-600',
    admin: 'bg-sky-600'
  }[userRole] || 'bg-brand-500';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-200 px-4 sm:px-6 h-[72px] flex items-center justify-between transition-all duration-300">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-colors focus-ring"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden sm:block">
          <h2 className="text-xl font-bold text-surface-900 leading-none tracking-tight">{pageTitle}</h2>
        </div>
      </div>
      
      {/* Search Bar (Optional visual element for premium feel) */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-surface-100 border-none rounded-full py-2 pl-10 pr-4 text-sm text-surface-900 placeholder-surface-500 focus:ring-2 focus:ring-surface-200 focus:bg-white transition-all"
          />
        </div>
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Cart for users */}
        {cart && userRole === 'user' && (
          <button
            onClick={() => setActiveTab("cart")}
            className="relative p-2 text-surface-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors focus-ring group"
            aria-label="View cart"
          >
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-brand-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                {cart.length}
              </span>
            )}
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-colors focus-ring">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-surface-200 hidden sm:block" />

        {/* User Profile Dropdown Area */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-bold text-surface-900 leading-tight">
              {userProfile?.fullName || userProfile?.fullname || userProfile?.name || 'User'}
            </div>
            <div className="text-[11px] font-medium text-surface-500">
              {getGreetingText()}
            </div>
          </div>
          
          <button className="relative focus-ring rounded-full ring-offset-2 transition-transform hover:scale-105 active:scale-95">
            {userProfile?.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm ${themeClass}`}>
                {(userProfile?.fullName || userProfile?.fullname || userProfile?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>
    </header>
  );
}