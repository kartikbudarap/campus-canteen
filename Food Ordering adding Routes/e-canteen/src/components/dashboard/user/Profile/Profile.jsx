import React from 'react';
import { Edit3, Save, X, User, Mail, Phone, MapPin, Camera } from 'lucide-react';

export default function Profile({ 
  userProfile, 
  isEditingProfile, 
  setIsEditingProfile, 
  handleProfileChange, 
  handleSaveProfile, 
  handleAvatarUpload, 
  loading 
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          {!isEditingProfile ? (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all duration-200"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 mb-8 p-6 border border-gray-200 rounded-xl">
          <div className="relative">
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-red-100"
              />
            ) : (
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center border-4 border-red-100">
                <span className="text-white text-2xl font-bold">
                  {userProfile.fullName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            {isEditingProfile && (
              <label className="absolute bottom-0 right-0 bg-red-500 text-white p-2 rounded-full cursor-pointer hover:bg-red-600 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {userProfile.fullName || userProfile.fullname || 'User'}
            </h3>
            <p className="text-gray-600">Food Enthusiast</p>
            <p className="text-sm text-gray-500">{userProfile.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <ProfileField
            label="Full Name"
            icon={User}
            value={userProfile.fullName || userProfile.fullname || ''}
            field="fullName"
            isEditing={isEditingProfile}
            onChange={handleProfileChange}
            type="text"
          />
          <ProfileField
            label="Email Address"
            icon={Mail}
            value={userProfile.email}
            field="email"
            isEditing={isEditingProfile}
            onChange={handleProfileChange}
            type="email"
          />
          <ProfileField
            label="Phone Number"
            icon={Phone}
            value={userProfile.phone || ''}
            field="phone"
            isEditing={isEditingProfile}
            onChange={handleProfileChange}
            type="tel"
            placeholder="Enter your phone number"
          />
          <ProfileField
            label="Delivery Address"
            icon={MapPin}
            value={userProfile.address || ''}
            field="address"
            isEditing={isEditingProfile}
            onChange={handleProfileChange}
            type="textarea"
            placeholder="Enter your delivery address"
          />
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, icon: Icon, value, field, isEditing, onChange, type = "text", placeholder }) {
  return (
    <div className="p-4 border border-gray-200 rounded-xl">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Icon className="w-4 h-4 inline mr-2" />
        {label}
      </label>
      {isEditing ? (
        type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 resize-none"
            rows="3"
            placeholder={placeholder}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
            placeholder={placeholder}
          />
        )
      ) : (
        <p className="text-gray-900 font-medium">
          {value || 'Not set'}
        </p>
      )}
    </div>
  );
}