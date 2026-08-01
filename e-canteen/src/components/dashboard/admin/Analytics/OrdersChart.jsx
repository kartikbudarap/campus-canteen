import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

const statusMeta = [
  ['pending', 'Pending', '#f59e0b'],
  ['accepted', 'Accepted', '#3b82f6'],
  ['preparing', 'Preparing', '#8b5cf6'],
  ['ready', 'Ready', '#10b981'],
  ['completed', 'Completed', '#17211b'],
  ['cancelled', 'Cancelled', '#ef4444']
];

export default function OrdersChart({ orders }) {
  const data = useMemo(() => statusMeta.map(([key, name, color]) => ({
    key, name, color, value: orders.filter((order) => order.status === key).length
  })).filter((item) => item.value > 0), [orders]);

  return (
    <section className="rounded-3xl border border-[#e5e0d7] bg-white p-5 shadow-[0_18px_50px_rgba(31,38,33,.05)] sm:p-6">
      <div className="flex items-start justify-between"><div><p className="text-sm font-black">Order mix</p><p className="mt-1 text-xs font-medium text-slate-400">Live distribution by fulfilment stage</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><Activity className="h-5 w-5" /></span></div>
      <div className="mt-4 grid items-center gap-2 sm:grid-cols-[1fr_1fr]">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.length ? data : [{ name: 'No orders', value: 1, color: '#e2e8f0' }]} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={3} stroke="none">{(data.length ? data : [{ color: '#e2e8f0' }]).map((item) => <Cell key={item.name || item.color} fill={item.color} />)}</Pie><Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e5e0d7' }} /></PieChart></ResponsiveContainer>
        </div>
        <div className="space-y-2">{statusMeta.map(([key, name, color]) => { const value = orders.filter((order) => order.status === key).length; return <div key={key} className="flex items-center gap-2 text-xs"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} /><span className="flex-1 font-semibold text-slate-500">{name}</span><span className="font-black text-slate-800">{value}</span></div>; })}</div>
      </div>
    </section>
  );
}

