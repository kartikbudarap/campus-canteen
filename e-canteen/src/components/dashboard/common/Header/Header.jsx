import React from 'react';
import { Bell, Menu, ShoppingCart } from 'lucide-react';

const roleCopy = { user: 'Discover something delicious', seller: 'Keep the kitchen moving', admin: 'Your business at a glance' };

export default function Header({ setSidebarOpen, activeTab, navItems, userProfile, cart, setActiveTab, title = 'Dashboard', role = 'user' }) {
  const pageTitle = navItems.find((item) => item.id === activeTab)?.label || title;
  const name = userProfile?.fullName || userProfile?.fullname || userProfile?.name || (role === 'admin' ? 'Administrator' : role === 'seller' ? 'Kitchen team' : 'Student');
  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center gap-4 border-b border-[#e7e3dc] bg-[#faf9f6]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-[#e4dfd6] bg-white p-2.5 text-slate-600 shadow-sm hover:text-slate-950 lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
      <div className="min-w-0">
        <h1 className="truncate text-xl font-black tracking-[-0.03em] text-[#17211b] sm:text-2xl">{pageTitle}</h1>
        <p className="mt-0.5 hidden text-xs font-medium text-slate-500 sm:block">{roleCopy[role]}</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {role === 'user' && cart && <button onClick={() => setActiveTab('cart')} className="relative rounded-xl p-2.5 text-slate-500 hover:bg-orange-50 hover:text-orange-600" aria-label="Open cart"><ShoppingCart className="h-5 w-5" />{cart.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white">{cart.length}</span>}</button>}
        <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Notifications"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#faf9f6] bg-orange-500" /></button>
        <div className="ml-1 hidden h-9 w-px bg-[#e4dfd6] sm:block" />
        <button className="ml-1 flex items-center gap-2.5 rounded-2xl p-1.5 pr-3 hover:bg-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#17211b] text-sm font-black text-white">{name.charAt(0).toUpperCase()}</span>
          <span className="hidden text-left sm:block"><span className="block max-w-28 truncate text-xs font-extrabold text-[#17211b]">{name}</span><span className="block text-[10px] font-bold capitalize text-slate-400">{role}</span></span>
        </button>
      </div>
    </header>
  );
}
