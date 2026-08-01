import React, { useMemo, useState } from 'react';
import { CheckCircle2, ChefHat, Clock3, PackageCheck, RefreshCw, ShoppingBag } from 'lucide-react';
import VerifyPickupModal from './VerifyPickupModal';

const lanes = [
  { id: 'pending', label: 'New orders', icon: ShoppingBag, statuses: ['pending'], tone: 'bg-orange-50 text-orange-700' },
  { id: 'active', label: 'In kitchen', icon: ChefHat, statuses: ['accepted', 'preparing'], tone: 'bg-orange-50 text-orange-700' },
  { id: 'ready', label: 'Ready', icon: PackageCheck, statuses: ['ready'], tone: 'bg-emerald-50 text-emerald-700' }
];

const nextAction = {
  pending: ['Accept order', 'accepted'],
  accepted: ['Start preparing', 'preparing'],
  preparing: ['Mark ready', 'ready'],
  ready: ['Verify pickup', 'completed']
};

const money = (value) => `\u20B9${Number(value || 0).toLocaleString('en-IN')}`;

export default function OrderManagement({ orders, updateOrderStatus, verifyPickup, refreshData, realtimeConnected }) {
  const [mobileLane, setMobileLane] = useState('pending');
  const [pickupOrder, setPickupOrder] = useState(null);
  const activeOrders = useMemo(() => orders.filter((order) => !['completed', 'cancelled'].includes(order.status)), [orders]);
  const revenue = orders.filter((order) => order.status === 'completed').reduce((sum, order) => sum + Number(order.total || 0), 0);

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Live kitchen</p>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${realtimeConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${realtimeConnected ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'}`} />
              {realtimeConnected ? 'Live updates' : 'Reconnecting'}
            </span>
          </div>
          <h2 className="mt-2 text-3xl font-black tracking-[-.04em]">Order operations</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">New orders and status changes appear automatically.</p>
        </div>
        <button onClick={refreshData} className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#e1dcd3] bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:border-[#17211b] hover:text-[#17211b]"><RefreshCw className="h-4 w-4" /> Sync now</button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          [ShoppingBag, 'Active orders', activeOrders.length, 'Across all stations'],
          [Clock3, 'Avg. prep time', '15 min', 'Within target'],
          [CheckCircle2, 'Completed today', orders.filter((order) => order.status === 'completed').length, `${money(revenue)} revenue`]
        ].map(([StatIcon, label, value, note]) => (
          <article key={label} className="flex items-center gap-4 rounded-2xl border border-[#e5e0d7] bg-white p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-700">{React.createElement(StatIcon, { className: 'h-5 w-5' })}</span>
            <div><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-0.5 text-2xl font-black">{value}</p><p className="text-[11px] font-medium text-slate-400">{note}</p></div>
          </article>
        ))}
      </section>

      <div className="flex gap-2 overflow-x-auto lg:hidden">
        {lanes.map((lane) => (
          <button key={lane.id} onClick={() => setMobileLane(lane.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black ${mobileLane === lane.id ? 'bg-[#17211b] text-white' : 'border border-[#e1dcd3] bg-white text-slate-500'}`}>
            {lane.label} {'\u00B7'} {orders.filter((order) => lane.statuses.includes(order.status)).length}
          </button>
        ))}
      </div>

      <section className="grid gap-5 lg:grid-cols-3">
        {lanes.map((lane) => {
          const laneOrders = orders.filter((order) => lane.statuses.includes(order.status));
          const LaneIcon = lane.icon;
          return (
            <div key={lane.id} className={`${mobileLane !== lane.id ? 'hidden lg:block' : ''} min-w-0 rounded-3xl bg-[#efede8] p-3`}>
              <header className="flex items-center justify-between px-2 py-2"><div className="flex items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-lg ${lane.tone}`}><LaneIcon className="h-4 w-4" /></span><h3 className="text-sm font-black">{lane.label}</h3></div><span className="grid h-6 min-w-6 place-items-center rounded-full bg-white px-1.5 text-xs font-black text-slate-500">{laneOrders.length}</span></header>
              <div className="mt-2 space-y-3">
                {laneOrders.map((order) => {
                  const action = nextAction[order.status];
                  return (
                    <article key={order._id || order.id} className="rounded-2xl border border-[#e1dcd3] bg-white p-4 shadow-[0_8px_24px_rgba(38,43,39,.04)]">
                      <div className="flex items-start justify-between"><div><p className="text-sm font-black">#{order.orderNumber || order._id?.slice(-6)}</p><p className="mt-1 text-xs font-medium text-slate-400">{order.customerName || order.user?.fullname || 'Customer'}</p></div><p className="text-sm font-black">{money(order.total)}</p></div>
                      <div className="my-4 space-y-2">{order.items?.slice(0, 3).map((item, index) => <div key={item._id || index} className="flex justify-between text-xs"><span className="font-medium text-slate-500">{item.quantity || 1}{'\u00D7'} {item.name || item.foodItem?.name || 'Item'}</span></div>)}</div>
                      {action && <button onClick={() => order.status === 'ready' ? setPickupOrder(order) : updateOrderStatus(order._id || order.id, action[1])} className="w-full rounded-xl bg-[#17211b] px-3 py-2.5 text-xs font-black text-white hover:bg-orange-600">{action[0]}</button>}
                    </article>
                  );
                })}
                {!laneOrders.length && <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center"><LaneIcon className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-xs font-bold text-slate-400">No orders here</p></div>}
              </div>
            </div>
          );
        })}
      </section>
      {pickupOrder && <VerifyPickupModal order={pickupOrder} onClose={() => setPickupOrder(null)} onVerify={verifyPickup} />}
    </div>
  );
}
