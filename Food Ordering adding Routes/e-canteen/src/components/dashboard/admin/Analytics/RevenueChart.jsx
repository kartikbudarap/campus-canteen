import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ orders, timeRange }) {
  const generateTimeSeriesData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString() && order.status === 'completed';
      });

      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      data.push({
        date: dateStr,
        revenue: dayRevenue,
        fullDate: date
      });
    }
    return data;
  };

  const data = generateTimeSeriesData();

  if (!data.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center text-gray-500">
        No revenue data available
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-gray-900 text-lg mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value}`} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}