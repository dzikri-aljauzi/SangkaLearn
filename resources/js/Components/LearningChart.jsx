import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

export default function LearningChart({ data = [], chartData = {}, type = 'line', className = '' }) {
  // Use actual data from backend or fallback to sample data
  const processedChartData = useMemo(() => {
    if (data.length > 0) {
      // Transform backend data for chart display
      return data.map(item => ({
        day: item.dayName || item.day,
        hours: parseFloat(item.hours) || 0,
        courses: parseInt(item.courses) || 0,
        lessons: parseInt(item.lessons) || 0,
        progress: parseInt(item.progress) || 0,
        date: item.date
      }));
    }
    
    // Fallback sample data for the last 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => ({
      day,
      hours: Math.floor(Math.random() * 4) + 1,
      courses: Math.floor(Math.random() * 3),
      lessons: Math.floor(Math.random() * 6) + 2,
      progress: Math.floor(Math.random() * 20) + (index * 10)
    }));
  }, [data]);
  
  // Extract summary data
  const summary = chartData.summary || {
    totalHours: 0,
    totalLessons: 0,
    activeDays: 0,
    averageDailyHours: 0
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => {
            let unit = '';
            if (entry.name === 'Study Hours' || entry.name === 'hours') unit = 'h';
            else if (entry.name === 'Courses Accessed' || entry.name === 'courses') unit = ' courses';
            else if (entry.name === 'lessons') unit = ' lessons';
            else if (entry.name === 'Progress' || entry.name === 'progress') unit = '%';
            
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value}{unit}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (type === 'area') {
    return (
      <motion.div 
        className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
          <div className="text-sm text-gray-500">
            {summary.activeDays} active days • {summary.totalHours}h total
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={processedChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F1" />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B716E' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B716E' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2A7C82" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2A7C82" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="progress"
              stroke="#2A7C82"
              strokeWidth={3}
              fill="url(#colorProgress)"
              name="Progress"
            />
          </AreaChart>
        </ResponsiveContainer>
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Daily Learning Activity</h3>
        <div className="text-sm text-gray-500">
          Avg: {summary.averageDailyHours}h/day • {summary.totalLessons} lessons
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processedChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F1" />
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B716E' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B716E' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#2A7C82"
            strokeWidth={3}
            dot={{ fill: '#2A7C82', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8 }}
            name="Study Hours"
          />
          <Line
            type="monotone"
            dataKey="lessons"
            stroke="#4F9A9F"
            strokeWidth={3}
            dot={{ fill: '#4F9A9F', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8 }}
            name="Lessons Completed"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}