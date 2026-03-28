import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartItem({ item, foodItems, updateQty, removeItem }) {
  const foodItemExists = foodItems.some(fi => 
    fi._id === item._id || fi.id === item._id || 
    fi._id === item.id || fi.id === item.id
  );
  
  if (!foodItemExists) {
    return (
      <div key={item._id} className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="font-semibold text-yellow-800">{item.name}</h3>
              <p className="text-yellow-600 text-sm">Item no longer available</p>
            </div>
          </div>
          <button 
            onClick={() => removeItem(item._id)}
            className="p-2 hover:bg-yellow-100 rounded-xl transition-colors"
          >
            <Trash2 className="w-5 h-5 text-yellow-600" />
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
      <div className="flex items-center gap-4">
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <p className="text-gray-600 text-sm">{item.category}</p>
          <p className="text-red-500 font-medium">₹{item.price} each</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={() => updateQty(item._id, item.qty - 1)}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-medium w-8 text-center">{item.qty}</span>
            <button
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={() => updateQty(item._id, item.qty + 1)}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="text-right min-w-20">
            <p className="font-bold text-gray-900">
              ₹{(item.price * item.qty).toFixed(2)}
            </p>
          </div>
          <button 
            onClick={() => removeItem(item._id)}
            className="p-2 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}