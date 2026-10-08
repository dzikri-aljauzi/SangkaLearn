import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils.js';

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'positive',
  className = '',
  gradient = 'bg-petrol-600',
  delay = 0,
  href = null
}) {
  const changeColor = changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-blue-600';
  const changeIcon = changeType === 'positive' ? '↗' : changeType === 'negative' ? '↘' : '→';

  const cardContent = (
    <div className="flex items-center justify-between h-full">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <motion.p
          className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
        >
          {value}
        </motion.p>
        {change && (
          <div className={`flex items-center text-sm ${changeColor}`}>
            <span className="mr-1 text-lg">{changeIcon}</span>
            <span className="font-medium">{change}</span>
          </div>
        )}
      </div>

      <div className={`p-4 ${gradient} rounded-xl flex-shrink-0`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  );

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
    className: cn(
      "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 h-full",
      href && "cursor-pointer hover:border-blue-300",
      className
    )
  };

  if (href) {
    return (
      <Link href={href} className="block h-full">
        <motion.div {...motionProps}>
          {cardContent}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div {...motionProps}>
      {cardContent}
    </motion.div>
  );
}