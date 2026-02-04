import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth(); // 🔹 IMPORTANTE: pegar função do AuthContext

  useEffect(() => {
    async function handleAuth() {
      try {
        const redirect = searchParams.get("redirect") || "/dashboard";
        await checkAuth();
        toast.success("Login com Google bem-sucedido!");
        navigate(redirect, { replace: true }); // redireciona para destino final
      } catch {
        toast.error("Falha na autenticação com Google.");
        navigate("/login", { replace: true });
      }
    }

    handleAuth();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
      <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
      <p className="text-slate-700 mt-4">Autenticando...</p>
    </div>
  );
}
