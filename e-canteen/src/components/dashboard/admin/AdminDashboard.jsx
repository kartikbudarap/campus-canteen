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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="dashboard-shell min-h-screen flex overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        userProfile={restaurantInfo}
        onLogout={onLogout}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          navItems={navItems}
          userProfile={restaurantInfo}
          setActiveTab={setActiveTab}
          role="admin"
          notifications={[
            orders.filter((order) => order.status === 'pending').length > 0 && { id: 'pending-orders', title: 'New orders waiting', message: `${orders.filter((order) => order.status === 'pending').length} orders need kitchen attention.`, tab: 'dashboard' },
            orders.filter((order) => order.status === 'ready').length > 0 && { id: 'ready-orders', title: 'Orders ready for pickup', message: `${orders.filter((order) => order.status === 'ready').length} customers can now collect their food.`, tab: 'dashboard' },
            foodItems.filter((item) => !item.isAvailable).length > 0 && { id: 'hidden-items', title: 'Menu availability', message: `${foodItems.filter((item) => !item.isAvailable).length} menu items are currently hidden.`, tab: 'menu' }
          ].filter(Boolean)}
        />

        <main className="dashboard-surface flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Notification notification={error ? { message: error, type: "error" } : notification} />
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

