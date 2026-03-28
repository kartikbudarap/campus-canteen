import React from 'react';
import { Package, RefreshCw } from 'lucide-react';
import OrderItem from './OrderItem';

export default function Orders({ orders, loading, error, refreshData }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={refreshData}
          className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No orders yet</p>
          <p className="text-gray-500 mb-6">Start by exploring our menu</p>
          <button
            onClick={() => setActiveTab("menu")}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Orders ({orders.length})</h2>
          <p className="text-gray-600">Track your order history</p>
        </div>
        <button
          onClick={refreshData}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <OrderItem key={order._id || order.id} order={order} />
        ))}
      </div>
    </div>
  );
}