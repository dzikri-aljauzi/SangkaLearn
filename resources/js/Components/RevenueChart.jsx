import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function RevenueChart({ data = [], type = 'bar', className = '' }) {
  // Sample revenue data if none provided
  const revenueData = data.length > 0 ? data : [
    { month: 'Jan', revenue: 2400000, students: 45 },
    { month: 'Feb', revenue: 3200000, students: 62 },
    { month: 'Mar', revenue: 2800000, students: 55 },
    { month: 'Apr', revenue: 4100000, students: 78 },
    { month: 'May', revenue: 3600000, students: 68 },
    { month: 'Jun', revenue: 4800000, students: 85 },
  ];

  const coursePerformanceData = [
    { name: 'React Fundamentals', value: 35, color: '#2A7C82' },
    { name: 'JavaScript Mastery', value: 28, color: '#4F9A9F' },
    { name: 'Node.js Backend', value: 20, color: '#10b981' },
    { name: 'Python Basics', value: 17, color: '#85BABD' },
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
              {entry.name}: {entry.name === 'revenue' ? formatCurrency(entry.value) : `${entry.value} students`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'pie') {
    return (
      <motion.div 
        className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
        <div className="flex items-center">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={coursePerformanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {coursePerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Enrollment Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 pl-6">
            <div className="space-y-3">
              {coursePerformanceData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-700 truncate">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F1" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B716E' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B716E' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="revenue"
            name="Revenue"
            radius={[4, 4, 0, 0]}
            fill="url(#colorRevenue)"
          />
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2A7C82" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#4F9A9F" stopOpacity={0.9}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}