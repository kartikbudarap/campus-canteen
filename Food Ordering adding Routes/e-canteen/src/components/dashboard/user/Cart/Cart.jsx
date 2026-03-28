import React from 'react';
import { ShoppingCart } from 'lucide-react';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

export default function Cart({ cart, foodItems, updateQty, removeItem, placeOrder, loading }) {
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">Your cart is empty</p>
          <p className="text-gray-500 mb-6">Add some delicious items from our menu</p>
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h2>
      
      <div className="space-y-4 mb-6">
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