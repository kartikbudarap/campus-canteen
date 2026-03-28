import React from 'react';
import { Plus } from 'lucide-react';

export default function MenuItem({ item, addToCart }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 group">
      {item.image && (
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium">
            {item.category}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-red-500 font-bold text-lg">₹{item.price}</span>
          <button
            onClick={() => addToCart(item)}
            disabled={!item.isAvailable}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              item.isAvailable
                ? "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}