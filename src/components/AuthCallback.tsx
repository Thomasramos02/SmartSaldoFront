import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    async function finalizeLogin() {
      try {
        // força o AuthContext a buscar /auth/me
        await checkAuth();

        // se deu certo, vai pra dashboard
        navigate("/dashboard", { replace: true });
      } catch (e) {
        console.error("Erro no callback do Google", e);
        navigate("/login", { replace: true });
      }
    }

    finalizeLogin();
  }, [checkAuth, navigate]);

  return <div>Finalizando login com Google...</div>;
}
