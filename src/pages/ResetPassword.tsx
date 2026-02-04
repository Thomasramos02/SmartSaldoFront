import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../services/api";

const resetSchema = z
  .object({
    token: z.string().min(6, "Informe o codigo de 6 digitos"),
    password: z
      .string()
      .min(8, "Minimo 8 caracteres")
      .regex(/[A-Z]/, "Requer uma maiuscula")
      .regex(/[0-9]/, "Requer um numero")
      .regex(/[^A-Za-z0-9]/, "Requer um simbolo"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nÃo coincidem",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const tokenFromState =
    (location.state as { token?: string } | null)?.token || "";
  const tokenVerified = Boolean(
    (location.state as { tokenVerified?: boolean } | null)?.tokenVerified,
  );
  const [step, setStep] = useState<"verify" | "reset">(
    tokenVerified && tokenFromState ? "reset" : "verify",
  );

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    mode: "onChange",
    defaultValues: {
      token: tokenFromState,
    },
  });
  const tokenValue = watch("token");

  const handleVerifyToken = async () => {
    const isTokenValid = await trigger("token");
    if (!isTokenValid) {
      return;
    }
    clearErrors("token");
    setIsVerifying(true);
    try {
      await api.post("/auth/verify-reset-token", { token: getValues("token") });
      toast.success("Codigo verificado! Agora defina sua nova senha.");
      setStep("reset");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Codigo invalido ou expirado.";
      toast.error(message);
      setError("token", { type: "manual", message });
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token: data.token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Senha redefinida com sucesso!");
      navigate("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "NÃ£o foi possÃ­vel redefinir a senha.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Redefinir Senha</h1>
        <p className="text-sm text-slate-500 mt-2">
          {step === "verify"
            ? "Informe o codigo recebido para validar."
            : "Digite uma nova senha para sua conta."}
        </p>

        <form
          onSubmit={
            step === "verify"
              ? (event) => {
                  event.preventDefault();
                  handleVerifyToken();
                }
              : handleSubmit(onSubmit)
          }
          className="mt-6 space-y-4"
        >
          {step === "verify" ? (
            <>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Codigo de redefinição
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              {...register("token")}
              className={`w-full px-4 py-2.5 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                errors.token ? "border-red-500" : "border-slate-200"
              }`}
            />
            {errors.token && (
              <p className="mt-2 text-sm text-red-600">
                {errors.token.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleVerifyToken}
            disabled={isVerifying || !tokenValue}
            className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {isVerifying ? "Verificando..." : "Verificar codigo"}
          </button>
        </>
      ) : (
        <>
          <input type="hidden" {...register("token")} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nova senha
            </label>
            <input
              type="password"
              {...register("password")}
              className={`w-full px-4 py-2.5 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                errors.password ? "border-red-500" : "border-slate-200"
              }`}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Confirmar nova senha
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`w-full px-4 py-2.5 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                errors.confirmPassword ? "border-red-500" : "border-slate-200"
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {isLoading ? "Salvando..." : "Redefinir senha"}
          </button>
        </>
      )}
        </form>
      </div>
    </div>
  );
}
