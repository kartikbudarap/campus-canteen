import React, { useState } from 'react';
import { RefreshCw, MenuIcon } from 'lucide-react';
import SearchAndFilter from './SearchAndFilter';
import MenuItem from './MenuItem';

export default function Menu({ foodItems, loading, error, addToCart, refreshData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredFoodItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(foodItems.map(item => item.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading menu items...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
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

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Our Menu</h2>
          <p className="text-gray-600">Discover delicious food items</p>
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

      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      {!loading && !error && filteredFoodItems.length === 0 && (
        <div className="text-center py-12">
          <MenuIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No food items found</p>
          <p className="text-gray-500">Try adjusting your search or filter</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFoodItems.map((item) => (
          <MenuItem key={item._id || item.id} item={item} addToCart={addToCart} />
        ))}
      </div>
    </>
  );
}