import React, { useContext, useState, useEffect } from "react";
import { DashboardContext } from "../../../context/DashboardContext";
import Sidebar from "../common/Sidebar/Sidebar";
import Header from "../common/Header/Header";
import Notification from "../common/Notification";
import Menu from "./Menu/Menu";
import Cart from "./Cart/Cart";
import Orders from "./Orders/Orders";
import Profile from "./Profile/Profile";
import StripePayment from "../../StripePayment";

// Add all required Lucide React icons
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

    // Use _id as primary identifier, fallback to id
    const itemId = item._id || item.id;
    
    if (!itemId) {
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

      // Show payment modal instead of directly creating order
      setCurrentOrderData(orderData);
      setShowPayment(true);
      
    } catch (error) {
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

  const refreshData = async () => {
    try {
      await loadFoodItems();
      await loadOrders();
      showToast("Data refreshed successfully");
    } catch (error) {
      showToast("Failed to refresh data", "error");
    }
  };

  const navItems = [
    { id: "menu", label: "Menu", icon: MenuIcon },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "profile", label: "Profile", icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "menu":
        return <Menu 
          foodItems={foodItems}
          loading={loading}
          error={error}
          addToCart={addToCart}
          refreshData={refreshData}
          setActiveTab={setActiveTab}
        />;
      case "cart":
        return <Cart 
          cart={cart}
          foodItems={foodItems}
          updateQty={updateQty}
          removeItem={removeItem}
          placeOrder={placeOrder}
          loading={loading}
          setActiveTab={setActiveTab}
        />;
      case "orders":
        return <Orders 
          orders={orders}
          loading={loading}
          error={error}
          refreshData={refreshData}
          setActiveTab={setActiveTab}
        />;
      case "profile":
        return <Profile 
          userProfile={userProfile}
          isEditingProfile={isEditingProfile}
          setIsEditingProfile={setIsEditingProfile}
          handleProfileChange={handleProfileChange}
          handleSaveProfile={handleSaveProfile}
          handleAvatarUpload={handleAvatarUpload}
          loading={loading}
        />;
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
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        userProfile={userProfile}
        cart={cart}
        onLogout={onLogout}
        title="Food Ordering"
        subtitle={`Welcome, ${userProfile.fullName || userProfile.fullname || 'User'}!`}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          navItems={navItems}
          userProfile={userProfile}
          cart={cart}
          setActiveTab={setActiveTab}
        />

        <div className="flex-1 p-6 overflow-auto">
          <Notification notification={notification} />
          {renderContent()}
        </div>
      </div>

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