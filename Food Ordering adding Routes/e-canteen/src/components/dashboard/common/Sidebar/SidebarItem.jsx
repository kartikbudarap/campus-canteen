import React from 'react';

export default function SidebarItem({ item, activeTab, setActiveTab, sidebarOpen, theme }) {
  const Icon = item.icon;
  const isActive = activeTab === item.id;
  
  return (
    <button
      onClick={() => setActiveTab(item.id)}
      className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative ${
        isActive
          ? `${theme.bg} text-white shadow-sm font-semibold`
          : `text-surface-600 font-medium ${theme.hover} hover:${theme.text}`
      }`}
      title={!sidebarOpen ? item.label : undefined}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      
      <div className={`flex items-center justify-between flex-1 ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${!sidebarOpen && 'lg:opacity-0 lg:w-0 lg:ml-0'}`}>
        <span className="text-sm">{item.label}</span>
        
        {item.notification > 0 && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isActive ? 'bg-white text-surface-900' : `${theme.bg} text-white`
          }`}>
            {item.notification}
          </span>
        )}
      </div>

      {/* Active Indicator Line for collapsed state */}
      {isActive && !sidebarOpen && (
        <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
      )}
    </button>
  );
}