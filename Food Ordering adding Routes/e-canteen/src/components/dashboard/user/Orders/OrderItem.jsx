import React from 'react';
import { Clock } from 'lucide-react';

export default function OrderItem({ order }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "ready": return "bg-blue-100 text-blue-800 border-blue-200";
      case "preparing": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed": return "Delivered";
      case "ready": return "Ready for Pickup";
      case "preparing": return "Being Prepared";
      default: return "Order Placed";
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
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
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
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
            {getStatusText(order.status)}
          </span>
        </div>
      </div>
    </div>
  );
}