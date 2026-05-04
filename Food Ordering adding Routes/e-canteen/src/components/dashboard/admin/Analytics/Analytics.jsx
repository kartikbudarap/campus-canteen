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
    red: 'from-brand-50 to-brand-100 border-brand-200 text-brand-600 icon-text-brand',
    blue: 'from-sky-50 to-sky-100 border-sky-200 text-sky-600 icon-text-sky',
    green: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-600 icon-text-emerald',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600 icon-text-purple'
  };

  const iconColors = {
    red: 'text-brand-500',
    blue: 'text-sky-500',
    green: 'text-emerald-500',
    purple: 'text-purple-500'
  };

  const bgClass = gradient 
    ? `bg-gradient-to-br ${colorClasses[color]}`
    : 'bg-white border border-surface-200';

  return (
    <div className={`${bgClass} rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm font-semibold ${gradient ? 'text-surface-700' : 'text-surface-500'}`}>{title}</p>
          <h3 className="text-3xl font-extrabold text-surface-900 mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-surface-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 ${gradient ? 'bg-white/80 backdrop-blur-sm' : 'bg-surface-50'} rounded-xl shadow-sm border border-white/50`}>
          <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        </div>
      </div>
      {growth && (
        <div className="flex items-center gap-1.5 mt-4 bg-white/50 w-fit px-2 py-1 rounded-lg">
          <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-600 text-xs font-bold">+{growth}%</span>
          <span className="text-surface-500 text-xs font-medium ml-1">vs last period</span>
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