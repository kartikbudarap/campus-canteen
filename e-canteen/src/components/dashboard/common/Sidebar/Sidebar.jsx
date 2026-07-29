import React from 'react';
import { LogOut, ShoppingBag, Utensils, X } from 'lucide-react';
import SidebarItem from './SidebarItem';

const accents = {
  user: { solid: 'bg-orange-500', soft: 'bg-orange-50 text-orange-700', label: 'Student workspace' },
  seller: { solid: 'bg-orange-500', soft: 'bg-orange-50 text-orange-700', label: 'Kitchen workspace' },
  admin: { solid: 'bg-orange-500', soft: 'bg-orange-50 text-orange-700', label: 'Admin workspace' }
};

export default function Sidebar({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, navItems, cart, onLogout, role = 'user' }) {
  const accent = accents[role] || accents.user;
  const cartTotal = cart?.reduce((sum, item) => sum + item.price * item.qty, 0) || 0;

  return (
    <>
      {sidebarOpen && <button className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-[#e5e0d7] bg-[#faf9f6] text-[#17211b] shadow-[8px_0_30px_rgba(34,39,35,.04)] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center gap-3 border-b border-[#e5e0d7] px-5">
          <div className={`grid h-10 w-10 place-items-center rounded-2xl ${accent.solid}`}><Utensils className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-black tracking-tight">Campus Canteen</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{accent.label}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden" aria-label="Close sidebar"><X className="h-4 w-4" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Workspace navigation">
          <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
          <div className="space-y-1">
            {navItems.map((item) => <SidebarItem key={item.id} item={item} activeTab={activeTab} setActiveTab={(id) => { setActiveTab(id); if (window.innerWidth < 1024) setSidebarOpen(false); }} sidebarOpen theme={accent} />)}
          </div>
        </nav>

        {role === 'user' && cart && (
          <div className="mx-3 mb-3 rounded-2xl border border-[#e3ddd3] bg-white p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-bold text-slate-400">Current order</p><p className="mt-1 text-lg font-black">₹{cartTotal.toFixed(0)}</p></div>
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${accent.soft}`}><ShoppingBag className="h-5 w-5" /></div>
            </div>
            <button onClick={() => setActiveTab('cart')} disabled={!cart.length} className="mt-4 w-full rounded-xl bg-white px-3 py-2.5 text-sm font-extrabold text-[#17211b] transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40">View cart · {cart.length}</button>
          </div>
        )}

        <div className="border-t border-[#e5e0d7] p-3">
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-ring">
            <LogOut className="h-5 w-5" /><span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
