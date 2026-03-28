import React, { useState, useEffect } from 'react';
import { Download, Filter, DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';

export default function Reports({ orders, foodItems, loading }) {
  const [reportTimeRange, setReportTimeRange] = useState("month");
  const [reportsData, setReportsData] = useState(null);

  useEffect(() => {
    const loadReportsData = async () => {
      if (orders.length === 0) return;

      try {
        const completedOrders = orders.filter(order => order.status === 'completed');
        
        // Sales performance by time periods
        const salesByPeriod = calculateSalesByPeriod(orders, reportTimeRange);
        
        // Customer analytics
        const customerData = analyzeCustomers(orders);
        
        // Inventory performance
        const inventoryPerformance = analyzeInventoryPerformance(orders, foodItems);
        
        // Financial summary
        const financialSummary = {
          totalRevenue: completedOrders.reduce((sum, order) => sum + (order.total || 0), 0),
          totalOrders: completedOrders.length,
          averageOrderValue: completedOrders.length > 0 
            ? completedOrders.reduce((sum, order) => sum + (order.total || 0), 0) / completedOrders.length 
            : 0,
          taxAmount: completedOrders.reduce((sum, order) => sum + (order.tax || 0), 0),
          discountAmount: completedOrders.reduce((sum, order) => sum + (order.discount || 0), 0),
          netRevenue: completedOrders.reduce((sum, order) => sum + (order.total || 0), 0) 
            - completedOrders.reduce((sum, order) => sum + (order.discount || 0), 0)
        };
        

        // Top performing items
        const topPerformingItems = getTopPerformingItems(orders);

        const reports = {
          salesByPeriod,
          customerData,
          inventoryPerformance,
          financialSummary,
          topPerformingItems,
          timeRange: reportTimeRange,
          generatedAt: new Date().toISOString()
        };

        setReportsData(reports);
      } catch (error) {
        console.error('Error generating reports:', error);
      }
    };

    loadReportsData();
  }, [orders, foodItems, reportTimeRange]);

  const calculateSalesByPeriod = (orders, period) => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    const sales = {};
    
    completedOrders.forEach(order => {
      const orderDate = new Date(order.createdAt || order.timestamp);
      let key;
      
      if (period === 'day') {
        key = orderDate.toLocaleDateString();
      } else if (period === 'week') {
        const weekStart = new Date(orderDate);
        weekStart.setDate(orderDate.getDate() - orderDate.getDay());
        key = `Week of ${weekStart.toLocaleDateString()}`;
      } else if (period === 'month') {
        key = orderDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      
      if (!sales[key]) {
        sales[key] = { revenue: 0, orders: 0, items: 0 };
      }
      
      sales[key].revenue += order.total || 0;
      sales[key].orders += 1;
      sales[key].items += order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
    });
    
    return sales;
  };

  const analyzeCustomers = (orders) => {
    const customerOrders = {};
    const completedOrders = orders.filter(order => order.status === 'completed');
    
    completedOrders.forEach(order => {
      const customerId = order.customerId || order.customerName || 'Anonymous';
      if (!customerOrders[customerId]) {
        customerOrders[customerId] = {
          totalOrders: 0,
          totalSpent: 0,
          firstOrder: order.createdAt || order.timestamp,
          lastOrder: order.createdAt || order.timestamp
        };
      }
      
      customerOrders[customerId].totalOrders += 1;
      customerOrders[customerId].totalSpent += order.total || 0;
      customerOrders[customerId].lastOrder = order.createdAt || order.timestamp;
    });
    
    const sortedCustomers = Object.entries(customerOrders)
      .sort(([,a], [,b]) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
    
    return {
      totalCustomers: Object.keys(customerOrders).length,
      repeatCustomers: Object.values(customerOrders).filter(c => c.totalOrders > 1).length,
      topCustomers: sortedCustomers,
      averageOrdersPerCustomer: completedOrders.length / Math.max(Object.keys(customerOrders).length, 1)
    };
  };

  const analyzeInventoryPerformance = (orders, foodItems) => {
    const itemPerformance = {};
    const completedOrders = orders.filter(order => order.status === 'completed');
    
    completedOrders.forEach(order => {
      order.items?.forEach(item => {
        const itemId = item.foodItem?._id || item.name;
        if (!itemPerformance[itemId]) {
          itemPerformance[itemId] = {
            name: item.name || item.foodItem?.name,
            sold: 0,
            revenue: 0,
            orders: 0
          };
        }
        
        itemPerformance[itemId].sold += item.quantity || 1;
        itemPerformance[itemId].revenue += (item.price || 0) * (item.quantity || 1);
        itemPerformance[itemId].orders += 1;
      });
    });
    
    const lowPerformance = foodItems
      .filter(item => !itemPerformance[item._id] || itemPerformance[item._id].sold === 0)
      .map(item => ({
        name: item.name,
        category: item.category,
        price: item.price,
        status: item.isAvailable ? 'Available' : 'Unavailable'
      }));
    
    return {
      itemPerformance,
      lowPerformance,
      totalItemsSold: Object.values(itemPerformance).reduce((sum, item) => sum + item.sold, 0),
      inventoryTurnover: Object.values(itemPerformance).length / Math.max(foodItems.length, 1)
    };
  };

  const getTopPerformingItems = (orders) => {
    const itemSales = {};
    const completedOrders = orders.filter(order => order.status === 'completed');
    
    completedOrders.forEach(order => {
      order.items?.forEach(item => {
        const itemId = item.foodItem?._id || item._id || item.name;
        const itemName = item.name || item.foodItem?.name || 'Unknown Item';
        const itemCategory = item.category || item.foodItem?.category || 'Uncategorized';
        const itemRevenue = (item.price || 0) * (item.quantity || 1);
        
        if (!itemSales[itemId]) {
          itemSales[itemId] = {
            _id: itemId,
            name: itemName,
            category: itemCategory,
            image: item.image || item.foodItem?.image,
            sales: 0,
            orders: 0,
            quantity: 0
          };
        }
        itemSales[itemId].sales += itemRevenue;
        itemSales[itemId].orders += 1;
        itemSales[itemId].quantity += (item.quantity || 1);
      });
    });

    return Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  };

  const exportReports = () => {
    if (!reportsData) return;
    
    const report = {
      ...reportsData,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `restaurant-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading reports...</p>
      </div>
    );
  }

  if (!reportsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No report data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Comprehensive Reports</h2>
          <p className="text-gray-600">Detailed analytics and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={reportTimeRange}
            onChange={(e) => setReportTimeRange(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          <button
            onClick={exportReports}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                ₹{reportsData.financialSummary.totalRevenue.toLocaleString()}
              </h3>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Net Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                ₹{reportsData.financialSummary.netRevenue.toLocaleString()}
              </h3>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Order Value</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                ₹{reportsData.financialSummary.averageOrderValue.toFixed(2)}
              </h3>
            </div>
            <ShoppingBag className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Discounts</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                ₹{reportsData.financialSummary.discountAmount.toLocaleString()}
              </h3>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Sales Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Performance</h3>
          <div className="space-y-3">
            {Object.entries(reportsData.salesByPeriod).map(([period, data]) => (
              <div key={period} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                <span className="font-medium text-gray-700">{period}</span>
                <div className="text-right">
                  <div className="font-bold text-gray-900">₹{data.revenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{data.orders} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Customers</span>
              <span className="font-bold">{reportsData.customerData.totalCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span>Repeat Customers</span>
              <span className="font-bold">{reportsData.customerData.repeatCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Orders per Customer</span>
              <span className="font-bold">{reportsData.customerData.averageOrdersPerCustomer.toFixed(1)}</span>
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Top Customers:</h4>
              {reportsData.customerData.topCustomers.slice(0, 3).map(([customer, data], index) => (
                <div key={customer} className="flex justify-between text-sm">
                  <span>{customer}</span>
                  <span>₹{data.totalSpent.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Performance */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Items Sold</p>
            <p className="text-2xl font-bold text-blue-600">{reportsData.inventoryPerformance.totalItemsSold}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Active Items</p>
            <p className="text-2xl font-bold text-green-600">
              {Object.keys(reportsData.inventoryPerformance.itemPerformance).length}
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Turnover Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {(reportsData.inventoryPerformance.inventoryTurnover * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Low Performance Items */}
        {reportsData.inventoryPerformance.lowPerformance.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Low Performance Items</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportsData.inventoryPerformance.lowPerformance.slice(0, 6).map((item, index) => (
                <div key={index} className="p-3 border border-red-100 bg-red-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.status === 'Available' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{item.category} • ₹{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Performing Items */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-700">Item</th>
                <th className="text-right py-3 font-medium text-gray-700">Quantity Sold</th>
                <th className="text-right py-3 font-medium text-gray-700">Revenue</th>
                <th className="text-right py-3 font-medium text-gray-700">Orders</th>
                <th className="text-right py-3 font-medium text-gray-700">Avg per Order</th>
              </tr>
            </thead>
            <tbody>
              {reportsData.topPerformingItems.map((item, index) => (
                <tr key={item._id || item.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </div>
                  </td>
                  <td className="text-right py-3 font-medium">{item.quantity}</td>
                  <td className="text-right py-3 font-medium text-green-600">
                    ₹{Math.round(item.sales).toLocaleString()}
                  </td>
                  <td className="text-right py-3">{item.orders}</td>
                  <td className="text-right py-3">
                    ₹{item.orders > 0 ? Math.round(item.sales / item.orders) : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}