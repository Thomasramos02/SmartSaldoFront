import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();


  useEffect(() => {
    async function handleAuth() {
      try {
        const redirect = searchParams.get("redirect") || "/dashboard";

        // Aguarda para cookies serem processados
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await checkAuth();

        toast.success("Login com Google bem-sucedido!");

        await new Promise((resolve) => setTimeout(resolve, 1000));
        navigate(redirect, { replace: true });
      } catch (e: any) {
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


    </div>
  );
}
