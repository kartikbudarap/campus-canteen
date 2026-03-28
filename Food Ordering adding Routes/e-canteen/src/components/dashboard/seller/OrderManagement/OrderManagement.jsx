import React, { useState, useEffect } from 'react';
import { Bell, X, RefreshCw, Package } from 'lucide-react';
import OrderCard from './OrderCard';
import OrderStats from './OrderStats';

export default function OrderManagement({ orders, updateOrderStatus, refreshData, showToast, setUnreadNotifications }) {
  const [filter, setFilter] = useState("pending");
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [notifiedOrders, setNotifiedOrders] = useState(new Set());

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

  useEffect(() => {
    const pendingOrders = orders.filter(order => {
      const orderDetails = getOrderDetails(order);
      return orderDetails.status === "pending";
    });
    
    if (pendingOrders.length > 0) {
      const latestOrder = pendingOrders[pendingOrders.length - 1];
      const orderDetails = getOrderDetails(latestOrder);
      
      if (!notifiedOrders.has(orderDetails.id)) {
        setNewOrderNotification({
          id: orderDetails.id,
          message: `New Order #${orderDetails.number} Received!`,
          items: orderDetails.items.length,
          total: orderDetails.total
        });
        
        setUnreadNotifications(prev => prev + 1);
        setNotifiedOrders(prev => new Set([...prev, orderDetails.id]));
        
        setTimeout(() => {
          setNewOrderNotification(null);
        }, 5000);
      }
    }
  }, [orders, notifiedOrders, setUnreadNotifications]);

  const filteredOrders = orders.filter((order) => {
    const orderDetails = getOrderDetails(order);
    if (filter === "pending") return orderDetails.status === "pending";
    if (filter === "active") return ["accepted", "preparing", "ready"].includes(orderDetails.status);
    if (filter === "completed") return orderDetails.status === "completed";
    return true;
  });

  const clearNewOrderNotification = () => {
    setNewOrderNotification(null);
  };

  return (
    <>
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
          onClick={refreshData}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Orders
        </button>
      </div>

      <OrderStats orders={orders} />

      <div className="flex gap-4 mb-8 flex-wrap">
        {[
          { key: "pending", label: `Pending (${orders.filter(o => getOrderDetails(o).status === "pending").length})` },
          { key: "active", label: `Active (${orders.filter(o => ["accepted", "preparing", "ready"].includes(getOrderDetails(o).status)).length})` },
          { key: "completed", label: `Completed (${orders.filter(o => getOrderDetails(o).status === "completed").length})` }
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
          {filteredOrders.map((order) => (
            <OrderCard
              key={getOrderDetails(order).id}
              order={order}
              updateOrderStatus={updateOrderStatus}
              getOrderDetails={getOrderDetails}
            />
          ))}
        </div>
      )}
    </>
  );
}