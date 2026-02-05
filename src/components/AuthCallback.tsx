import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth, isAuthenticated, user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (msg: string) => {
    console.log(msg);
    setDebugInfo((prev) => [...prev, msg]);
  };

  useEffect(() => {
    async function finalizeLogin() {
      try {
        addDebug("🔄 Iniciando callback do Google...");

        // Aguarda 1 segundo para garantir que os cookies foram definidos
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addDebug("⏱️ Aguardou 1 segundo");

        // Verifica se há cookies
        addDebug(`🍪 Cookies: ${document.cookie || "NENHUM COOKIE!"}`);

        // Força o AuthContext a buscar /auth/me
        addDebug("📡 Chamando checkAuth...");
        await checkAuth();

        addDebug(
          `✅ checkAuth concluído! isAuthenticated: ${isAuthenticated}, user: ${user?.email || "null"}`,
        );

        // Pega o redirect da query string ou usa /dashboard como padrão
        const redirectParam = searchParams.get("redirect");
        const redirect = redirectParam
          ? decodeURIComponent(redirectParam)
          : "/dashboard";

        addDebug(`📍 Redirecionando para: ${redirect}`);

        // Aguarda mais um pouco antes de redirecionar
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Redireciona para o destino
        navigate(redirect, { replace: true });
      } catch (e: any) {
        addDebug(`❌ Erro: ${e?.message || "Erro desconhecido"}`);
        console.error("Erro no callback do Google:", e);

        // Aguarda 5 segundos para você ver o erro
        await new Promise((resolve) => setTimeout(resolve, 5000));
        navigate("/login", { replace: true });
      }
    }

    finalizeLogin();
  }, [checkAuth, navigate, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700 font-semibold mb-2">
          Finalizando login com Google...
        </p>
        <p className="text-sm text-gray-500 mb-4">Aguarde um momento</p>

        {/* Debug info visível */}
        <div className="mt-6 text-left bg-gray-50 p-4 rounded text-xs max-h-96 overflow-y-auto">
          <p className="font-semibold mb-2">Debug:</p>
          {debugInfo.map((info, i) => (
            <p key={i} className="text-gray-600 mb-1 break-words">
              {info}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
