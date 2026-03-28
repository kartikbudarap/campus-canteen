import React, { useState } from 'react';
import { Edit2, Save, X, User, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function SellerProfile({ sellerProfile, setSellerProfile, showToast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(sellerProfile);

  const handleSave = (e) => {
    e.preventDefault();
    setSellerProfile(editData);
    setIsEditing(false);
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = {
        ...currentUser,
        name: editData.name,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {}
    
    showToast("Profile updated successfully", "success");
  };

  const handleCancel = () => {
    setEditData(sellerProfile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <button
            onClick={isEditing ? handleCancel : () => setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isEditing 
                ? "bg-gray-500 hover:bg-gray-600 text-white" 
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
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
                  Shift Timing
                </label>
                <input
                  type="text"
                  value={editData.shiftTiming}
                  onChange={(e) => setEditData({...editData, shiftTiming: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  placeholder="9:00 AM - 6:00 PM"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <input
                  type="text"
                  value={editData.experience}
                  onChange={(e) => setEditData({...editData, experience: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  placeholder="2 years"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  value={editData.specialization}
                  onChange={(e) => setEditData({...editData, specialization: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                  placeholder="Indian Cuisine"
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
                rows="2"
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 resize-none"
                required
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
                className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900">{sellerProfile.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-900">{sellerProfile.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium text-gray-900">{sellerProfile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Shift Timing</p>
                  <p className="font-medium text-gray-900">{sellerProfile.shiftTiming}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Experience</p>
                <p className="font-medium text-gray-900">{sellerProfile.experience}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Specialization</p>
                <p className="font-medium text-gray-900">{sellerProfile.specialization}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-red-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{sellerProfile.address}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}