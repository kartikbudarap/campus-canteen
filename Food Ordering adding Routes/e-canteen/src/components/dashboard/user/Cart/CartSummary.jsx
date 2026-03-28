import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function CartSummary({ cart, placeOrder, loading }) {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4 text-lg font-bold">
        <span>Total:</span>
        <span className="text-red-500">₹{total.toFixed(2)}</span>
      </div>
      <button
        onClick={placeOrder}
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-sm hover:shadow-md ${
          loading
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Processing...
          </div>
        ) : (
          "Proceed to Payment"
        )}
      </button>
    </div>
  );
}