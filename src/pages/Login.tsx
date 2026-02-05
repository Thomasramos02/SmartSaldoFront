import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Sparkles,
  LogIn,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/Logo.png";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useLocation } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
if (!apiBaseUrl) {
  throw new Error("VITE_API_URL is not set.");
}

const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Motion variants
const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetSent, setIsResetSent] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [resetTokenError, setResetTokenError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the auth context

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get("redirect");
  const planParam = searchParams.get("plan");
  const redirect = redirectParam || "/dashboard"; // Para onde vai após login
  const plan = planParam || ""; // Plano selecionado (se houver)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      await login(data.email, data.password); // Use the login function from AuthContext
      toast.success("Login bem-sucedido! Redirecionando...");
      // Consolidate navigation calls
      setTimeout(() => {
        navigate(redirect, { replace: true });
      }, 1000);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setLoginError("Credenciais inválidas. Verifique seu email e senha.");
      } else {
        setLoginError(
          "Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.",
        );
      }
      toast.error("Falha no login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordRequest = async () => {
    if (!resetEmail) {
      toast.error("Por favor, insira um email.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", {
        email: resetEmail,
      });
      setIsResetSent(true);
      toast.success(`Link de recuperação enviado para ${resetEmail}!`);
    } catch (error) {
      toast.error("Não foi possível enviar o link. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetToken = async () => {
    if (!resetToken) {
      toast.error("Por favor, informe o codigo recebido.");
      return;
    }
    setIsVerifyingToken(true);
    setResetTokenError(null);
    try {
      await api.post("/auth/verify-reset-token", { token: resetToken });
      toast.success("Codigo verificado! Agora defina sua nova senha.");
      navigate(`/reset-password`, {
        state: { tokenVerified: true, token: resetToken },
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Codigo invalido ou expirado.";
      toast.error(message);
      setResetTokenError(message);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleSocialLogin = (provider: "Google") => {
    setIsLoading(true);
    toast.info(`Redirecionando para autenticação do ${provider}...`);
    const encodedRedirect = encodeURIComponent(redirect);
    const encodedPlan = encodeURIComponent(plan || "");
    window.location.href = `${apiBaseUrl}/auth/google?redirect=${encodedRedirect}&plan=${encodedPlan}`;
  };

  const renderLoginForm = () => (
    <motion.div
      key="login"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <h2 className="text-2xl font-bold text-slate-800">Bem-vindo de volta</h2>
      <p className="text-slate-500 mt-2 mb-8">
        Faça login para acessar seu dashboard.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              {...register("email")}
              type="email"
              id="email"
              placeholder="seu@email.com"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${
                errors.email ? "border-red-500" : "border-slate-200"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle size={14} />
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700"
            >
              Senha
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Esqueceu a senha?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Digite sua senha"
              className={`w-full pl-10 pr-10 py-3 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${
                errors.password ? "border-red-500" : "border-slate-200"
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400" />
              )}
            </button>
          </div>

          {loginError && (
            <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle size={14} />
              {loginError}
            </p>
          )}

          {errors.password && (
            <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle size={14} />
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              {...register("rememberMe")}
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-slate-700"
            >
              Lembrar de mim
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="w-full flex items-center justify-center bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <span>Entrar</span>
              <LogIn className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-50 text-slate-500">
            Ou continue com
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleSocialLogin("Google")}
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-white text-slate-700 border border-slate-300 py-3 px-4 rounded-lg font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
      </div>
    </motion.div>
  );

  const renderForgotPasswordForm = () => (
    <motion.div
      key="forgot"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {!isResetSent ? (
        <>
          <h2 className="text-2xl font-bold text-slate-800">Recuperar Senha</h2>
          <p className="text-slate-500 mt-2 mb-8">
            Insira seu email para receber o link de recuperação.
          </p>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="resetEmail"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            <button
              onClick={handleForgotPasswordRequest}
              disabled={isLoading || !resetEmail}
              className="w-full flex items-center justify-center bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                "Enviar Link"
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
            <Mail className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Email enviado!
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Enviamos um link para{" "}
            <span className="font-semibold text-slate-800">{resetEmail}</span>.
            Verifique sua caixa de entrada.
          </p>
          <div className="text-left space-y-4">
            <div>
              <label
                htmlFor="resetToken"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Codigo de redefinicao
              </label>
              <input
                id="resetToken"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={resetToken}
                onChange={(e) => {
                  setResetToken(e.target.value);
                  setResetTokenError(null);
                }}
                placeholder="Digite o codigo de 6 digitos"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              {resetTokenError && (
                <p className="mt-2 text-sm text-red-600">{resetTokenError}</p>
              )}
            </div>
            <button
              onClick={handleVerifyResetToken}
              disabled={isVerifyingToken || !resetToken}
              className="w-full flex items-center justify-center bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifyingToken ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                "Validar codigo"
              )}
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => {
          setShowForgotPassword(false);
          setIsResetSent(false);
          setResetEmail("");
          setResetToken("");
          setResetTokenError(null);
        }}
        className="mt-6 text-sm text-emerald-600 hover:text-emerald-700 font-medium w-full text-center"
      >
        &larr; Voltar para o Login
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-600 to-teal-600 text-white relative overflow-hidden">
          <div>
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                SmartSaldo
              </span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Seu dinheiro, sob controle e sem esforço.
            </h1>
            <p className="text-lg text-emerald-100 max-w-md">
              Junte-se a milhares de pessoas que já simplificaram suas finanças
              com a nossa inteligência.
            </p>

            {/* Um pequeno diferencial: lista rápida de benefícios no login */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-sm text-emerald-50">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <span>Importação automática de extratos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-50">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <span>Gráficos claros para acompanhar seus gastos</span>
              </div>
            </div>
          </motion.div>

          <div className="text-sm text-emerald-200 z-10">
            &copy; {new Date().getFullYear()} SmartSaldo. Todos os direitos
            reservados.
          </div>

          {/* Elementos Decorativos */}
          <Sparkles className="absolute -bottom-12 -right-12 w-48 h-48 text-white/10" />
          <Shield className="absolute top-12 -left-12 w-48 h-48 text-white/10" />
        </div>

        {/* Right Panel */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="flex items-center gap-3 justify-center">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm  bg-gradient-to-br from-emerald-600 to-teal-600 text-white relative overflow-hidden">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  SmartSaldo
                </span>
              </Link>
            </div>

            <AnimatePresence mode="wait">
              {showForgotPassword
                ? renderForgotPasswordForm()
                : renderLoginForm()}
            </AnimatePresence>

            <p className="text-center text-slate-500 mt-8 text-sm">
              Ainda não tem uma conta?{" "}
              <Link
                to="/register"
                className="font-semibold text-emerald-600 hover:underline"
              >
                Crie uma agora <ArrowRight className="inline h-4 w-4" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
