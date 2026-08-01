import React, { useMemo, useState } from 'react';
import { Grid2X2, Plus, RefreshCw, Search, SlidersHorizontal, Utensils, X } from 'lucide-react';
import FoodItemCard from './FoodItemCard';
import FoodItemForm from './FoodItemForm';

export default function MenuManagement({ foodItems, addFoodItem, updateFoodItem, deleteFoodItem, refreshData, loading, showToast, isAuthenticated }) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState('all');

  const filteredItems = useMemo(() => foodItems.filter((item) => {
    const matchesSearch = `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesAvailability = availability === 'all' || (availability === 'available' ? item.isAvailable : !item.isAvailable);
    return matchesSearch && matchesAvailability;
  }), [foodItems, query, availability]);

  const openModal = (item = null) => {
    if (!isAuthenticated()) return showToast('Authentication required', 'error');
    setEditingItem(item);
    setShowModal(true);
  };
  const handleSubmit = async (formData) => {
    try {
      if (editingItem) await updateFoodItem(editingItem._id, formData);
      else await addFoodItem(formData);
      showToast(editingItem ? 'Menu item updated' : 'Menu item created');
      setShowModal(false);
      setEditingItem(null);
    } catch (error) { showToast(error.message || 'Failed to save item', 'error'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item? This cannot be undone.')) return;
    try { await deleteFoodItem(id); showToast('Menu item deleted'); } catch (error) { showToast(error.message || 'Failed to delete item', 'error'); }
  };

  const available = foodItems.filter((item) => item.isAvailable).length;
  const categories = new Set(foodItems.map((item) => item.category)).size;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[2rem] border border-[#e5e0d7] bg-white p-6 shadow-[0_18px_50px_rgba(31,38,33,.05)] lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Catalogue</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em]">Menu management</h2><p className="mt-2 text-sm font-medium text-slate-500">Control availability, pricing, and how each item appears to students.</p><div className="mt-5 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-slate-100 px-3 py-1.5">{foodItems.length} items</span><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">{available} live</span><span className="rounded-full bg-orange-50 px-3 py-1.5 text-orange-700">{categories} categories</span></div></div>
        <div className="flex gap-2"><button onClick={refreshData} disabled={loading} className="grid h-11 w-11 place-items-center rounded-xl border border-[#ddd8cf] bg-white text-slate-500 hover:text-slate-900" aria-label="Refresh menu"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button><button onClick={() => openModal()} className="inline-flex items-center gap-2 rounded-xl bg-[#17211b] px-5 py-3 text-sm font-black text-white hover:bg-orange-600"><Plus className="h-4 w-4" /> Add menu item</button></div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-[#e5e0d7] bg-white p-3 shadow-[0_8px_24px_rgba(31,38,33,.035)] md:flex-row">
        <label className="group flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-transparent bg-[#f6f3ee] px-4 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
          <Search className="h-4 w-4 shrink-0 text-slate-400 transition group-focus-within:text-orange-600" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by item name or category..." className="min-w-0 flex-1 !border-0 !bg-transparent !p-0 text-sm font-semibold text-slate-800 !shadow-none outline-none placeholder:font-medium placeholder:text-slate-400 focus:!border-0 focus:!ring-0 focus:!shadow-none" />
          {query && <button type="button" onClick={() => setQuery('')} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700" aria-label="Clear search"><X className="h-3.5 w-3.5" /></button>}
        </label>
        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#e3ddd4] bg-white px-4 transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100 md:min-w-52">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
          <select value={availability} onChange={(event) => setAvailability(event.target.value)} className="w-full cursor-pointer !border-0 !bg-transparent !p-0 text-sm font-black text-slate-700 !shadow-none outline-none focus:!border-0 focus:!ring-0 focus:!shadow-none"><option value="all">All items</option><option value="available">Available only</option><option value="unavailable">Unavailable only</option></select>
        </label>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">{filteredItems.map((item) => <FoodItemCard key={item._id || item.id} item={item} onEdit={() => openModal(item)} onDelete={() => handleDelete(item._id || item.id)} />)}</div>
      {!filteredItems.length && <div className="grid place-items-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-orange-600">{query ? <Search className="h-6 w-6" /> : <Utensils className="h-6 w-6" />}</span><h3 className="mt-4 font-black">{query ? 'No matching menu items' : 'Your menu is empty'}</h3><p className="mt-1 text-sm text-slate-400">{query ? 'Try a different search or filter.' : 'Create the first item students can order.'}</p>{!query && <button onClick={() => openModal()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#17211b] px-4 py-2.5 text-sm font-black text-white"><Grid2X2 className="h-4 w-4" /> Add first item</button>}</div>}

      <FoodItemForm isOpen={showModal} onClose={() => { setShowModal(false); setEditingItem(null); }} onSubmit={handleSubmit} editingItem={editingItem} showToast={showToast} isAuthenticated={isAuthenticated} />
    </div>
  );
}



