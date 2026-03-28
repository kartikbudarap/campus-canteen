import React, { useState } from 'react';
import { Plus, RefreshCw, Utensils } from 'lucide-react';
import FoodItemCard from './FoodItemCard';
import FoodItemForm from './FoodItemForm';

export default function MenuManagement({ 
  foodItems, 
  addFoodItem, 
  updateFoodItem, 
  deleteFoodItem, 
  refreshData, 
  loading, 
  showToast,
  isAuthenticated 
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const openModal = (item = null) => {
    if (!isAuthenticated()) {
      showToast("Authentication required", "error");
      return;
    }
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingItem) {
        await updateFoodItem(editingItem._id, formData);
        showToast("Item updated successfully");
      } else {
        await addFoodItem(formData);
        showToast("New item added");
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      showToast(error.message || "Failed to save item", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!isAuthenticated()) {
        showToast("Authentication required", "error");
        return;
      }
      await deleteFoodItem(id);
      showToast("Item deleted");
    } catch (error) {
      showToast(error.message || "Failed to delete item", "error");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
          <p className="text-gray-600">Manage your restaurant menu</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshData}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl flex gap-2 items-center shadow-sm hover:shadow-md transition-all duration-300 font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
          <button
            onClick={() => openModal()}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl flex gap-2 items-center shadow-sm hover:shadow-md transition-all duration-300 font-medium hover:scale-105"
          >
            <Plus className="w-5 h-5" /> Add New Item
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodItems.map((item) => (
          <FoodItemCard
            key={item._id || item.id}
            item={item}
            onEdit={() => openModal(item)}
            onDelete={() => handleDelete(item._id || item.id)}
          />
        ))}
        {foodItems.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No food items found</p>
            <p className="text-gray-500">Add your first menu item to get started</p>
          </div>
        )}
      </div>

      <FoodItemForm
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
        editingItem={editingItem}
        showToast={showToast}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}