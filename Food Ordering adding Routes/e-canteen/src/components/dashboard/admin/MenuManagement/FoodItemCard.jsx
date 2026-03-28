import React from 'react';
import { Edit2, Trash2, Utensils } from 'lucide-react';

export default function FoodItemCard({ item, onEdit, onDelete }) {
  return (
    <div className="group bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-xl hover:border-red-300 transition-all duration-500 transform hover:-translate-y-2">
      {item.image ? (
        <div className="relative overflow-hidden rounded-xl mb-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-40 object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.isAvailable 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-100 h-40 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300">
          <Utensils className="w-12 h-12 text-gray-400 group-hover:text-gray-500 transition-colors duration-300" />
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.isAvailable 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      )}
      
      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">{item.name}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
      
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-lg text-red-500 group-hover:text-red-600 transition-colors duration-300">
          ₹{item.price}
        </span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 border border-gray-200 group-hover:bg-red-50 group-hover:border-red-200 transition-colors duration-300">
          {item.category}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 bg-white border border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-700 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
        >
          <Edit2 className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  );
}