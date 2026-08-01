import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck, Menu, ShoppingCart, X } from 'lucide-react';

const roleCopy = { user: 'Discover something delicious', seller: 'Keep the kitchen moving', admin: 'Your business at a glance' };

export default function Header({ setSidebarOpen, activeTab, navItems, userProfile, cart, setActiveTab, title = 'Dashboard', role = 'user', notifications = [] }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readIds, setReadIds] = useState([]);
  const panelRef = useRef(null);
  const pageTitle = navItems.find((item) => item.id === activeTab)?.label || title;
  const name = userProfile?.fullName || userProfile?.fullname || userProfile?.name || (role === 'admin' ? 'Administrator' : role === 'seller' ? 'Kitchen team' : 'Student');
  const unread = useMemo(() => notifications.filter((item) => !readIds.includes(item.id)), [notifications, readIds]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const openNotification = (item) => {
    setReadIds((current) => current.includes(item.id) ? current : [...current, item.id]);
    if (item.tab) setActiveTab(item.tab);
    setNotificationsOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center gap-4 border-b border-[#e7e3dc] bg-[#faf9f6]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-[#e4dfd6] bg-white p-2.5 text-slate-600 shadow-sm hover:text-slate-950 lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
      <div className="min-w-0"><h1 className="truncate text-xl font-black tracking-[-0.03em] text-[#17211b] sm:text-2xl">{pageTitle}</h1><p className="mt-0.5 hidden text-xs font-medium text-slate-500 sm:block">{roleCopy[role]}</p></div>
      <div className="ml-auto flex items-center gap-2">
        {role === 'user' && cart && <button onClick={() => setActiveTab('cart')} className="relative rounded-xl p-2.5 text-slate-500 hover:bg-orange-50 hover:text-orange-600" aria-label="Open cart"><ShoppingCart className="h-5 w-5" />{cart.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white">{cart.length}</span>}</button>}
        <div ref={panelRef} className="relative">
          <button onClick={() => setNotificationsOpen((open) => !open)} className={`relative rounded-xl p-2.5 transition ${notificationsOpen ? 'bg-[#17211b] text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`} aria-label="Open notifications" aria-expanded={notificationsOpen}><Bell className="h-5 w-5" />{unread.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-[#faf9f6] bg-orange-500 px-1 text-[9px] font-black text-white">{unread.length}</span>}</button>
          {notificationsOpen && <div className="absolute right-0 top-14 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e3ddd4] bg-white shadow-[0_24px_70px_rgba(23,33,27,.18)]"><div className="flex items-center justify-between border-b border-[#eeeae3] px-4 py-3"><div><p className="text-sm font-black text-[#17211b]">Notifications</p><p className="text-[11px] font-semibold text-slate-400">{unread.length} unread</p></div>{unread.length > 0 && <button onClick={() => setReadIds(notifications.map((item) => item.id))} className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600"><CheckCheck className="h-4 w-4" /> Mark all read</button>}</div><div className="max-h-80 overflow-y-auto">{notifications.length ? notifications.map((item) => { const isRead = readIds.includes(item.id); return <button key={item.id} onClick={() => openNotification(item)} className={`flex w-full gap-3 border-b border-[#f1eee8] px-4 py-4 text-left last:border-0 hover:bg-orange-50/40 ${isRead ? 'opacity-60' : ''}`}><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isRead ? 'bg-slate-200' : 'bg-orange-500'}`} /><span><span className="block text-sm font-black text-[#17211b]">{item.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{item.message}</span></span></button>; }) : <div className="grid place-items-center px-5 py-12 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 text-slate-300"><Bell className="h-5 w-5" /></span><p className="mt-3 text-sm font-black text-slate-600">You are all caught up</p><p className="mt-1 text-xs text-slate-400">New order activity will appear here.</p></div>}</div><button onClick={() => setNotificationsOpen(false)} className="flex w-full items-center justify-center gap-2 border-t border-[#eeeae3] py-3 text-xs font-black text-slate-500 hover:bg-slate-50"><X className="h-3.5 w-3.5" /> Close</button></div>}
        </div>
        <div className="ml-1 hidden h-9 w-px bg-[#e4dfd6] sm:block" />
        <div className="ml-1 flex items-center gap-2.5 rounded-2xl p-1.5 pr-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#17211b] text-sm font-black text-white">{name.charAt(0).toUpperCase()}</span><span className="hidden text-left sm:block"><span className="block max-w-28 truncate text-xs font-extrabold text-[#17211b]">{name}</span><span className="block text-[10px] font-bold capitalize text-slate-400">{role}</span></span></div>
      </div>
    </header>
  );
}
