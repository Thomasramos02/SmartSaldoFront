import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (msg: string) => {
    console.log(msg);
    setDebugInfo((prev) => [...prev, msg]);
  };

  useEffect(() => {
    async function handleAuth() {
      try {
        addDebug("🔄 Iniciando callback...");

        const redirect = searchParams.get("redirect") || "/dashboard";
        addDebug(`📍 Redirect para: ${redirect}`);

        // Aguarda para cookies serem processados
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addDebug("⏱️ Aguardou 1 segundo");

        // Verifica cookies
        addDebug(`🍪 Cookies: ${document.cookie || "NENHUM!"}`);

        addDebug("📡 Chamando checkAuth...");
        await checkAuth();

        addDebug("✅ checkAuth OK!");
        toast.success("Login com Google bem-sucedido!");

        await new Promise((resolve) => setTimeout(resolve, 1000));
        navigate(redirect, { replace: true });
      } catch (e: any) {
        addDebug(`❌ Erro: ${e?.message || "Desconhecido"}`);
        toast.error("Falha na autenticação com Google.");

        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigate("/login", { replace: true });
      }
    }

    handleAuth();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full mb-4" />
      <p className="text-slate-700 mb-4">Autenticando...</p>

      <div className="bg-white p-4 rounded shadow max-w-md w-full mt-4">
        <p className="font-bold mb-2 text-sm">Debug:</p>
        <div className="text-xs space-y-1 max-h-64 overflow-y-auto">
          {debugInfo.map((info, i) => (
            <p key={i} className="text-gray-600 break-words">
              {info}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
