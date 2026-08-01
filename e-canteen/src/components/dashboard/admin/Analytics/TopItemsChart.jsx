import React, { useMemo } from 'react';
import { Award, Utensils } from 'lucide-react';

export default function TopItemsChart({ orders }) {
  const items = useMemo(() => {
    const sales = {};
    orders.filter((order) => order.status === 'completed').forEach((order) => {
      order.items?.forEach((item) => {
        const key = item.foodItem?._id || item.name || item._id;
        if (!sales[key]) sales[key] = { name: item.name || item.foodItem?.name || 'Menu item', category: item.foodItem?.category || 'Menu', image: item.foodItem?.image, quantity: 0, revenue: 0 };
        sales[key].quantity += Number(item.quantity || 1);
        sales[key].revenue += Number(item.price || item.foodItem?.price || 0) * Number(item.quantity || 1);
      });
    });
    return Object.values(sales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [orders]);
  const max = Math.max(...items.map((item) => item.quantity), 1);

  return (
    <section className="rounded-3xl border border-[#e5e0d7] bg-white p-5 shadow-[0_18px_50px_rgba(31,38,33,.05)] sm:p-6">
      <div className="flex items-start justify-between"><div><p className="text-sm font-black">Top-selling menu</p><p className="mt-1 text-xs font-medium text-slate-400">Items customers choose most often</p></div><Award className="h-5 w-5 text-amber-500" /></div>
      <div className="mt-6 space-y-4">{items.length ? items.map((item, index) => <div key={item.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-orange-50 text-sm font-black text-orange-700">{item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : index + 1}</span><div className="min-w-0"><div className="flex justify-between gap-3"><p className="truncate text-sm font-bold">{item.name}</p><p className="text-xs font-black">{item.quantity} sold</p></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${(item.quantity / max) * 100}%` }} /></div></div><p className="text-right text-xs font-bold text-slate-400">{'\u20B9'}{item.revenue.toLocaleString('en-IN')}</p></div>) : <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-12 text-center"><Utensils className="h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-400">Sales insights appear after completed orders</p></div>}</div>
    </section>
  );
}


