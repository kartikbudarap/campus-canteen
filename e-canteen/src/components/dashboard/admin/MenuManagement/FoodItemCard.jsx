import React from 'react';
import { Edit3, ImageOff, MoreVertical, Trash2 } from 'lucide-react';

export default function FoodItemCard({ item, onEdit, onDelete }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-[#e5e0d7] bg-white shadow-[0_14px_40px_rgba(31,38,33,.05)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(31,38,33,.1)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f1eee8]">{item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center"><ImageOff className="h-8 w-8 text-slate-300" /></div>}<div className="absolute inset-x-0 top-0 flex items-start justify-between p-4"><span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur ${item.isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-slate-900/80 text-white'}`}>{item.isAvailable ? 'Live' : 'Hidden'}</span><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/90 text-slate-600 shadow-sm backdrop-blur"><MoreVertical className="h-4 w-4" /></span></div></div>
      <div className="p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-black uppercase tracking-[.14em] text-orange-600">{item.category}</p><h3 className="mt-2 truncate text-lg font-black text-[#17211b]">{item.name}</h3></div><p className="shrink-0 text-xl font-black text-[#17211b]">{'\u20B9'}{Number(item.price || 0).toLocaleString('en-IN')}</p></div><p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{item.description || 'No description added yet.'}</p><div className="mt-5 grid grid-cols-[1fr_auto] gap-2"><button onClick={onEdit} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f4f1eb] px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-700"><Edit3 className="h-4 w-4" /> Edit item</button><button onClick={onDelete} className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${item.name}`}><Trash2 className="h-4 w-4" /></button></div></div>
    </article>
  );
}


