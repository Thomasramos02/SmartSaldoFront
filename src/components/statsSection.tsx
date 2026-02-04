import React from "react";
import { motion } from "framer-motion";

const StatsSection = () => {
  const stats = [
    { number: "CSV", label: "Importação de extratos" },
    { number: "100%", label: "Controle do usuário sobre os dados" },
    { number: "PDF", label: "Relatórios personalizados" },
    { number: "Visual", label: "Gráficos claros e intuitivos" },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-emerald-100 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
