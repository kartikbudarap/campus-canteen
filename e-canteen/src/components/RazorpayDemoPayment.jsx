import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, ShieldCheck, Smartphone, X } from 'lucide-react';

const money = (value) => `\u20B9${Number(value || 0).toLocaleString('en-IN')}`;
const request = async (path, body) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Payment request failed');
  return data;
};
const loadCheckout = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export default function RazorpayDemoPayment({ isOpen, onClose, amount, orderData, onSuccess }) {
  const [session, setSession] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !orderData) return;
    let active = true;
    setSession(null); setError('');
    request('/razorpay/order', { orderData }).then((data) => active && setSession(data)).catch((err) => active && setError(err.message));
    return () => { active = false; };
  }, [isOpen, orderData]);

  if (!isOpen) return null;
  const verify = async (payment) => {
    setProcessing(true); setError('');
    try {
      const result = await request('/razorpay/verify', { orderData, razorpayOrderId: session.paymentOrderId, ...payment });
      onSuccess(result.data);
    } catch (err) { setError(err.message); } finally { setProcessing(false); }
  };
  const startPayment = async () => {
    if (!session) return;
    if (session.demo) return verify({ demoToken: session.demoToken });
    setProcessing(true);
    if (!await loadCheckout()) { setProcessing(false); setError('Razorpay Checkout could not be loaded'); return; }
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const checkout = new window.Razorpay({
      key: session.keyId, amount: session.amountPaise, currency: session.currency, name: 'Campus Canteen', description: 'Portfolio test payment', order_id: session.paymentOrderId,
      prefill: { name: user.fullname || orderData.customerName, email: user.email, contact: orderData.customerPhone }, theme: { color: '#f36f3d' },
      handler: (response) => verify({ razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature }),
      modal: { ondismiss: () => setProcessing(false) }
    });
    checkout.on('payment.failed', (response) => { setProcessing(false); setError(response.error?.description || 'Test payment failed'); });
    checkout.open();
  };

  return <div className="fixed inset-0 z-[100] grid place-items-center bg-[#17211b]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="demo-payment-title"><div className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/70 bg-[#fbfaf7] shadow-2xl"><header className="flex items-center justify-between border-b border-[#e8e2d8] px-6 py-5"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-600">Recruiter demo</p><h2 id="demo-payment-title" className="mt-1 text-xl font-black">UPI test checkout</h2></div><button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white" aria-label="Close payment"><X className="h-5 w-5" /></button></header><div className="p-6"><div className="rounded-2xl bg-[#17211b] p-5 text-white"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-white/45">Amount payable</p><p className="mt-1 text-3xl font-black text-white">{money(amount)}</p></div><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><Smartphone className="h-6 w-6 text-[#ffd998]" /></span></div></div><div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><p className="text-sm font-black text-amber-900">No real money is charged</p><p className="mt-1 text-xs leading-5 text-amber-700">{session?.demo ? 'Signed local simulation is active. Add Razorpay test keys for hosted checkout.' : 'Razorpay Test Mode is active.'}</p></div></div></div><div className="mt-4 space-y-3 rounded-2xl border border-[#e5dfd5] bg-white p-4"><p className="flex items-center gap-2 text-xs font-bold text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Server-authoritative amount</p><p className="flex items-center gap-2 text-xs font-bold text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Verified before order creation</p></div>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}<button onClick={startPayment} disabled={!session || processing} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f36f3d] px-5 py-4 text-sm font-black text-white hover:bg-[#ff8456] disabled:opacity-50">{!session || processing ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Preparing demo</> : <><Smartphone className="h-4 w-4" /> {session.demo ? 'Simulate successful UPI payment' : 'Open Razorpay Test Checkout'}</>}</button></div></div></div>;
}