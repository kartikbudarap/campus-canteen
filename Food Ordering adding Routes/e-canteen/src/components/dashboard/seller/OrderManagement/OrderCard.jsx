import React from 'react';
import { CheckCircle, ChefHat, Package } from 'lucide-react';

export default function OrderCard({ order, updateOrderStatus, getOrderDetails }) {
  const orderDetails = getOrderDetails(order);
  
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

  const action = getStatusFlow(orderDetails.status);
  const Icon = action?.icon;

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 group">
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
}