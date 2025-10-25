import React, { useContext, useState, useEffect } from "react";
import { DashboardContext } from "../context/DashboardContext";
import StripePayment from "./StripePayment"; // Add this import

import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  Menu as MenuIcon,
  Home,
  Clock,
  User,
  LogOut,
  Package,
  Search,
  Edit3,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Camera,
  RefreshCw
} from "lucide-react";

export default function UserDashboard({ onLogout }) {
  const { 
    foodItems, 
    orders, 
    createOrder, 
    loadFoodItems, 
    loadOrders, 
    loading,
    error 
  } = useContext(DashboardContext);

  const [activeTab, setActiveTab] = useState("menu");
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('userCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);

  const [userProfile, setUserProfile] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : {
      fullName: "John Doe",
      email: "user@food.com",
      phone: "+91 9876543210",
      address: "123 Main Street, Mumbai, Maharashtra 400001",
      avatar: ""
    };
  });

  useEffect(() => {
    localStorage.setItem('userCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    console.log('DEBUG - Food Items from API:', foodItems);
    if (foodItems.length > 0) {
      console.log('DEBUG - First food item structure:', foodItems[0]);
      console.log('DEBUG - First food item ID:', foodItems[0]._id);
    }
  }, [foodItems]);

  useEffect(() => {
    loadFoodItems();
    loadOrders();
  }, [loadFoodItems, loadOrders]);

  // Validate cart items when food items load
  useEffect(() => {
    if (foodItems.length > 0 && cart.length > 0) {
      validateCartItems();
    }
  }, [foodItems]);

  const showToast = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 2500);
  };

  

  const validateCartItems = () => {
    const validCart = cart.filter(cartItem => {
      const foodItem = foodItems.find(fi => 
        fi._id === cartItem._id || fi.id === cartItem._id || 
        fi._id === cartItem.id || fi.id === cartItem.id
      );
      return foodItem && foodItem.isAvailable;
    });
    
    if (validCart.length !== cart.length) {
      setCart(validCart);
      localStorage.setItem('userCart', JSON.stringify(validCart));
      showToast("Some items in your cart are no longer available and have been removed.", "error");
    }
  };

  const addToCart = (item) => {
    if (!item.isAvailable) {
      showToast(`${item.name} is currently unavailable`, "error");
      return;
    }

    console.log('DEBUG - Adding to cart:', {
      name: item.name,
      _id: item._id,
      id: item.id,
      fullItem: item
    });

    // Use _id as primary identifier, fallback to id
    const itemId = item._id || item.id;
    
    if (!itemId) {
      console.error('Item missing ID:', item);
      showToast(`Cannot add ${item.name} - item data is invalid`, "error");
      return;
    }

    const exists = cart.find((c) => c._id === itemId || c.id === itemId);
    if (exists) {
      setCart(cart.map((c) => 
        (c._id === itemId || c.id === itemId) ? { ...c, qty: c.qty + 1 } : c
      ));
    } else {
      const cartItem = {
        _id: itemId,
        id: itemId, // Include both for consistency
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image,
        isAvailable: item.isAvailable,
        qty: 1
      };
      
      console.log('DEBUG - Created cart item:', cartItem);
      setCart([...cart, cartItem]);
    }
    showToast(`${item.name} added to cart`);
  };

  const updateQty = (id, qty) => {
    if (qty === 0) return removeItem(id);
    setCart(cart.map((i) => ((i._id === id || i.id === id) ? { ...i, qty } : i)));
  };

  const removeItem = (id) => {
    setCart(cart.filter((i) => i._id !== id && i.id !== id));
    showToast("Item removed from cart");
  };

  const placeOrder = async () => {
    if (!cart.length) {
      showToast("Your cart is empty", "error");
      return;
    }

    // Check minimum amount (₹50 for Stripe)
    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    if (total < 50) {
      showToast("Minimum order amount is ₹50", "error");
      return;
    }

    if (!userProfile.phone || !userProfile.address) {
      showToast("Please complete your profile with phone and address before ordering", "error");
      setActiveTab("profile");
      return;
    }

    try {
      // Validate cart items
      const itemsWithMissingIds = cart.filter(item => !item._id && !item.id);
      if (itemsWithMissingIds.length > 0) {
        showToast("Some items in your cart are invalid. Please remove and re-add them.", "error");
        return;
      }

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          foodItem: item._id || item.id,
          quantity: item.qty || 1
        })),
        total: total,
        customerName: userProfile.fullName || userProfile.fullname || 'Customer',
        customerPhone: userProfile.phone || '',
        deliveryAddress: userProfile.address || '',
        specialInstructions: ""
      };

      console.log('Order data prepared:', orderData);

      // Show payment modal instead of directly creating order
      setCurrentOrderData(orderData);
      setShowPayment(true);
      
    } catch (error) {
      console.error('Order placement error:', error);
      showToast(error.message || "Failed to place order", "error");
    }
  };

  const handlePaymentSuccess = (order) => {
    setShowPayment(false);
    setCart([]);
    localStorage.removeItem('userCart');
    setActiveTab("orders");
    showToast('Order placed successfully! Payment completed.', 'success');
    loadOrders();
  };

  const handleProfileChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userProfile)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      showToast("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (error) {
      showToast(error.message || "Failed to update profile", "error");
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile(prev => ({
          ...prev,
          avatar: reader.result
        }));
        showToast("Avatar updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredFoodItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(foodItems.map(item => item.category).filter(Boolean))];

  const navItems = [
    { id: "menu", label: "Menu", icon: MenuIcon },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "profile", label: "Profile", icon: User },
  ];

  const refreshData = async () => {
    try {
      await loadFoodItems();
      await loadOrders();
      showToast("Data refreshed successfully");
    } catch (error) {
      showToast("Failed to refresh data", "error");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "menu":
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

            {loading && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading menu items...</p>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={refreshData}
                  className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFoodItems.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 group"
                  >
                    {item.image && (
                      <div className="relative overflow-hidden rounded-t-xl">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium">
                          {item.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-red-500 font-bold text-lg">₹{item.price}</span>
                        <button
                          onClick={() => addToCart(item)}
                          disabled={!item.isAvailable}
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                            item.isAvailable
                              ? "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <Plus className="w-4 h-4 inline mr-1" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && filteredFoodItems.length === 0 && (
              <div className="text-center py-12">
                <MenuIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No food items found</p>
                <p className="text-gray-500">Try adjusting your search or filter</p>
              </div>
            )}
          </>
        );

      case "cart":
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h2>
            {cart.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">Your cart is empty</p>
                <p className="text-gray-500 mb-6">Add some delicious items from our menu</p>
                <button
                  onClick={() => setActiveTab("menu")}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => {
                    // Check if item still exists in foodItems
                    const foodItemExists = foodItems.some(fi => 
                      fi._id === item._id || fi.id === item._id || 
                      fi._id === item.id || fi.id === item.id
                    );
                    
                    if (!foodItemExists) {
                      return (
                        <div key={item._id} className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <h3 className="font-semibold text-yellow-800">{item.name}</h3>
                                <p className="text-yellow-600 text-sm">Item no longer available</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeItem(item._id)}
                              className="p-2 hover:bg-yellow-100 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-5 h-5 text-yellow-600" />
                            </button>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div
                        key={item._id}
                        className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-gray-600 text-sm">{item.category}</p>
                            <p className="text-red-500 font-medium">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                onClick={() => updateQty(item._id, item.qty - 1)}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-medium w-8 text-center">{item.qty}</span>
                              <button
                                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                onClick={() => updateQty(item._id, item.qty + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-right min-w-20">
                              <p className="font-bold text-gray-900">
                                ₹{(item.price * item.qty).toFixed(2)}
                              </p>
                            </div>
                            <button 
                              onClick={() => removeItem(item._id)}
                              className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4 text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-red-500">
                      ₹{cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      "Proceed to Payment"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case "orders":
        console.log('DEBUG - Orders data:', orders);
        console.log('DEBUG - Orders length:', orders.length);
        
        return (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Orders ({orders.length})</h2>
                <p className="text-gray-600">Track your order history</p>
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

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={refreshData}
                  className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No orders yet</p>
                <p className="text-gray-500 mb-6">Start by exploring our menu</p>
                <button
                  onClick={() => setActiveTab("menu")}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order._id || order.id}
                    className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Recent order'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        order.status === "completed" 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : order.status === "ready"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : order.status === "preparing"
                          ? "bg-orange-100 text-orange-800 border-orange-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}>
                        {order.status ? order.status.toUpperCase() : 'PENDING'}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="font-semibold text-gray-900 mb-3">Items Ordered:</p>
                      <div className="space-y-3">
                        {order.items && order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {item.foodItem?.image && (
                                <img
                                  src={item.foodItem.image}
                                  alt={item.foodItem.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.foodItem?.name || item.name}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  ₹{item.price || item.foodItem?.price} × {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-gray-900">
                              ₹{((item.price || item.foodItem?.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-lg font-bold text-red-500">
                        Total: ₹{order.total}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {order.status === "completed" ? "Delivered" : 
                           order.status === "ready" ? "Ready for Pickup" :
                           order.status === "preparing" ? "Being Prepared" :
                           "Order Placed"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "profile":
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
                <div className="p-4 border border-gray-200 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={userProfile.fullName || userProfile.fullname || ''}
                      onChange={(e) => handleProfileChange('fullName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {userProfile.fullName || userProfile.fullname || 'Not set'}
                    </p>
                  )}
                </div>

                <div className="p-4 border border-gray-200 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{userProfile.email}</p>
                  )}
                </div>

                <div className="p-4 border border-gray-200 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {userProfile.phone || 'Not set'}
                    </p>
                  )}
                </div>

                <div className="p-4 border border-gray-200 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Delivery Address
                  </label>
                  {isEditingProfile ? (
                    <textarea
                      value={userProfile.address}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 resize-none"
                      rows="3"
                      placeholder="Enter your delivery address"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {userProfile.address || 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Food Ordering</h2>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`} style={{ height: '100vh', position: 'sticky', top: 0 }}>
        <div className="flex-1 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-xl">
                <Home className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Food Ordering</h1>
                  <p className="text-xs text-gray-600">
                    Welcome, {userProfile.fullName || userProfile.fullname || 'User'}!
                  </p>
                </div>
              )}
            </div>
          </div>

          <nav className="p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {sidebarOpen && (
            <div className="p-4 border-t border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Cart Items</span>
                  <span className="text-red-500 font-bold">{cart.length}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">Total:</span>
                  <span className="text-red-500 font-bold">
                    ₹{cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("cart")}
                  disabled={cart.length === 0}
                  className={`w-full py-2 rounded-xl font-medium transition-all duration-200 ${
                    cart.length > 0
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 inline mr-2" />
                  View Cart
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <nav className="bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MenuIcon className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {navItems.find(item => item.id === activeTab)?.label || 'Food Ordering'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("cart")}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Welcome, {userProfile.fullName || userProfile.fullname || 'User'}!
                  </div>
                  <div className="text-xs text-gray-600">Ready to order?</div>
                </div>
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(userProfile.fullName || userProfile.fullname || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 p-6 overflow-auto">
          {notification && (
            <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-down border ${
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

      {/* Add Stripe Payment Modal */}
      <StripePayment
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={currentOrderData?.total || 0}
        orderData={currentOrderData}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}