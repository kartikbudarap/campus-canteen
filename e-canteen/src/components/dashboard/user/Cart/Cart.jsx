import React from 'react';
import { ShoppingCart } from 'lucide-react';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

export default function Cart({ cart, foodItems, updateQty, removeItem, placeOrder, loading, setActiveTab }) {
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto h-[60vh] flex items-center justify-center animate-fade-in-up">
        <div className="bg-white/50 backdrop-blur-sm border border-surface-200 rounded-3xl shadow-sm p-12 text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-surface-400" />
          </div>
          <h3 className="text-xl font-bold text-surface-900 mb-2">Your cart is empty</h3>
          <p className="text-surface-500 mb-8">Looks like you haven't added anything delicious yet.</p>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Your Cart</h2>
          <p className="text-surface-500">{cart.length} item{cart.length > 1 ? 's' : ''} added</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-8">
        {cart.map((item) => (
          <CartItem
            key={item._id}
            item={item}
            foodItems={foodItems}
            updateQty={updateQty}
            removeItem={removeItem}
          />
        ))}
      </div>

      <CartSummary cart={cart} placeOrder={placeOrder} loading={loading} />
    </div>
  );
}