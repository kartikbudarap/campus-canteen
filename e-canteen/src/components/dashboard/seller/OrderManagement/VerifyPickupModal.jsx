import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Loader2, ScanLine, ShieldCheck, X } from 'lucide-react';

export default function VerifyPickupModal({ order, onClose, onVerify }) {
  const [credential, setCredential] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const inputRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => {});
    };
  }, []);

  const stopCamera = async () => {
    if (scannerRef.current?.isScanning) await scannerRef.current.stop();
    scannerRef.current = null;
    setCameraOpen(false);
  };

  const verifyCredential = async (value) => {
    if (!value.trim()) return setError('Enter the 6-digit PIN or scan the QR code.');
    setLoading(true);
    setError('');
    try {
      await onVerify(order._id || order.id, value);
      await stopCamera();
      onClose();
    } catch (requestError) {
      setError(requestError.message || 'Pickup verification failed');
      if (scannerRef.current?.isScanning) scannerRef.current.resume();
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    await verifyCredential(credential);
  };

  const startCamera = async () => {
    setError('');
    setCameraOpen(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const scanner = new Html5Qrcode('pickup-qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        async (decodedText) => {
          setCredential(decodedText);
          scanner.pause(true);
          await verifyCredential(decodedText);
        },
        () => {}
      );
    } catch (cameraError) {
      scannerRef.current = null;
      setCameraOpen(false);
      setError(cameraError?.message || 'Camera could not be opened. Allow camera permission and try again.');
    }
  };

  const closeModal = async () => {
    await stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label="Verify pickup">
      <form onSubmit={submit} className="relative my-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={closeModal} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-6 w-6" /></span>
        <h3 className="mt-4 text-xl font-black">Verify customer pickup</h3>
        <p className="mt-1 text-sm text-slate-500">Order #{order.orderNumber || order._id?.slice(-6)} · {order.customerName || order.user?.fullname}</p>

        <label className="mt-6 block text-xs font-black uppercase tracking-wider text-slate-500" htmlFor="pickup-credential">PIN or QR scanner input</label>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 px-3 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
          <ScanLine className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            id="pickup-credential"
            value={credential}
            onChange={(event) => setCredential(event.target.value)}
            placeholder="6-digit PIN or scan QR"
            autoComplete="off"
            className="w-full border-0 bg-transparent py-3 font-mono text-sm outline-none"
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">Enter the customer's PIN, use a counter scanner, or open the camera below.</p>

        {!cameraOpen ? (
          <button type="button" onClick={startCamera} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:border-orange-400 hover:bg-orange-50">
            <Camera className="h-4 w-4" /> Open camera to scan QR
          </button>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-2">
            <div id="pickup-qr-reader" className="min-h-64 w-full overflow-hidden rounded-xl bg-black" />
            <button type="button" onClick={stopCamera} className="mt-2 w-full rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white hover:bg-white/20">Close camera</button>
          </div>
        )}

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

        <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Verify and complete order
        </button>
      </form>
    </div>
  );
}

