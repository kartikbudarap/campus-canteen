import React from 'react';
import { Package, RefreshCw } from 'lucide-react';
import OrderItem from './OrderItem';

export default function Orders({ orders, loading, error, refreshData, setActiveTab }) {
  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin mb-4" />
        <p className="text-surface-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50/50 backdrop-blur-sm border border-red-200 rounded-2xl p-8 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h3 className="text-lg font-bold text-red-900 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={refreshData}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto h-[60vh] flex items-center justify-center animate-fade-in-up">
        <div className="bg-white/50 backdrop-blur-sm border border-surface-200 rounded-3xl shadow-sm p-12 text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-surface-400" />
          </div>
          <h3 className="text-xl font-bold text-surface-900 mb-2">No orders yet</h3>
          <p className="text-surface-500 mb-8">Start by exploring our menu and making your first order.</p>
          <button
            onClick={() => setActiveTab("menu")}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-sm shadow-brand-500/20 active:scale-[0.98]"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">My Orders</h2>
          <p className="text-surface-500">{orders.length} past order{orders.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={refreshData}
          className="bg-white border border-surface-200 hover:border-surface-300 hover:bg-surface-50 text-surface-700 px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 shadow-sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderItem key={order._id || order.id} order={order} />
        ))}
      </div>
    </div>
  );
}