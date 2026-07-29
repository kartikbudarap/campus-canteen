import React from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const styles = {
  success: { icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  error: { icon: AlertCircle, tone: 'bg-rose-50 text-rose-700 ring-rose-100' },
  warning: { icon: AlertCircle, tone: 'bg-amber-50 text-amber-700 ring-amber-100' },
  info: { icon: Info, tone: 'bg-orange-50 text-orange-700 ring-orange-100' }
};

export default function Toast({ notification, onClose }) {
  if (!notification) return null;
  const config = styles[notification.type] || styles.info;
  const Icon = config.icon;
  return createPortal(
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[9999] flex justify-center sm:inset-x-auto sm:right-5 sm:justify-end" role="status" aria-live="polite">
      <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-[#e5e0d7] bg-white p-3.5 pr-4 text-[#17211b] shadow-[0_20px_55px_rgba(33,39,35,.16)] toast-enter">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ${config.tone}`}><Icon className="h-4.5 w-4.5" /></span>
        <p className="min-w-0 flex-1 text-sm font-bold leading-5">{notification.message}</p>
        {onClose && <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Dismiss notification"><X className="h-4 w-4" /></button>}
      </div>
    </div>,
    document.body
  );
}
