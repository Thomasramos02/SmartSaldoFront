// smartSaldo-frontend/src/pages/Payment.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import stripeService from "../services/stripeService";
import { toast } from "react-hot-toast";

export default function Payment() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const billingCycle = searchParams.get("billingCycle") || "monthly";
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    console.log("🔍 Payment page - Status:", {
      isLoading,
      isAuthenticated,
      hasRedirected,
      billingCycle,
    });

    // Aguarda o carregamento terminar
    if (isLoading) {
      console.log("⏳ Ainda verificando autenticação...");
      return;
    }

    // Se não está autenticado, redireciona para login
    if (!isAuthenticated && !hasRedirected) {
      console.log("❌ Usuário NÃO autenticado, redirecionando para login...");
      setHasRedirected(true);
      const redirectUrl = `/login?redirect=${encodeURIComponent(`/payment?billingCycle=${billingCycle}`)}`;
      console.log("🔄 Redirect URL:", redirectUrl);
      navigate(redirectUrl, { replace: true });
      return;
    }

    // Se está autenticado, procede com o checkout
    if (isAuthenticated && !hasRedirected) {
      console.log("✅ Usuário autenticado, iniciando checkout...");
      setHasRedirected(true);
      toast.loading("Redirecionando para o pagamento...");

      // Pequeno delay para garantir que o estado está atualizado
      setTimeout(() => {
        stripeService.handlePremiumCheckout(
          billingCycle === "monthly" ? "monthly" : "yearly",
        );
      }, 100);
    }
  }, [isAuthenticated, isLoading, navigate, billingCycle, hasRedirected]);

  // Tela de loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, não mostra nada (vai redirecionar)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-lg text-gray-700">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  // Se está autenticado, mostra tela de processamento
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">
          Aguarde, redirecionando para o pagamento...
        </p>
      </div>
    </div>
  );
}
