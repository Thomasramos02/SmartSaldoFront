// smartSaldo-frontend/src/pages/Payment.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import stripeService from "../services/stripeService";
import { toast } from "react-hot-toast";

export default function Payment() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const billingCycle = searchParams.get("billingCycle") || "monthly"; // Default to monthly if not specified

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, proceed with Stripe checkout
        toast.loading("Redirecionando para o pagamento...");
        stripeService.handlePremiumCheckout(billingCycle === "monthly" ? "monthly" : "yearly");
      } else {
        // User is not authenticated, redirect to login (should not happen if flow is correct, but as a safeguard)
        navigate(`/login?redirect=/payment?billingCycle=${billingCycle}`);
      }
    }
  }, [isAuthenticated, isLoading, navigate, billingCycle]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Display a message while redirecting or processing
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg text-gray-700">Aguarde, redirecionando para o pagamento...</p>
    </div>
  );
}
