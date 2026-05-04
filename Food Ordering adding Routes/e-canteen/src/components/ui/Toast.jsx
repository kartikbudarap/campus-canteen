import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

const styleMap = {
  success: 'bg-emerald-500 border-emerald-400',
  error: 'bg-red-500 border-red-400',
  info: 'bg-sky-500 border-sky-400',
  warning: 'bg-amber-500 border-amber-400',
};

export default function Toast({ notification, onClose }) {
  if (!notification) return null;

  const type = notification.type || 'info';
  const Icon = iconMap[type] || Info;

  return (
    <div
      className={`fixed top-5 right-5 z-[200] max-w-sm px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 toast-enter border text-white ${styleMap[type]}`}
      role="alert"
    >
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <span className="font-medium text-sm flex-1 leading-snug">{notification.message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
