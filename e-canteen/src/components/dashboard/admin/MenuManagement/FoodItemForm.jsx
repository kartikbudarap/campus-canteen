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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-[2rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-[#e5e0d7] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ebe6de] bg-white/95 p-6 backdrop-blur">
          <h2 className="text-xl font-black tracking-[-.03em] text-[#17211b]">
            {editingItem ? "Edit Menu Item" : "Add New Item"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-xs font-black text-slate-500">
              Item Name
            </label>
            <input
              type="text"
              placeholder="Enter item name"
              className="w-full rounded-xl border border-[#ddd8cf] bg-[#fcfbf8] p-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black text-slate-500">
              Description
            </label>
            <textarea
              placeholder="Enter description"
              className="w-full rounded-xl border border-[#ddd8cf] bg-[#fcfbf8] p-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 resize-none"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">
                Price (INR)
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full rounded-xl border border-[#ddd8cf] bg-[#fcfbf8] p-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black text-slate-500">
                Category
              </label>
              <input
                type="text"
                placeholder="Category"
                className="w-full rounded-xl border border-[#ddd8cf] bg-[#fcfbf8] p-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black text-slate-500">
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
                <div className="p-3 rounded-xl border border-gray-300 hover:border-orange-500 transition-all duration-200 text-center text-gray-700 hover:text-orange-500">
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
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
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
              className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



