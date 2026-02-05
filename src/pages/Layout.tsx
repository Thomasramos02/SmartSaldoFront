import {
  Bell,
  CreditCard,
  FolderOpen,
  Target,
  AlertCircle,
  Sparkles,
  Settings,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Toaster } from "../components/sonner";
import userService from "../services/userService";
import Logo from "../assets/Logo.png";
import stripeService from "../services/stripeService";

interface LayoutProps {
  unreadNotifications: number;
  onReadAll?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  { id: "gastos", label: "Gastos", icon: CreditCard, path: "/gastos" },
  {
    id: "categorias",
    label: "Categorias",
    icon: FolderOpen,
    path: "/categorias",
  },
  { id: "metas", label: "Metas", icon: Target, path: "/metas" },
  { id: "alertas", label: "Alertas", icon: AlertCircle, path: "/alertas" },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    path: "/configuracoes",
  },
];

const pageLabels: Record<string, string> = {
  dashboard: "Dashboard",
  gastos: "Gastos",
  categorias: "Categorias",
  metas: "Metas",
  alertas: "Alertas",
  configuracoes: "Configurações",
};

export function Layout({ unreadNotifications, onReadAll }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; plan: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = location.pathname.split("/")[1] || "dashboard";
  const isPremium = (user?.plan || "").toLowerCase().trim() === "premium";

  const getPageTitle = () => {
    return pageLabels[currentPage] || "Dashboard";
  };

  const handleMarkAllAsRead = () => {
    if (onReadAll) {
      onReadAll();
      navigate("/alertas");
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await userService.getProfile();
        setUser({
          name: profile.name || "Usuário",
          plan: profile.plan || "Free",
        });
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-stone-200">
                  <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 no-underline">
                    <div className="w-40 h-14 bg-gradient-to-br flex items-center justify-center shadow-sm">
                      <img
                        src={Logo}
                        alt="SmartSaldo Logo"
                        className="w-40 h-18 object-contain"
                      />
                    </div>
                  </div>          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all no-underline font-medium ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.id === "alertas" && unreadNotifications > 0 && (
                    <span
                      className={`ml-auto text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${
                        isActive
                          ? "bg-white text-emerald-600"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {!isPremium && (
            <div className="px-4 pb-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-xs font-semibold uppercase text-emerald-700">
                  Upgrade Premium
                </div>
                <div className="text-sm text-slate-700 mt-1">
                  Relatórios, projeções e importação automática.
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    onClick={() =>
                      stripeService.handlePremiumCheckout("monthly")
                    }
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Assinar Mensal
                  </button>
                  <button
                    onClick={() =>
                      stripeService.handlePremiumCheckout("yearly")
                    }
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    Assinar Anual (20% off)
                  </button>
                </div>
              </div>
            </div>
          )}

          {unreadNotifications > 0 && onReadAll && (
            <div className="px-4 py-3">
              <button
                onClick={handleMarkAllAsRead}
                className="w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Marcar todas como lidas
              </button>
            </div>
          )}

          <div className="p-4 border-t border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                {user ? getInitials(user.name) : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-800 truncate">
                  {user?.name || "Carregando..."}
                </div>
                <div className="text-xs text-emerald-600 font-medium">
                  {user?.plan || "Free"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-stone-200 z-50">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 px-6 border-b border-stone-200">
                <div
                  className="flex items-center gap-2 no-underline"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-800 font-semibold">
                    SmartSaldo
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline font-medium ${
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "text-slate-600 hover:bg-emerald-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user ? getInitials(user.name) : "?"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800">
                      {user?.name || "Carregando..."}
                    </div>
                    <div className="text-xs text-emerald-600">
                      {user?.plan || "Free"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-emerald-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="hover:text-emerald-600 cursor-pointer transition-colors">
                  SmartSaldo
                </span>
                <ChevronRight className="w-4 h-4 text-stone-300" />
                <span className="text-emerald-700 font-bold">
                  {getPageTitle()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/alertas"
                className="relative text-slate-400 hover:text-emerald-600 transition-colors no-underline"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white">
                    {unreadNotifications}
                  </span>
                )}
              </Link>

              <div className="h-8 w-[1px] bg-stone-200 mx-1 hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-right hidden sm:block">
                  <div className="font-bold text-slate-800 leading-none">
                    {user?.name || "Carregando..."}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1">
                    {user?.plan || "Free"}
                  </div>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-emerald-50">
                  {user ? getInitials(user.name) : "?"}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
}

export default Layout;
