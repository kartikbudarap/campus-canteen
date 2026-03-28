import React from 'react';
import { Clock, ChefHat, ShoppingBag } from 'lucide-react';

export default function OrderStats({ orders }) {
  const getOrderDetails = (order) => {
    const orderId = order._id || order.id;
    return {
      id: orderId,
      status: order.status || 'pending',
      date: order.createdAt || order.timestamp || new Date().toISOString()
    };
  };

  const pendingOrders = orders.filter((order) => {
    const orderDetails = getOrderDetails(order);
    return orderDetails.status === "pending";
  }).length;
  
  const activeOrders = orders.filter((order) => {
    const orderDetails = getOrderDetails(order);
    return ["accepted", "preparing", "ready"].includes(orderDetails.status);
  }).length;
  
  const todaysOrders = orders.filter(order => {
    const orderDetails = getOrderDetails(order);
    const orderDate = new Date(orderDetails.date);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      title: "Pending Orders",
      value: pendingOrders,
      description: "Need attention",
      icon: Clock,
      color: "red"
    },
    {
      title: "Active Orders",
      value: activeOrders,
      description: "In progress",
      icon: ChefHat,
      color: "blue"
    },
    {
      title: "Today's Orders",
      value: todaysOrders,
      description: "Total today",
      icon: ShoppingBag,
      color: "green"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900">{stat.value}</h3>
                <p className="text-gray-500 text-sm mt-1">{stat.description}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}