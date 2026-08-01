import React, { useState } from 'react';
import { Bell, Building2, Check, Clock3, Edit3, Mail, MapPin, Phone, Save, ShieldCheck, X } from 'lucide-react';

const fields = [
  ['name', 'Restaurant name', Building2, 'text'],
  ['phone', 'Phone number', Phone, 'tel'],
  ['email', 'Email address', Mail, 'email'],
  ['openingHours', 'Opening hours', Clock3, 'text']
];

function ToggleRow({ title, description, defaultChecked = false }) {
  return <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#e7e2da] p-4 transition hover:border-orange-200 hover:bg-orange-50/30"><span><span className="block text-sm font-black">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span></span><span className="relative shrink-0"><input type="checkbox" className="peer sr-only" defaultChecked={defaultChecked} /><span className="block h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-orange-500" /><span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" /></span></label>;
}

export default function RestaurantSettings({ restaurantInfo, setRestaurantInfo, showToast, isAuthenticated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(restaurantInfo);
  const [loading, setLoading] = useState(false);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!isAuthenticated()) return showToast('Authentication required', 'error');
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/restaurant`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(editData) });
      if (!response.ok) throw new Error('Failed to update restaurant information');
      const payload = await response.json();
      setRestaurantInfo(payload.data || editData);
      setIsEditing(false);
      showToast('Restaurant profile updated');
    } catch (error) { showToast(error.message || 'Update failed', 'error'); } finally { setLoading(false); }
  };
  const cancel = () => { setEditData(restaurantInfo); setIsEditing(false); };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[2rem] bg-[#17211b] p-6 text-white sm:p-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Workspace controls</p><h2 className="mt-3 text-3xl font-black tracking-[-.04em] !text-white">Restaurant settings</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/55">Manage public information, operational preferences, and account safeguards.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300"><ShieldCheck className="h-4 w-4" /> Workspace healthy</span></section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section className="rounded-3xl border border-[#e5e0d7] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><p className="text-sm font-black">Public profile</p><p className="mt-1 text-xs text-slate-400">Shown across customer-facing experiences</p></div><button onClick={() => isEditing ? cancel() : setIsEditing(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#f3f0ea] px-3 py-2 text-xs font-black hover:bg-orange-50 hover:text-orange-700">{isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}{isEditing ? 'Cancel' : 'Edit profile'}</button></div>
          {isEditing ? <form onSubmit={handleSave} className="mt-6 space-y-4"><div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label, Icon, type]) => <label key={key} className="block"><span className="mb-2 flex items-center gap-2 text-xs font-black text-slate-500">{React.createElement(Icon, { className: 'h-4 w-4' })} {label}</span><input type={type} value={editData[key] || ''} onChange={(event) => setEditData({ ...editData, [key]: event.target.value })} className="w-full rounded-xl border border-[#ddd8cf] px-4 py-3 text-sm outline-none" required /></label>)}</div><label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-black text-slate-500"><MapPin className="h-4 w-4" /> Address</span><textarea value={editData.address || ''} onChange={(event) => setEditData({ ...editData, address: event.target.value })} rows="3" className="w-full resize-none rounded-xl border border-[#ddd8cf] px-4 py-3 text-sm outline-none" required /></label><label className="block"><span className="mb-2 block text-xs font-black text-slate-500">Description</span><textarea value={editData.description || ''} onChange={(event) => setEditData({ ...editData, description: event.target.value })} rows="3" className="w-full resize-none rounded-xl border border-[#ddd8cf] px-4 py-3 text-sm outline-none" /></label><button disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#17211b] px-5 py-3 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-50"><Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save changes'}</button></form> : <div className="mt-6 space-y-3">{fields.map(([key, label, Icon]) => <div key={key} className="flex items-center gap-3 rounded-2xl bg-[#f8f6f1] p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-orange-600">{React.createElement(Icon, { className: 'h-4 w-4' })}</span><div className="min-w-0"><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-black">{restaurantInfo[key] || 'Not provided'}</p></div></div>)}<div className="rounded-2xl bg-[#f8f6f1] p-4"><p className="text-xs font-bold text-slate-400">Address</p><p className="mt-1 text-sm font-black">{restaurantInfo.address}</p></div><div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4 text-sm leading-6 text-slate-600">{restaurantInfo.description || 'Add a short public description for your canteen.'}</div></div>}
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-[#e5e0d7] bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-700"><Bell className="h-5 w-5" /></span><div><p className="text-sm font-black">Notifications</p><p className="text-xs text-slate-400">Choose operational alerts</p></div></div><div className="mt-5 space-y-3"><ToggleRow title="New orders" description="Alert the team when an order arrives." defaultChecked /><ToggleRow title="Pickup exceptions" description="Notify after repeated incorrect pickup attempts." defaultChecked /><ToggleRow title="Daily summary" description="Receive an end-of-day performance recap." /></div></section>
          <section className="rounded-3xl border border-[#e5e0d7] bg-white p-5"><p className="text-sm font-black">Security & access</p><p className="mt-1 text-xs text-slate-400">Recommended safeguards are active</p><div className="mt-5 space-y-3">{['Pickup PIN rate limiting', 'Encrypted pickup credentials', 'Role-based admin access'].map((item) => <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-600"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-3.5 w-3.5" /></span>{item}</div>)}</div></section>
        </div>
      </div>
    </div>
  );
}



