import { Menu, Bell, ChevronRight, Search, Settings, User, LogOut, AlertCircle, Target, CreditCard, AlertTriangle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAlerts } from '../contexts/AlertsContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

const pageLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/gastos': 'Gastos',
  '/dashboard/categorias': 'Categorias',
  '/dashboard/metas': 'Metas',
  '/dashboard/alertas': 'Alertas',
  '/dashboard/sugestoes': 'Sugestões IA',
  '/dashboard/configuracoes': 'Configurações',
};

const AlertIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'GOAL_EXCEED':
      return <Target className="w-5 h-5 text-blue-500" />;
    case 'EXCESSED_SPENDING':
      return <CreditCard className="w-5 h-5 text-red-500" />;
    case 'PATTERN_DETECTED':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-slate-500" />;
  }
};

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const { alerts, unreadCount, handleAlertClick } = useAlerts();
  
  const alertsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumb = () => {
    const pathParts = currentPath.split('/').filter(p => p);
    if (pathParts.length <= 1) {
        return <span className="font-semibold text-slate-800">{pageLabels[currentPath] || 'Dashboard'}</span>;
    }
    return (
        <>
            <span className="text-slate-500">Dashboard</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-800">{pageLabels[currentPath] || 'Página'}</span>
        </>
    )
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile menu + Breadcrumb */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-slate-600 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            {getBreadcrumb()}
          </div>
        </div>

        {/* Right: Search, Notifications, User */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Mobile Search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={alertsRef}>
            <button 
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <AnimatePresence>
              {isAlertsOpen && (
                 <motion.div
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-xl"
               >
                 <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                   <p className="text-sm font-semibold text-slate-900">Notificações</p>
                   {unreadCount > 0 && <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full">{unreadCount} novas</span>}
                 </div>
                 <div className="max-h-96 overflow-y-auto">
                    {alerts.length > 0 ? (
                        alerts.map(alert => (
                            <button
                                key={alert.id}
                                onClick={() => {
                                  handleAlertClick(alert);
                                  setIsAlertsOpen(false);
                                }}
                                className={`w-full flex items-start gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors ${!alert.isRead ? 'bg-emerald-50/50 hover:bg-slate-50' : 'hover:bg-slate-50'}`}
                            >
                                <div className="mt-0.5">
                                    <AlertIcon type={alert.type} />
                                </div>
                                <div className='flex-1'>
                                    <p className="text-slate-800">{alert.message}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: ptBR })}
                                    </p>
                                </div>
                                {!alert.isRead && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 ml-auto"></div>}
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-sm text-slate-500">
                            Nenhuma notificação por enquanto.
                        </div>
                    )}
                 </div>
                 <button
                   onClick={() => {
                     setIsAlertsOpen(false);
                     navigate('/dashboard/alertas');
                   }}
                   className="w-full text-center px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors border-t border-slate-100"
                 >
                   Ver todos os alertas
                 </button>
               </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                JD
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 w-20 truncate">João</span>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl"
                >
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">João da Silva</p>
                    <p className="text-xs text-slate-500">jan@financea.i</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/dashboard/configuracoes');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    <User className="w-4 h-4" />
                    <span>Perfil</span>
                  </button>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                autoFocus
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
