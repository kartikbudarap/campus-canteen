import React, { useContext, useState, useEffect } from "react";
import { DashboardContext } from "../context/DashboardContext";
import {
  LogOut,
  Clock,
  CheckCircle,
  ChefHat,
  Package,
  Menu,
  ShoppingBag,
  Users,
  Bell,
  User,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Save,
  X,
  RefreshCw,
} from "lucide-react";

export default function SellerDashboard({ onLogout }) {
  const { orders, loadOrders, updateOrderStatus: updateOrderStatusAPI } = useContext(DashboardContext);
  const [filter, setFilter] = useState("pending");
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifiedOrders, setNotifiedOrders] = useState(new Set());

  // Get seller info from localStorage
  const getSellerInfo = () => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        return {
          name: user.name || user.username || user.email?.split('@')[0] || 'Seller',
          email: user.email || 'seller@restaurant.com',
          initial: (user.name || user.username || 'S').charAt(0).toUpperCase()
        };
      }
    } catch (error) {
      console.error('Error getting seller info:', error);
    }
    return {
      name: 'Seller',
      email: 'seller@restaurant.com',
      initial: 'S'
    };
  };

  // Seller Profile State
  const [sellerProfile, setSellerProfile] = useState({
    name: getSellerInfo().name,
    phone: "+91 9876543210",
    email: getSellerInfo().email,
    address: "Mumbai, Maharashtra",
    shiftTiming: "9:00 AM - 6:00 PM",
    experience: "2 years",
    specialization: "Indian Cuisine"
  });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState(sellerProfile);

  // Update profile when component mounts
  useEffect(() => {
    const sellerInfo = getSellerInfo();
    setSellerProfile(prev => ({
      ...prev,
      name: sellerInfo.name,
      email: sellerInfo.email
    }));
    setEditProfileData(prev => ({
      ...prev,
      name: sellerInfo.name,
      email: sellerInfo.email
    }));
  }, []);

  // Get orders from user dashboard context
  const getOrdersFromUserDashboard = () => {
    try {
      // Access orders from DashboardContext which should contain all orders
      if (orders && Array.isArray(orders)) {
        return orders;
      }
      
      // Fallback: Try to get from localStorage if context doesn't have data
      const storedOrders = localStorage.getItem('userOrders');
      if (storedOrders) {
        return JSON.parse(storedOrders);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching orders from user dashboard:', error);
      return [];
    }
  };

  // Get order details with proper ID handling
  const getOrderDetails = (order) => {
    const orderId = order._id || order.id || `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const orderNumber = order.orderNumber || orderId.slice(-8).toUpperCase();
    const customerName = order.customerName || order.customer?.name || order.user?.name || "Customer";
    const totalAmount = order.total || order.amount || order.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0;
    const orderDate = order.createdAt || order.orderDate || order.timestamp || new Date().toISOString();
    
    return {
      id: orderId,
      number: orderNumber,
      customerName,
      total: totalAmount,
      date: orderDate,
      status: order.status || 'pending',
      items: order.items || []
    };
  };

  // Notification sound effect
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        return;
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Audio context not supported or blocked");
    }
  };

  const showToast = (msg, type = "info") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Monitor for new orders from user dashboard
  useEffect(() => {
    const allOrders = getOrdersFromUserDashboard();
    const pendingOrders = allOrders.filter(order => {
      const orderDetails = getOrderDetails(order);
      return orderDetails.status === "pending";
    });
    
    if (pendingOrders.length > 0) {
      const latestOrder = pendingOrders[pendingOrders.length - 1];
      const orderDetails = getOrderDetails(latestOrder);
      
      // Check if we've already notified about this order
      if (!notifiedOrders.has(orderDetails.id)) {
        setNewOrderNotification({
          id: orderDetails.id,
          message: `New Order #${orderDetails.number} Received!`,
          items: orderDetails.items.length,
          total: orderDetails.total
        });
        
        try {
          playNotificationSound();
        } catch (error) {
          // Silent fail for audio
        }
        
        setUnreadNotifications(prev => prev + 1);
        setNotifiedOrders(prev => new Set([...prev, orderDetails.id]));
        
        setTimeout(() => {
          setNewOrderNotification(null);
        }, 5000);
      }
    }
  }, [orders, notifiedOrders]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatusAPI(orderId, newStatus);
      showToast(`Order marked as ${newStatus}`, "success");
    } catch (error) {
      showToast(`Failed to update order status: ${error.message}`, "error");
    }
  };

  const getStatusFlow = (status) => {
    const flow = {
      pending: { next: "accepted", label: "Accept Order", icon: CheckCircle },
      accepted: { next: "preparing", label: "Start Preparing", icon: ChefHat },
      preparing: { next: "ready", label: "Mark Ready", icon: Package },
      ready: { next: "completed", label: "Complete Order", icon: CheckCircle },
    };
    return flow[status];
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      accepted: "bg-blue-100 text-blue-800 border-blue-200",
      preparing: "bg-orange-100 text-orange-800 border-orange-200",
      ready: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Get filtered orders from user dashboard
  const userDashboardOrders = getOrdersFromUserDashboard();
  const filteredOrders = userDashboardOrders.filter((order) => {
    const orderDetails = getOrderDetails(order);
    if (filter === "pending") return orderDetails.status === "pending";
    if (filter === "active") return ["accepted", "preparing", "ready"].includes(orderDetails.status);
    if (filter === "completed") return orderDetails.status === "completed";
    return true;
  });

  // Calculate statistics from user dashboard orders
  const pendingOrders = userDashboardOrders.filter((order) => {
    const orderDetails = getOrderDetails(order);
    return orderDetails.status === "pending";
  }).length;
  
  const activeOrders = userDashboardOrders.filter((order) => {
    const orderDetails = getOrderDetails(order);
    return ["accepted", "preparing", "ready"].includes(orderDetails.status);
  }).length;
  
  const todaysOrders = userDashboardOrders.filter(order => {
    const orderDetails = getOrderDetails(order);
    const orderDate = new Date(orderDetails.date);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  // Profile Management Functions
  const handleProfileEdit = () => {
    setEditProfileData(sellerProfile);
    setIsEditingProfile(true);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSellerProfile(editProfileData);
    setIsEditingProfile(false);
    
    // Update localStorage with new name
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = {
        ...currentUser,
        name: editProfileData.name,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user name:', error);
    }
    
    showToast("Profile updated successfully", "success");
  };

  const handleProfileCancel = () => {
    setEditProfileData(sellerProfile);
    setIsEditingProfile(false);
  };

  // Notification functions
  const clearNewOrderNotification = () => {
    setNewOrderNotification(null);
  };

  const markNotificationsAsRead = () => {
    setUnreadNotifications(0);
    setActiveTab("orders");
  };

  // Navigation items
  const navItems = [
    { id: "orders", label: "Order Management", icon: ShoppingBag, notification: unreadNotifications },
    { id: "profile", label: "My Profile", icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return (
          <>
            {/* New Order Notification Banner */}
            {newOrderNotification && (
              <div className="mb-6 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Bell className="w-6 h-6 animate-bounce" />
                    <div>
                      <p className="font-bold text-lg">{newOrderNotification.message}</p>
                      <p className="text-green-100">
                        {newOrderNotification.items} items • ₹{newOrderNotification.total}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearNewOrderNotification}
                    className="p-2 hover:bg-green-400 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
                <p className="text-gray-600">Manage all customer orders from user dashboard</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    console.log('🔧 SELLER - Refreshing orders from user dashboard...');
                    await loadOrders();
                    showToast('Orders refreshed successfully!', 'success');
                  } catch (error) {
                    console.error('Failed to refresh orders:', error);
                    showToast('Failed to refresh orders', 'error');
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200">
                <RefreshCw className="w-4 h-4" />
                Refresh Orders
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Orders</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">{pendingOrders}</h3>
                    <p className="text-gray-500 text-sm mt-1">Need attention</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Orders</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">{activeOrders}</h3>
                    <p className="text-gray-500 text-sm mt-1">In progress</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl group-hover:scale-110 transition-transform">
                    <ChefHat className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Today's Orders</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">{todaysOrders}</h3>
                    <p className="text-gray-500 text-sm mt-1">Total today</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-4 mb-8 flex-wrap">
              {[
                { key: "pending", label: `Pending (${pendingOrders})` },
                { key: "active", label: `Active (${activeOrders})` },
                { key: "completed", label: `Completed` }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border ${
                    filter === key
                      ? "bg-red-500 text-white border-red-500 shadow-sm"
                      : "bg-white border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No orders found</p>
                <p className="text-gray-500 text-sm">
                  {filter === "pending" 
                    ? "No pending orders at the moment" 
                    : filter === "active"
                    ? "No active orders in progress"
                    : "No completed orders yet"
                  }
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => {
                  const orderDetails = getOrderDetails(order);
                  const action = getStatusFlow(orderDetails.status);
                  const Icon = action?.icon;
                  
                  return (
                    <div
                      key={orderDetails.id}
                      className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(orderDetails.status)}`}>
                          {orderDetails.status.toUpperCase()}
                        </span>
                        <p className="text-gray-600 text-sm">
                          #{orderDetails.number}
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="font-semibold text-gray-900 mb-2">
                          {orderDetails.customerName}
                        </p>
                        
                        {/* Order Items */}
                        <div className="mb-3">
                          {orderDetails.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>{item.foodItem?.name || item.name || `Item ${index + 1}`}</span>
                              <span>Qty: {item.quantity || item.qty || 1}</span>
                            </div>
                          ))}
                          {orderDetails.items.length > 3 && (
                            <p className="text-gray-500 text-sm">+{orderDetails.items.length - 3} more items</p>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-red-500 font-bold text-lg">
                            ₹{orderDetails.total}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {new Date(orderDetails.date).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {Icon && orderDetails.status !== 'completed' && (
                        <button
                          onClick={() => updateOrderStatus(orderDetails.id, action.next)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl flex justify-center items-center gap-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Icon className="w-4 h-4" />
                          {action.label}
                        </button>
                      )}

                      {orderDetails.status === "completed" && (
                        <div className="text-center text-green-600 text-sm font-medium py-2">
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Order Completed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );

      case "profile":
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                <button
                  onClick={isEditingProfile ? handleProfileCancel : handleProfileEdit}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isEditingProfile 
                      ? "bg-gray-500 hover:bg-gray-600 text-white" 
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {isEditingProfile ? (
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

              {isEditingProfile ? (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editProfileData.name}
                        onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
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
                        value={editProfileData.phone}
                        onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
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
                        value={editProfileData.email}
                        onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})}
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
                        value={editProfileData.shiftTiming}
                        onChange={(e) => setEditProfileData({...editProfileData, shiftTiming: e.target.value})}
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
                        value={editProfileData.experience}
                        onChange={(e) => setEditProfileData({...editProfileData, experience: e.target.value})}
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
                        value={editProfileData.specialization}
                        onChange={(e) => setEditProfileData({...editProfileData, specialization: e.target.value})}
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
                      value={editProfileData.address}
                      onChange={(e) => setEditProfileData({...editProfileData, address: e.target.value})}
                      rows="2"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 resize-none"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleProfileCancel}
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
                  {/* Personal Information */}
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
                  
                  {/* Professional Details */}
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
                  
                  {/* Address */}
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

      default:
        return (
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`} style={{ height: '100vh', position: 'sticky', top: 0 }}>
        <div className="flex-1 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Seller Portal</h1>
                  <p className="text-xs text-gray-600">Order Management</p>
                </div>
              )}
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === "orders") {
                      setUnreadNotifications(0);
                    }
                  }}
                  className={`w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200 relative ${
                    activeTab === item.id
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-500'
                  } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && (
                    <span className="font-medium ml-3">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center p-3 text-gray-700 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ${
              sidebarOpen ? 'justify-start gap-3' : 'justify-center'
            }`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <nav className="bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {navItems.find(item => item.id === activeTab)?.label || 'Seller Portal'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{sellerProfile.name}</div>
                <div className="text-xs text-gray-600">Order Manager</div>
              </div>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {getSellerInfo().initial}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          {notification && (
            <div className={`fixed top-5 right-5 z-[100] px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-down border ${
              notification.type === "success" 
                ? "bg-green-500 text-white border-green-400" 
                : "bg-red-500 text-white border-red-400"
            }`}>
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{notification.message}</span>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </div>
  );
}