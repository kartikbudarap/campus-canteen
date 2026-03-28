import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function Notification({ notification }) {
  if (!notification) return null;

  return (
    <div className={`fixed top-5 right-5 z-[100] px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-down border ${
      notification.type === "success" 
        ? "bg-green-500 text-white border-green-400" 
        : "bg-red-500 text-white border-red-400"
    }`}>
      <CheckCircle className="w-5 h-5" />
      <span className="font-medium">{notification.message}</span>
    </div>
  );
}