import React from 'react';
    import type { LucideIcon } from 'lucide-react';
    import { motion } from 'framer-motion';

    interface FeatureCardProps {
      icon: LucideIcon;
      title: string;
      description: string;
      gradient: string;
      delay?: number;
    }

    const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, gradient, delay = 0 }) => {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay }}
          className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-emerald-200"
        >
          <div className={`${gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
          <p className="text-slate-600 leading-relaxed">{description}</p>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </motion.div>
      );
    };

    export default FeatureCard;