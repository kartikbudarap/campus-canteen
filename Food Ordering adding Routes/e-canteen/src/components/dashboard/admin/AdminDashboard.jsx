import React, { useState, useEffect } from "react";
import { useDashboard } from "../../../context/DashboardContext";
import Sidebar from "../common/Sidebar/Sidebar";
import Header from "../common/Header/Header";
import Notification from "../common/Notification";
import Analytics from "./Analytics/Analytics";
import MenuManagement from "./MenuManagement/MenuManagement";
import Reports from "./Reports/Reports";
import RestaurantSettings from "./Settings/RestaurantSettings";

// Import all required icons
import {
  Home,
  BarChart3,
  Utensils,
  PieChart,
  Settings,
  ChefHat,
  ShoppingBag,
  Users
} from "lucide-react";

export default function AdminDashboard({ onLogout }) {
  const {
    foodItems,
    orders,
    totalRevenue,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    updateOrderStatus,
    loadFoodItems,
    loadOrders,
    loading,
    error,
    isAuthenticated
  } = useDashboard();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "Tasty Bites Restaurant",
    phone: "+91 9876543210",
    email: "info@tastybites.com",
    address: "123 Food Street, Mumbai, Maharashtra 400001",
    openingHours: "9:00 AM - 11:00 PM",
    description: "Serving delicious food since 2010"
  });

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "menu", label: "Menu Items", icon: Utensils },
    { id: "reports", label: "Reports", icon: PieChart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const showToast = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (isAuthenticated()) {
      loadFoodItems();
      loadOrders();
    }
  }, [isAuthenticated, loadFoodItems, loadOrders]);

  const refreshData = async () => {
    try {
      if (!isAuthenticated()) {
        showToast("Authentication required", "error");
        return;
      }
      await loadFoodItems();
      await loadOrders();
      showToast("Data refreshed successfully");
    } catch (error) {
      showToast("Failed to refresh data", "error");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Analytics 
          orders={orders}
          foodItems={foodItems}
          totalRevenue={totalRevenue}
          refreshData={refreshData}
          loading={loading}
        />;
      case "analytics":
        return <Analytics 
          orders={orders}
          foodItems={foodItems}
          totalRevenue={totalRevenue}
          refreshData={refreshData}
          loading={loading}
          detailed={true}
        />;
      case "menu":
        return <MenuManagement 
          foodItems={foodItems}
          addFoodItem={addFoodItem}
          updateFoodItem={updateFoodItem}
          deleteFoodItem={deleteFoodItem}
          refreshData={refreshData}
          loading={loading}
          showToast={showToast}
          isAuthenticated={isAuthenticated}
        />;
      case "reports":
        return <Reports 
          orders={orders}
          foodItems={foodItems}
          loading={loading}
        />;
      case "settings":
        return <RestaurantSettings 
          restaurantInfo={restaurantInfo}
          setRestaurantInfo={setRestaurantInfo}
          showToast={showToast}
          isAuthenticated={isAuthenticated}
        />;
      default:
        return <div>Welcome to Admin Dashboard</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        userProfile={restaurantInfo}
        onLogout={onLogout}
        title={restaurantInfo.name}
        subtitle="Admin Panel"
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          navItems={navItems}
          userProfile={restaurantInfo}
          setActiveTab={setActiveTab}
          title="Admin Dashboard"
        />

        <div className="flex-1 p-6 overflow-auto">
          <Notification notification={notification} />
          {error && (
            <div className="fixed top-5 left-5 z-[100] bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg">
              <p>Error: {error}</p>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}