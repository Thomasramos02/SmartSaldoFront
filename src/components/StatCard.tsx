import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  bgGradient: string;
  borderColor: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  bgGradient,
  borderColor,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${bgGradient} ${borderColor} border rounded-xl p-6 hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-xs font-semibold opacity-75 uppercase tracking-wide">
          {title}
        </div>
        {icon && (
          <div className="opacity-60">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <div className="text-3xl font-bold mb-1">
          {value}
        </div>
        {subtitle && (
          <p className="text-sm opacity-75">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${
          trend.direction === 'up' ? 'text-emerald-700' : 'text-red-700'
        }`}>
          {trend.direction === 'up' ? '↑' : '↓'}
          <span>{trend.value}</span>
        </div>
      )}
    </motion.div>
  );
}
