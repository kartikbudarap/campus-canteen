import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

const money = (value) => `\u20B9${Number(value || 0).toLocaleString('en-IN')}`;

export default function RevenueChart({ orders, timeRange = '7d' }) {
  const data = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (days - index - 1));
      const revenue = orders
        .filter((order) => order.status === 'completed' && order.createdAt && new Date(order.createdAt).toDateString() === date.toDateString())
        .reduce((sum, order) => sum + Number(order.total || 0), 0);
      return { date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), revenue };
    });
  }, [orders, timeRange]);

  return (
    <section className="rounded-3xl border border-[#e5e0d7] bg-white p-5 shadow-[0_18px_50px_rgba(31,38,33,.05)] sm:p-6">
      <div className="flex items-start justify-between">
        <div><p className="text-sm font-black text-[#17211b]">Revenue performance</p><p className="mt-1 text-xs font-medium text-slate-400">Completed orders across the selected period</p></div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><TrendingUp className="h-5 w-5" /></span>
      </div>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef6a3a" stopOpacity=".28" /><stop offset="100%" stopColor="#ef6a3a" stopOpacity="0" /></linearGradient></defs>
            <CartesianGrid vertical={false} stroke="#eeeae3" strokeDasharray="4 4" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={28} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => `\u20B9${value}`} />
            <Tooltip cursor={{ stroke: '#ef6a3a', strokeDasharray: '4 4' }} contentStyle={{ border: '1px solid #e5e0d7', borderRadius: 14, boxShadow: '0 15px 40px rgba(31,38,33,.12)' }} formatter={(value) => [money(value), 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#ef6a3a" strokeWidth={3} fill="url(#revenueFill)" activeDot={{ r: 5, fill: '#ef6a3a', stroke: '#fff', strokeWidth: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}


