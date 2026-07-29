import React, { useMemo, useState } from 'react';
import { ArrowRight, Coffee, RefreshCw, Search, Sparkles, UtensilsCrossed } from 'lucide-react';
import MenuItem from './MenuItem';

export default function Menu({ foodItems, loading, error, addToCart, refreshData, setActiveTab }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const categories = useMemo(() => ['all', ...new Set(foodItems.map((item) => item.category).filter(Boolean))], [foodItems]);
  const items = useMemo(() => foodItems.filter((item) => {
    const query = search.toLowerCase();
    return (category === 'all' || item.category === category) && (`${item.name} ${item.description}`.toLowerCase().includes(query));
  }), [foodItems, search, category]);

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><div className="text-center"><RefreshCw className="mx-auto h-7 w-7 animate-spin text-orange-500" /><p className="mt-3 text-sm font-bold text-slate-500">Preparing today’s menu…</p></div></div>;
  if (error) return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center"><p className="font-bold text-rose-700">{error}</p><button onClick={refreshData} className="mt-4 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white">Try again</button></div>;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#17211b] px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="relative max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.14em] text-orange-200"><Sparkles className="h-3.5 w-3.5" /> Fresh today</div><h2 className="mt-5 text-3xl font-black tracking-[-.04em] sm:text-4xl">What are you craving?</h2><p className="mt-3 max-w-lg text-sm leading-6 text-white/55 sm:text-base">Explore campus favourites, order ahead, and collect without waiting.</p></div>
        <div className="relative mt-7 flex max-w-xl items-center rounded-2xl bg-white p-1.5 shadow-xl"><Search className="ml-3 h-5 w-5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-0" placeholder="Search dishes, snacks or drinks" /><button onClick={() => setActiveTab?.('cart')} className="hidden rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white sm:block">View cart</button></div>
      </section>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-2xl font-black tracking-[-.03em]">Today’s menu</h3><p className="mt-1 text-sm font-medium text-slate-500">{items.length} items available for ordering</p></div><button onClick={refreshData} className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#e2ddd4] bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-950"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
      <div className="flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-extrabold capitalize transition ${category === item ? 'bg-[#17211b] text-white' : 'border border-[#e3ded5] bg-white text-slate-500 hover:border-slate-300'}`}>{item === 'all' ? 'All food' : item}</button>)}</div>
      {items.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <MenuItem key={item._id || item.id} item={item} addToCart={addToCart} />)}</div> : <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 text-center"><div><Coffee className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 font-black">Nothing matches yet</h3><p className="mt-1 text-sm text-slate-500">Try another search or category.</p></div></div>}
    </div>
  );
}
