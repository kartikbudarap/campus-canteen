import React, { useState } from 'react';
import { X, ImagePlus, Utensils } from 'lucide-react';

export default function FoodItemForm({ isOpen, onClose, onSubmit, editingItem, showToast, isAuthenticated }) {
  const [formData, setFormData] = useState({
    name: editingItem?.name || "",
    description: editingItem?.description || "",
    price: editingItem?.price?.toString() || "",
    category: editingItem?.category || "",
    isAvailable: editingItem?.isAvailable ?? true,
    image: editingItem?.image || "",
  });

  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please select a valid image file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
      showToast("Image uploaded successfully");
    };
    reader.onerror = () => {
      showToast("Failed to read image file", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      showToast("Authentication required", "error");
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
      };
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {editingItem ? "Edit Menu Item" : "Add New Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              placeholder="Enter item name"
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter description"
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 resize-none"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                placeholder="Category"
                className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Image
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
                <div className="p-3 rounded-xl border border-gray-300 hover:border-red-500 transition-all duration-200 text-center text-gray-700 hover:text-red-500">
                  <ImagePlus className="w-4 h-4 inline mr-2" />
                  Choose Image
                </div>
              </label>
            </div>
            {formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-300">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="rounded border-gray-300 text-red-500 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Available for order</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}