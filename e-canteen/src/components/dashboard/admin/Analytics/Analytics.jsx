import React, { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock3, IndianRupee, RefreshCw, ShoppingBag, Sparkles, TrendingUp, Utensils } from 'lucide-react';
import RevenueChart from './RevenueChart';
import OrdersChart from './OrdersChart';
import TopItemsChart from './TopItemsChart';

const money = (value) => `\u20B9${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const statusStyle = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-blue-50 text-blue-700',
  preparing: 'bg-violet-50 text-violet-700',
  ready: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-rose-50 text-rose-700'
};

export default function Analytics({ orders = [], foodItems = [], totalRevenue = 0, refreshData, detailed = false }) {
  const [range, setRange] = useState('7d');
  const insights = useMemo(() => {
    const completed = orders.filter((order) => order.status === 'completed');
    const active = orders.filter((order) => ['pending', 'accepted', 'preparing', 'ready'].includes(order.status));
    const today = new Date().toDateString();
    const todayOrders = orders.filter((order) => order.createdAt && new Date(order.createdAt).toDateString() === today);
    const todayRevenue = todayOrders.filter((order) => order.status === 'completed').reduce((sum, order) => sum + Number(order.total || 0), 0);
    const completionRate = orders.length ? Math.round((completed.length / orders.length) * 100) : 0;
    return { completed, active, todayOrders, todayRevenue, completionRate, average: completed.length ? totalRevenue / completed.length : 0 };
  }, [orders, totalRevenue]);

  const metrics = [
    { label: "Today's revenue", value: money(insights.todayRevenue), note: `${insights.todayOrders.length} orders today`, icon: IndianRupee, tone: 'bg-orange-50 text-orange-700', trend: true },
    { label: 'Orders in motion', value: insights.active.length, note: insights.active.length ? 'Kitchen queue is active' : 'Queue is clear', icon: Clock3, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Average order', value: money(insights.average), note: 'Across completed orders', icon: ShoppingBag, tone: 'bg-blue-50 text-blue-700', trend: true },
    { label: 'Completion rate', value: `${insights.completionRate}%`, note: `${insights.completed.length} successfully fulfilled`, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700', trend: insights.completionRate >= 75 }
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#17211b] px-6 py-7 text-white shadow-[0_24px_70px_rgba(23,33,27,.18)] sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.17em] text-orange-200"><Sparkles className="h-3.5 w-3.5" /> Live business pulse</span><h2 className="mt-5 text-3xl font-black tracking-[-.045em] sm:text-4xl !text-white">{detailed ? 'Performance analytics' : 'Good morning, Admin'}</h2><p className="mt-3 max-w-xl text-sm font-medium leading-6 text-white/55">{detailed ? 'Understand revenue, fulfilment, and menu demand from one operating view.' : "Your canteen is ready. Here is the clearest view of today's operations."}</p></div>
          <div className="flex flex-wrap items-center gap-2"><div className="flex rounded-xl bg-white/10 p-1">{['7d', '30d', '90d'].map((item) => <button key={item} onClick={() => setRange(item)} className={`rounded-lg px-3 py-2 text-xs font-black transition ${range === item ? 'bg-white text-[#17211b]' : 'text-white/55 hover:text-white'}`}>{item}</button>)}</div><button onClick={refreshData} className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500 text-white hover:bg-orange-400" aria-label="Refresh dashboard"><RefreshCw className="h-4 w-4" /></button></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, note, icon: Icon, tone, trend }) => <article key={label} className="group rounded-3xl border border-[#e5e0d7] bg-white p-5 shadow-[0_12px_35px_rgba(31,38,33,.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(31,38,33,.08)]"><div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>{React.createElement(Icon, { className: 'h-5 w-5' })}</span>{trend === false ? <ArrowDownRight className="h-4 w-4 text-rose-500" /> : <ArrowUpRight className="h-4 w-4 text-emerald-500" />}</div><p className="mt-5 text-xs font-bold text-slate-400">{label}</p><p className="mt-1 text-3xl font-black tracking-[-.04em] text-[#17211b]">{value}</p><p className="mt-3 text-xs font-semibold text-slate-500">{note}</p></article>)}</section>

      <div className={`grid gap-5 ${detailed ? 'xl:grid-cols-2' : 'xl:grid-cols-[1.45fr_.85fr]'}`}><RevenueChart orders={orders} timeRange={range} />{detailed ? <OrdersChart orders={orders} /> : <TopItemsChart orders={orders} foodItems={foodItems} />}</div>

      {detailed ? <TopItemsChart orders={orders} foodItems={foodItems} /> : (
        <section className="overflow-hidden rounded-3xl border border-[#e5e0d7] bg-white shadow-[0_18px_50px_rgba(31,38,33,.05)]">
          <header className="flex items-center justify-between border-b border-[#eeeae3] px-5 py-4 sm:px-6"><div><p className="text-sm font-black">Recent orders</p><p className="mt-1 text-xs font-medium text-slate-400">Latest customer activity</p></div><span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">{orders.length} total</span></header>
          <div className="divide-y divide-[#f0ede7]">{orders.slice(0, 6).map((order) => <div key={order._id || order.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-4 sm:px-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5f2ec] text-slate-500"><Utensils className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-sm font-black">#{order.orderNumber || order._id?.slice(-6)} <span className="font-semibold text-slate-400"> -  {order.customerName || order.user?.fullname || 'Customer'}</span></p><p className="mt-1 text-xs text-slate-400">{order.items?.length || 0} items  -  {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</p></div><div className="text-right"><p className="text-sm font-black">{money(order.total)}</p><span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-black capitalize ${statusStyle[order.status] || statusStyle.pending}`}>{order.status || 'pending'}</span></div></div>)}{!orders.length && <div className="grid place-items-center py-14 text-center"><TrendingUp className="h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-400">New orders will appear here</p></div>}</div>
        </section>
      )}
    </div>
  );
}






