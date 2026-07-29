import React, { useState } from 'react';
import { ArrowUpRight, CircleDollarSign, Clock3, MoreHorizontal, RefreshCw, ShoppingBag, Utensils, Users } from 'lucide-react';
import RevenueChart from './RevenueChart';
import OrdersChart from './OrdersChart';
import TopItemsChart from './TopItemsChart';

export default function Analytics({ orders, foodItems, totalRevenue, refreshData, detailed = false }) {
  const [range, setRange] = useState('7d');
  const completed = orders.filter((o) => o.status === 'completed');
  const pending = orders.filter((o) => ['pending', 'accepted', 'preparing'].includes(o.status));
  const average = orders.length ? totalRevenue / orders.length : 0;
  const metrics = [
    { label: 'Net revenue', value: `₹${totalRevenue.toLocaleString()}`, note: '+12.4% this period', icon: CircleDollarSign, tone: 'text-orange-700 bg-orange-50' },
    { label: 'Total orders', value: orders.length, note: `${completed.length} completed`, icon: ShoppingBag, tone: 'text-orange-700 bg-orange-50' },
    { label: 'Average order', value: `₹${average.toFixed(0)}`, note: 'Per customer order', icon: Users, tone: 'text-orange-700 bg-orange-50' },
    { label: 'In progress', value: pending.length, note: 'Needs attention', icon: Clock3, tone: 'text-orange-700 bg-orange-50' }
  ];

  return <div className="space-y-7">
    <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Business overview</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em]">Good morning, Admin</h2><p className="mt-2 text-sm font-medium text-slate-500">Here’s what is happening across your canteen today.</p></div><div className="flex items-center gap-2"><div className="flex rounded-xl border border-[#e1dcd3] bg-white p-1">{['7d','30d','90d'].map((item) => <button key={item} onClick={() => setRange(item)} className={`rounded-lg px-3 py-2 text-xs font-black ${range === item ? 'bg-[#17211b] text-white' : 'text-slate-400 hover:text-slate-700'}`}>{item}</button>)}</div><button onClick={refreshData} className="rounded-xl border border-[#e1dcd3] bg-white p-2.5 text-slate-500 hover:text-slate-900" aria-label="Refresh analytics"><RefreshCw className="h-4 w-4" /></button></div></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({label,value,note,icon:Icon,tone}) => <article key={label} className="rounded-2xl border border-[#e5e0d7] bg-white p-5 shadow-[0_10px_30px_rgba(38,43,39,.04)]"><div className="flex items-start justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span><MoreHorizontal className="h-5 w-5 text-slate-300" /></div><p className="mt-5 text-xs font-bold text-slate-400">{label}</p><p className="mt-1 text-3xl font-black tracking-[-.04em]">{value}</p><p className="mt-3 flex items-center gap-1 text-xs font-bold text-slate-500"><ArrowUpRight className="h-3.5 w-3.5 text-orange-500" />{note}</p></article>)}</section>
    {detailed ? <><div className="grid gap-5 xl:grid-cols-2"><RevenueChart orders={orders} timeRange={range} /><OrdersChart orders={orders} timeRange={range} /></div><TopItemsChart orders={orders} foodItems={foodItems} /></> : <div className="grid gap-5 xl:grid-cols-[1.45fr_.85fr]"><RevenueChart orders={orders} timeRange={range} /><section className="rounded-2xl border border-[#e5e0d7] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-black">Recent orders</p><p className="mt-1 text-xs text-slate-400">Latest customer activity</p></div><ShoppingBag className="h-5 w-5 text-slate-300" /></div><div className="mt-5 divide-y divide-slate-100">{orders.slice(0,5).map((order) => <div key={order._id} className="flex items-center gap-3 py-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50"><Utensils className="h-4 w-4 text-slate-400" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">#{order.orderNumber || order._id?.slice(-6)}</p><p className="text-xs text-slate-400">{order.items?.length || 0} items</p></div><div className="text-right"><p className="text-sm font-black">₹{order.total || 0}</p><p className="text-[10px] font-bold capitalize text-slate-400">{order.status}</p></div></div>)}{!orders.length && <p className="py-10 text-center text-sm text-slate-400">No orders yet</p>}</div></section></div>}
  </div>;
}
