import React, { useContext, useState, useEffect } from "react";
import { DashboardContext } from "../../../context/DashboardContext";
import Sidebar from "../common/Sidebar/Sidebar";
import Header from "../common/Header/Header";
import Notification from "../common/Notification";
import OrderManagement from "./OrderManagement/OrderManagement";
import SellerProfile from "./Profile/SellerProfile";

// Import required icons
import { ShoppingBag, Users, ShoppingCart } from "lucide-react";

export default function SellerDashboard({ onLogout }) {
  const { orders, loadOrders, updateOrderStatus: updateOrderStatusAPI } = useContext(DashboardContext);
  
  const [activeTab, setActiveTab] = useState("orders");
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

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
    } catch (error) {}
    return {
      name: 'Seller',
      email: 'seller@restaurant.com',
      initial: 'S'
    };
  };

  const [sellerProfile, setSellerProfile] = useState({
    name: getSellerInfo().name,
    phone: "+91 9876543210",
    email: getSellerInfo().email,
    address: "Mumbai, Maharashtra",
    shiftTiming: "9:00 AM - 6:00 PM",
    experience: "2 years",
    specialization: "Indian Cuisine"
  });

  const navItems = [
    { id: "orders", label: "Order Management", icon: ShoppingBag, notification: unreadNotifications },
    { id: "profile", label: "My Profile", icon: Users },
  ];

  const showToast = (msg, type = "info") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatusAPI(orderId, newStatus);
      showToast(`Order marked as ${newStatus}`, "success");
    } catch (error) {
      showToast(`Failed to update order status: ${error.message}`, "error");
    }
  };

  const refreshData = async () => {
    try {
      await loadOrders();
      showToast('Orders refreshed successfully!', 'success');
    } catch (error) {
      showToast('Failed to refresh orders', 'error');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return <OrderManagement 
          orders={orders}
          updateOrderStatus={updateOrderStatus}
          refreshData={refreshData}
          showToast={showToast}
          setUnreadNotifications={setUnreadNotifications}
        />;
      case "profile":
        return <SellerProfile 
          sellerProfile={sellerProfile}
          setSellerProfile={setSellerProfile}
          showToast={showToast}
        />;
      default:
        return <div>Order Management</div>;
    }
  };

  const sellerInfo = getSellerInfo();

  return (
    <div className="min-h-screen bg-surface-50 flex overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        userProfile={sellerInfo}
        onLogout={onLogout}
        role="seller"
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          navItems={navItems}
          userProfile={sellerInfo}
          setActiveTab={setActiveTab}
          role="seller"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface-50 p-4 sm:p-6 lg:p-8">
          <Notification notification={notification} />
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}