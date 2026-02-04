import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const confirm = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        toast.error("Sessão inválida do checkout.");
        navigate("/dashboard", { replace: true });
        return;
      }

      try {
        const { data } = await api.get<{ status: string }>(
          `/stripe/confirm?session_id=${sessionId}`,
        );
        await checkAuth();
        if (data.status === "premium") {
          toast.success("Assinatura ativada! Bem-vindo ao Premium.");
        } else {
          toast.info(
            "Pagamento em processamento. Tente novamente em instantes.",
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Não foi possível confirmar a assinatura.");
      } finally {
        setIsLoading(false);
        navigate("/dashboard", { replace: true });
      }
    };

    confirm();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-slate-700">
        {isLoading ? "Confirmando assinatura..." : "Redirecionando..."}
      </div>
    </div>
  );
}
