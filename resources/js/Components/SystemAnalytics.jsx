import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

export default function SystemAnalytics({ data = [], type = 'users', className = '' }) {
  // Sample system analytics data
  const userGrowthData = [
    { month: 'Jan', users: 1200, newUsers: 180, activeUsers: 980 },
    { month: 'Feb', users: 1450, newUsers: 250, activeUsers: 1200 },
    { month: 'Mar', users: 1680, newUsers: 230, activeUsers: 1350 },
    { month: 'Apr', users: 1920, newUsers: 240, activeUsers: 1580 },
    { month: 'May', users: 2150, newUsers: 230, activeUsers: 1750 },
    { month: 'Jun', users: 2380, newUsers: 230, activeUsers: 1950 },
  ];

  const coursePerformanceData = [
    { category: 'Programming', courses: 45, enrollments: 1250, completion: 78 },
    { category: 'Design', courses: 32, enrollments: 890, completion: 85 },
    { category: 'Business', courses: 28, enrollments: 670, completion: 72 },
    { category: 'Marketing', courses: 24, enrollments: 580, completion: 68 },
    { category: 'Data Science', courses: 18, enrollments: 420, completion: 82 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000000, subscriptions: 1200, oneTime: 890 },
    { month: 'Feb', revenue: 52000000, subscriptions: 1450, oneTime: 1020 },
    { month: 'Mar', revenue: 48000000, subscriptions: 1680, oneTime: 950 },
    { month: 'Apr', revenue: 58000000, subscriptions: 1920, oneTime: 1150 },
    { month: 'May', revenue: 62000000, subscriptions: 2150, oneTime: 1280 },
    { month: 'Jun', revenue: 68000000, subscriptions: 2380, oneTime: 1420 },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('revenue') || entry.name.includes('Revenue') ? 
                formatCurrency(entry.value) : 
                entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'revenue') {
    return (
      <motion.div 
        className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (type === 'courses') {
    return (
      <motion.div 
        className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance by Category</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={coursePerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="category" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="enrollments"
              name="Enrollments"
              radius={[4, 4, 0, 0]}
              fill="url(#colorEnrollments)"
            />
            <defs>
              <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.9}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  // Default: User Growth Chart
  return (
    <motion.div 
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Analytics</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={userGrowthData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8 }}
            name="Total Users"
          />
          <Line
            type="monotone"
            dataKey="activeUsers"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8 }}
            name="Active Users"
          />
          <Line
            type="monotone"
            dataKey="newUsers"
            stroke="#eab308"
            strokeWidth={3}
            dot={{ fill: '#eab308', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8 }}
            name="New Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}