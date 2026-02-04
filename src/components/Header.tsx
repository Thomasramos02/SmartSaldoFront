import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "../assets/Logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Início", href: "/home#inicio" },
    { name: "Recursos", href: "/home#recursos" },
    { name: "Preços", href: "/home#precos" },
    { name: "Sobre", href: "/home#sobre" },
  ];

  const isActive = (href: string) => {
    if (href.includes("#")) {
      return location.pathname === "/home";
    }
    return location.pathname === href;
  };

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-white/95 backdrop-blur-md border-b border-slate-200/70 shadow-sm sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Link to="/home" className="flex items-center space-x-2">
              <img
                src={Logo}
                alt="SmartSaldo Logo"
                className="w-48 md:w-56 h-auto object-contain"
              />
            </Link>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.2 }}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive(item.href)
                    ? "text-slate-700"
                    : "text-slate-700 hover:text-emerald-600"
                }`}
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
              >
                Entrar
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
              <Link
                to="/register"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm"
              >
                Começar Grátis
              </Link>
            </motion.div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ rotate: isMenuOpen ? 0 : 2 }}
            transition={{ duration: 0.15 }}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden py-4 border-t border-slate-200 overflow-hidden"
            >
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="text-sm font-semibold text-slate-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </motion.a>
                ))}
                <div className="flex flex-col space-y-2 pt-4 border-t border-slate-200">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors text-center shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Começar Grátis
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
