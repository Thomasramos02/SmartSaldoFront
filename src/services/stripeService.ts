import { toast } from "sonner";
import api from "./api";

const handlePremiumCheckout = async (plan: "monthly" | "yearly") => {
  try {
    const { data } = await api.post<{ url: string }>("/stripe/subscribe", {
      plan,
    });

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("URL de checkout nÃ£o recebida");
    }
  } catch (error) {
    console.error("Erro no checkout:", error);
    toast.error("Erro ao iniciar pagamento. Tente novamente.");
  }
};

const stripeService = {
  handlePremiumCheckout,
};

export default stripeService;
