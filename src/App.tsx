import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Layout } from "./pages/Layout";
import Home from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Gastos } from "./pages/Gastos";
import Categorias from "./pages/Categorias";
import { Metas } from "./pages/Metas";
import { Alertas } from "./pages/Alertas";
import { SugestoesIA } from "./pages/SugestoesIA";
import { Configuracoes } from "./pages/Configuracoes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { AlertsProvider, useAlerts } from "./contexts/AlertsContext";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute
import { useAuth } from "./contexts/AuthContext"; // Import useAuth

// Wrapper component to connect context to the Layout's props
function ProtectedLayout() {
  const { unreadCount, markAllAsRead } = useAlerts();
  return <Layout unreadNotifications={unreadCount} onReadAll={markAllAsRead} />;
}

// Wrapper component to connect context to the Alertas page's props
function ProtectedAlertas() {
  const { unreadCount, markAllAsRead } = useAlerts();
  return <Alertas unreadCount={unreadCount} onReadAll={markAllAsRead} />;
}

export default function App() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando aplicação...</div>;
  }

  return (
    <AlertsProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* 🔓 Rotas públicas */}
          <Route path="/" element={<Home />} />


          <Route
            path="/login"
            element={
              <Login />
            }
          />

          <Route
            path="/register"
            element={
              <Register />
            }
          />

          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* 🔐 Rotas privadas */}
          <Route
            element={
              <PrivateRoute>
                <ProtectedLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/alertas" element={<ProtectedAlertas />} />
            <Route path="/sugestoes" element={<SugestoesIA />} />
            <Route path="/configuracoes" element={<Configuracoes />} />

            {/* 💳 Stripe precisa de login */}
          </Route>

          {/* 🧯 Fallback */}
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? "/dashboard" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </AnimatePresence>
    </AlertsProvider>
  );
}
