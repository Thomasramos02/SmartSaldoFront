import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  CreditCard,
  FolderOpen,
  Target,
  AlertCircle,
  Sparkles,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Logo from '../assets/Logo.png';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'gastos', label: 'Gastos', icon: CreditCard, path: '/dashboard/gastos' },
  { id: 'categorias', label: 'Categorias', icon: FolderOpen, path: '/dashboard/categorias' },
  { id: 'metas', label: 'Metas', icon: Target, path: '/dashboard/metas' },
  { id: 'alertas', label: 'Alertas', icon: AlertCircle, path: '/dashboard/alertas', badge: 2 },
  { id: 'sugestoes', label: 'Sugestões IA', icon: Sparkles, path: '/dashboard/sugestoes' },
];

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const renderMenuItems = () =>
    menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path;
      return (
        <motion.button
          key={item.id}
          whileHover={{ x: 4 }}
          onClick={() => handleNavigate(item.path)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium group relative ${
            isActive
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100/80 hover:text-emerald-600'
          }`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {item.badge}
            </span>
          )}
        </motion.button>
      );
    });

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={Logo} alt="SmartSaldo Logo" className="h-8 w-auto" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900">FinanceAI</span>
            <span className="text-xs text-slate-500">Pro</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-3">Menu Principal</p>
          {renderMenuItems()}
        </div>
      </nav>

      {/* Settings */}
      <div className="px-4 py-4 border-t border-slate-100">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={() => handleNavigate('/dashboard/configuracoes')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
            location.pathname === '/dashboard/configuracoes'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100/80 hover:text-emerald-600'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Configurações</span>
        </motion.button>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-slate-100 relative">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-slate-50 transition-colors group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-slate-900 truncate">João da Silva</div>
            <div className="text-xs text-slate-500 truncate">Pro • jan@financea.i</div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${isProfileOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-slate-200 rounded-lg shadow-xl"
            >
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/dashboard/configuracoes');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100"
              >
                <Settings className="w-4 h-4" />
                <span>Perfil</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
