import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();

  useEffect(() => {
    async function finalizeLogin() {
      try {
        console.log("🔄 Processando callback do Google...");

        // Aguarda 500ms para garantir que os cookies foram definidos
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Força o AuthContext a buscar /auth/me
        await checkAuth();

        console.log("✅ Login com Google bem-sucedido!");

        // Pega o redirect da query string ou usa /dashboard como padrão
        const redirectParam = searchParams.get("redirect");
        const redirect = redirectParam
          ? decodeURIComponent(redirectParam)
          : "/dashboard";

        console.log("📍 Redirecionando para:", redirect);

        // Redireciona para o destino
        navigate(redirect, { replace: true });
      } catch (e) {
        console.error("❌ Erro no callback do Google:", e);
        navigate("/login", { replace: true });
      }
    }

    finalizeLogin();
  }, [checkAuth, navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">Finalizando login com Google...</p>
        <p className="text-sm text-gray-500 mt-2">Aguarde um momento</p>
      </div>
    </div>
  );
}
