import React from 'react';

export default function SidebarItem({ item, activeTab, setActiveTab, theme }) {
  const Icon = item.icon;
  const active = item.id === activeTab;
  return (
    <button onClick={() => setActiveTab(item.id)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${active ? `${theme.soft} shadow-sm ring-1 ring-black/[0.04]` : 'text-slate-500 hover:bg-white hover:text-[#17211b]'}`}>
      <span className={`grid h-8 w-8 place-items-center rounded-lg transition ${active ? 'bg-white/70' : 'bg-slate-100 group-hover:bg-slate-50'}`}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.notification > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${active ? theme.solid + ' text-white' : 'bg-slate-100 text-slate-600'}`}>{item.notification}</span>}
    </button>
  );
}
