import React from 'react';

export default function TopItemsChart({ orders, foodItems }) {
  const getTopItems = () => {
    const itemSales = {};
    const completedOrders = orders.filter(order => order.status === 'completed');
    
    completedOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const itemId = item.foodItem?._id || item._id || item.name;
          const itemName = item.name || item.foodItem?.name || 'Unknown Item';
          const itemCategory = item.category || item.foodItem?.category || 'Uncategorized';
          
          if (!itemSales[itemId]) {
            itemSales[itemId] = {
              _id: itemId,
              name: itemName,
              category: itemCategory,
              image: item.image || item.foodItem?.image,
              quantity: 0,
              orders: 0
            };
          }
          itemSales[itemId].quantity += (item.quantity || 1);
          itemSales[itemId].orders += 1;
        });
      }
    });

    return Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const topItems = getTopItems();

  if (topItems.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 text-lg mb-6">Top Performing Items</h3>
        <div className="text-center py-8 text-gray-500">
          No item sales data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-gray-900 text-lg mb-6">Top Performing Items</h3>
      
      <div className="space-y-3">
        {topItems.map((item, index) => (
          <div
            key={item._id || index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-lg font-bold text-sm">
                #{index + 1}
              </div>
              <div className="flex items-center gap-2">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.category}</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">{item.quantity} sold</div>
              <div className="text-xs text-gray-500">{item.orders} orders</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}