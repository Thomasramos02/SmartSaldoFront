import React from 'react';
    import { Link } from 'react-router-dom';
    import { type LucideIcon, Check } from 'lucide-react';
    import { motion } from 'framer-motion';

    interface PricingCardProps {
      title: string;
      description: string;
      price: string;
      period: string;
      icon: LucideIcon;
      features: string[];
      cta: string;
      href?: string; // Made optional
      onCtaClick?: () => void; // Added optional click handler
      highlight?: boolean;
      badge?: string;
      delay?: number;
    }

    const PricingCard: React.FC<PricingCardProps> = ({
      title,
      description,
      price,
      period,
      icon: Icon,
      features,
      cta,
      href,
      onCtaClick, // Destructure new prop
      highlight = false,
      badge,
      delay = 0
    }) => {
      const ctaClasses = `block w-full text-center px-6 py-4 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        highlight
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 focus:ring-emerald-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
          : 'bg-white text-emerald-600 border-2 border-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500'
      }`;

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay }}
          className={`relative rounded-2xl p-8 ${
            highlight
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-xl scale-105'
              : 'bg-white border border-slate-200 shadow-sm hover:shadow-lg'
          } transition-all duration-300`}
        >
          {badge && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                {badge}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className={`${highlight ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-slate-100'} w-14 h-14 rounded-xl flex items-center justify-center`}>
              <Icon className={`h-7 w-7 ${highlight ? 'text-white' : 'text-slate-600'}`} />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-600 mb-6">{description}</p>

          <div className="mb-8">
            <span className="text-4xl font-bold text-slate-800">{price}</span>
            <span className="text-lg text-slate-600">{period}</span>
          </div>

          <ul className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="bg-emerald-100 rounded-full p-1 mt-0.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-slate-600">{feature}</span>
              </li>
            ))}
          </ul>

          {onCtaClick ? (
            <button onClick={onCtaClick} className={ctaClasses}>
              {cta}
            </button>
          ) : (
            <Link to={href!} className={ctaClasses}>
              {cta}
            </Link>
          )}
        </motion.div>
      );
    };

    export default PricingCard;