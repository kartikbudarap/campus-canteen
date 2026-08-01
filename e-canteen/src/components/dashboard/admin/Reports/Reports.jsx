import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarDays, Download, FileBarChart, IndianRupee, ShoppingBag, TrendingUp, Trophy, Users } from 'lucide-react';

const money = (value) => `\u20B9${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function Reports({ orders = [] }) {
  const [period, setPeriod] = useState('30');
  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(period));
    return orders.filter((order) => !order.createdAt || new Date(order.createdAt) >= cutoff);
  }, [orders, period]);
  const completed = filtered.filter((order) => order.status === 'completed');
  const revenue = completed.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const customers = new Set(filtered.map((order) => order.user?._id || order.user || order.customerPhone).filter(Boolean)).size;
  const average = completed.length ? revenue / completed.length : 0;

  const daily = useMemo(() => {
    const points = {};
    completed.forEach((order) => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      if (!points[key]) {
        points[key] = {
          key,
          timestamp: date.getTime(),
          date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          revenue: 0,
          orders: 0
        };
      }
      points[key].revenue += Number(order.total || 0);
      points[key].orders += 1;
    });
    return Object.values(points)
      .sort((first, second) => first.timestamp - second.timestamp)
      .slice(-12);
  }, [completed]);

  const bestDay = daily.reduce((best, day) => day.revenue > (best?.revenue || 0) ? day : best, null);
  const dailyAverage = daily.length ? revenue / daily.length : 0;

  const exportCsv = () => {
    const header = ['Order', 'Customer', 'Status', 'Total', 'Created'];
    const rows = filtered.map((order) => [order.orderNumber || order._id, order.customerName || order.user?.fullname || '', order.status, order.total || 0, order.createdAt || '']);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `canteen-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const cards = [
    ['Gross revenue', money(revenue), IndianRupee, 'Completed sales'],
    ['Fulfilled orders', completed.length, ShoppingBag, `${filtered.length} total attempts`],
    ['Average ticket', money(average), TrendingUp, 'Revenue per order'],
    ['Unique customers', customers, Users, 'In selected period']
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[2rem] bg-[#17211b] p-6 text-white sm:p-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Financial intelligence</p><h2 className="mt-3 text-3xl font-black tracking-[-.04em] !text-white">Reports & exports</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/55">Review sales health and export order-level records for reconciliation.</p></div><div className="flex gap-2"><select value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-xl !border-white !bg-white px-4 py-3 text-sm font-black !text-[#17211b] outline-none shadow-sm"><option className="text-slate-900" value="7">Last 7 days</option><option className="text-slate-900" value="30">Last 30 days</option><option className="text-slate-900" value="90">Last 90 days</option></select><button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black hover:bg-orange-400"><Download className="h-4 w-4" /> Export CSV</button></div></section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon, note]) => <article key={label} className="rounded-3xl border border-[#e5e0d7] bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-700">{React.createElement(Icon, { className: 'h-5 w-5' })}</span><p className="mt-5 text-xs font-bold text-slate-400">{label}</p><p className="mt-1 text-3xl font-black">{value}</p><p className="mt-2 text-xs font-semibold text-slate-500">{note}</p></article>)}</section>
      <section className="rounded-3xl border border-[#e5e0d7] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-black">Revenue timeline</p><p className="mt-1 text-xs text-slate-400">Chronological performance across active sales days</p></div><span className="w-fit rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-orange-700">{daily.length} active days</span></div>
        <div className="mt-6">
          <aside className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-[#f7f4ee] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-orange-600"><CalendarDays className="h-4 w-4" /></span><div><p className="text-xs font-bold text-slate-400">Active sales days</p><p className="mt-1 text-lg font-black">{daily.length}</p></div></div>
            <div className="flex items-center gap-3 rounded-2xl bg-[#f7f4ee] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-600"><Trophy className="h-4 w-4" /></span><div><p className="text-xs font-bold text-slate-400">Best day</p><p className="mt-1 text-lg font-black">{bestDay ? money(bestDay.revenue) : money(0)} <span className="text-[10px] font-bold text-slate-400">{bestDay?.date || ''}</span></p></div></div>
            <div className="flex items-center gap-3 rounded-2xl bg-[#f7f4ee] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-violet-600"><TrendingUp className="h-4 w-4" /></span><div><p className="text-xs font-bold text-slate-400">Average active day</p><p className="mt-1 text-lg font-black">{money(dailyAverage)}</p></div></div>
          </aside>
          <div className="h-72 min-w-0 rounded-2xl bg-[#fcfaf7] p-3">
            {daily.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={daily} margin={{ top: 10, right: 8, left: -12, bottom: 0 }} barCategoryGap="28%"><CartesianGrid vertical={false} stroke="#eae5dd" strokeDasharray="4 4" /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(value) => money(value)} /><Tooltip formatter={(value) => [money(value), 'Revenue']} labelFormatter={(label) => `Sales on ${label}`} cursor={false} contentStyle={{ borderRadius: 14, border: '1px solid #e5e0d7', boxShadow: '0 14px 35px rgba(31,38,33,.12)' }} /><Bar dataKey="revenue" fill="#ef6a3a" activeBar={{ fill: '#d94f20' }} radius={[8, 8, 3, 3]} maxBarSize={42} /></BarChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-center"><div><TrendingUp className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-black text-slate-500">No completed sales in this period</p><p className="mt-1 text-xs text-slate-400">Revenue will appear after orders are fulfilled.</p></div></div>}
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-3xl border border-[#e5e0d7] bg-white"><header className="flex items-center justify-between border-b border-[#eeeae3] px-5 py-4"><div><p className="text-sm font-black">Transaction register</p><p className="mt-1 text-xs text-slate-400">Most recent orders in this report</p></div><FileBarChart className="h-5 w-5 text-slate-300" /></header><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[#faf8f4] text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-[#f0ede7]">{filtered.slice(0, 10).map((order) => <tr key={order._id || order.id} className="hover:bg-[#fcfaf7]"><td className="px-5 py-4 font-black">#{order.orderNumber || order._id?.slice(-6)}</td><td className="px-5 py-4 font-semibold text-slate-500">{order.customerName || order.user?.fullname || 'Customer'}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black capitalize">{order.status}</span></td><td className="px-5 py-4 text-slate-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '-'}</td><td className="px-5 py-4 text-right font-black">{money(order.total)}</td></tr>)}</tbody></table></div></section>
    </div>
  );
}







