import React from 'react';
import { Search } from 'lucide-react';

export default function SearchAndFilter({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  categories 
}) {
  return (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for food items..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 border ${
              selectedCategory === category
                ? "bg-red-500 text-white border-red-500"
                : "bg-white border-gray-300 text-gray-700 hover:border-red-300"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}