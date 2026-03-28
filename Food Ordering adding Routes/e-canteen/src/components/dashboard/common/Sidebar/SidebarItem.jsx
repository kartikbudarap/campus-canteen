import React from 'react';

export default function SidebarItem({ item, activeTab, setActiveTab, sidebarOpen }) {
  const Icon = item.icon;
  
  return (
    <button
      onClick={() => setActiveTab(item.id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        activeTab === item.id
          ? 'bg-red-500 text-white shadow-sm'
          : 'text-gray-700 hover:bg-red-50 hover:text-red-500'
      } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
    >
      <Icon className="w-5 h-5" />
      {sidebarOpen && (
        <div className="flex items-center justify-between flex-1">
          <span className="font-medium">{item.label}</span>
          {item.notification > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {item.notification}
            </span>
          )}
        </div>
      )}
    </button>
  );
}