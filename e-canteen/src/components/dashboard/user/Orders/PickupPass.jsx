import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { KeyRound, Loader2, ShieldCheck, X } from 'lucide-react';

export default function PickupPass({ orderId, orderNumber, getPickupPass }) {
  const [pass, setPass] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const showPass = async () => {
    setOpen(true);
    if (pass) return;
    setLoading(true);
    setError('');
    try {
      setPass(await getPickupPass(orderId));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load pickup pass');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={showPass} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700">
        <KeyRound className="h-4 w-4" /> Show pickup pass
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label="Pickup pass">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close pickup pass"><X className="h-5 w-5" /></button>
            <ShieldCheck className="mx-auto h-10 w-10 text-emerald-600" />
            <h3 className="mt-3 text-xl font-black">Order ready for pickup</h3>
            <p className="mt-1 text-sm text-slate-500">#{orderNumber}</p>

            {loading && <Loader2 className="mx-auto mt-8 h-8 w-8 animate-spin text-orange-500" />}
            {error && <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            {pass && (
              <div className="mt-6">
                <div className="mx-auto w-fit rounded-2xl border border-slate-200 bg-white p-4">
                  <QRCodeSVG value={pass.token} size={190} level="H" includeMargin />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-slate-400">Fallback PIN</p>
                <p className="mt-1 font-mono text-4xl font-black tracking-[.25em] text-slate-900">{pass.pin}</p>
                <p className="mt-4 text-xs text-slate-500">Show this QR code or PIN only to counter staff. Expires {new Date(pass.expiresAt).toLocaleTimeString()}.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
