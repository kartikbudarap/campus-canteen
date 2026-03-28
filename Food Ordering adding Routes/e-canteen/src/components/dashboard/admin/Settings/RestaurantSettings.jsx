import React, { useState } from 'react';
import { ChefHat, Phone, Mail, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';

export default function RestaurantSettings({ restaurantInfo, setRestaurantInfo, showToast, isAuthenticated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(restaurantInfo);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      showToast("Authentication required", "error");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/restaurant', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update restaurant info');
      }

      const data = await response.json();
      setRestaurantInfo(data.data);
      setIsEditing(false);
      showToast("Restaurant information updated successfully");
    } catch (error) {
      showToast(error.message || "Failed to update restaurant information", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(restaurantInfo);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Restaurant Information */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Restaurant Information</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={editData.openingHours}
                  onChange={(e) => setEditData({...editData, openingHours: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  placeholder="9:00 AM - 11:00 PM"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={editData.address}
                onChange={(e) => setEditData({...editData, address: e.target.value})}
                rows="3"
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 resize-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                rows="3"
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 resize-none"
                placeholder="Brief description about your restaurant"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <ChefHat className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Restaurant Name</p>
                  <p className="font-medium text-gray-900">{restaurantInfo.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-900">{restaurantInfo.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium text-gray-900">{restaurantInfo.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Opening Hours</p>
                  <p className="font-medium text-gray-900">{restaurantInfo.openingHours}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-red-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{restaurantInfo.address}</p>
              </div>
            </div>
            
            {restaurantInfo.description && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="font-medium text-gray-900">{restaurantInfo.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors duration-300">
            <div>
              <p className="font-medium text-gray-900">Order Notifications</p>
              <p className="text-sm text-gray-600">Get notified for new orders</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors duration-300">
            <div>
              <p className="font-medium text-gray-900">Low Stock Alerts</p>
              <p className="text-sm text-gray-600">Get notified when items are running low</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors duration-300">
            <div>
              <p className="font-medium text-gray-900">Revenue Reports</p>
              <p className="text-sm text-gray-600">Receive daily revenue reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto-refresh Data</p>
              <p className="text-sm text-gray-600">Automatically refresh data every 5 minutes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Dark Mode</p>
              <p className="text-sm text-gray-600">Switch to dark theme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-red-900 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <p className="font-medium text-red-900">Clear All Data</p>
              <p className="text-sm text-red-700">Permanently delete all orders and menu items</p>
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200">
              Clear Data
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <p className="font-medium text-red-900">Reset Restaurant</p>
              <p className="text-sm text-red-700">Reset all settings to default</p>
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}