import React, { useState } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, ArrowUp, PieChart, RefreshCw } from 'lucide-react';
import RevenueChart from './RevenueChart';
import OrdersChart from './OrdersChart';
import TopItemsChart from './TopItemsChart';

export default function Analytics({ orders, foodItems, totalRevenue, refreshData, loading, detailed = false }) {
  const [timeRange, setTimeRange] = useState("7d");

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const pendingOrders = orders.filter((o) => o.status !== "completed").length;

  const getAnalyticsData = () => {
    // Your existing analytics logic here
    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      growth: { revenue: 12.5, orders: 8.3, customers: 5.7 }
    };
  };

  const analyticsData = getAnalyticsData();

  if (!detailed) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            growth={analyticsData.growth.revenue}
            icon={DollarSign}
            color="red"
          />
          <StatCard
            title="Total Orders"
            value={totalOrders.toString()}
            growth={analyticsData.growth.orders}
            icon={ShoppingBag}
            color="blue"
          />
          <StatCard
            title="Pending Orders"
            value={pendingOrders.toString()}
            subtitle={`${completedOrders} completed`}
            icon={Users}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders orders={orders} refreshData={refreshData} />
          <QuickStats 
            orders={orders} 
            foodItems={foodItems} 
            totalRevenue={totalRevenue}  
          /> 
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your restaurant performance</p>
        </div>
        <div className="flex gap-2 bg-white border border-gray-200 rounded-xl p-1">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === range
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${analyticsData.totalRevenue.toLocaleString()}`}
          growth={analyticsData.growth.revenue}
          icon={DollarSign}
          color="red"
          gradient
        />
        <StatCard
          title="Total Orders"
          value={analyticsData.totalOrders.toString()}
          growth={analyticsData.growth.orders}
          icon={ShoppingBag}
          color="blue"
          gradient
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${(analyticsData.totalRevenue / analyticsData.totalOrders || 0).toFixed(2)}`}
          growth={4.2}
          icon={TrendingUp}
          color="green"
          gradient
        />
        <StatCard
          title="Categories"
          value={new Set(foodItems.map(item => item.category)).size.toString()}
          icon={PieChart}
          color="purple"
          gradient
          subtitle="Active categories"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart orders={orders} timeRange={timeRange} />
        <OrdersChart orders={orders} timeRange={timeRange} />
      </div>

      <TopItemsChart orders={orders} foodItems={foodItems} />
    </div>
  );
}

function StatCard({ title, value, growth, icon: Icon, color, gradient, subtitle }) {
  const colorClasses = {
    red: 'from-red-50 to-red-100 border-red-200 text-red-600',
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
    green: 'from-green-50 to-green-100 border-green-200 text-green-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600'
  };

  const bgClass = gradient 
    ? `bg-gradient-to-br ${colorClasses[color]}`
    : 'bg-white border border-gray-200';

  return (
    <div className={`${bgClass} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm font-medium ${gradient ? 'text-gray-700' : 'text-gray-600'}`}>{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && <p className="text-gray-600 text-sm mt-2">{subtitle}</p>}
        </div>
        <div className={`p-2 ${gradient ? 'bg-white' : 'bg-gray-50'} rounded-lg shadow-sm`}>
          <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[0]}`} />
        </div>
      </div>
      {growth && (
        <div className="flex items-center gap-1 mt-3">
          <ArrowUp className="w-4 h-4 text-green-500" />
          <span className="text-green-500 text-sm font-medium">+{growth}%</span>
          <span className="text-gray-500 text-sm ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
}

function RecentOrders({ orders, refreshData }) {
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
        <button onClick={refreshData} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      <div className="space-y-3">
        {orders.slice(0, 5).map((order) => (
          <div key={order._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Order #{order.orderNumber || order._id?.slice(-8)}</p>
              <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              order.status === 'completed' ? 'bg-green-100 text-green-800' :
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {order.status || 'pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickStats({ orders, foodItems, totalRevenue }) {
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Average Order Value</span>
          <span className="font-bold text-gray-900">₹{(totalRevenue / orders.length || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Completion Rate</span>
          <span className="font-bold text-gray-900">{((completedOrders / orders.length) * 100 || 0).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Active Menu Items</span>
          <span className="font-bold text-gray-900">{foodItems.filter(item => item.isAvailable).length}</span>
        </div>
      </div>
    </div>
  );
}