import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  TrendingUp,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const registerSchema = z
  .object({
    fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Requer uma maiúscula")
      .regex(/[0-9]/, "Requer um número")
      .regex(/[^A-Za-z0-9]/, "Requer um símbolo"),
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "Você deve aceitar os termos de uso"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await api.post("/auth/signup", {
        name: data.fullName,
        email: data.email,
        password: data.password,
      });
      setShowSuccess(true);
      toast.success("🎉 Conta criada! Redirecionando...");
      setTimeout(() => navigate("/dashboard"), 2000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Não foi possível criar a conta. Verifique os dados.");
      setIsLoading(false);
    }
  };

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
        <CheckCircle className="h-10 w-10 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">
        Conta criada com sucesso!
      </h2>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        Estamos preparando seu dashboard. Você será redirecionado em instantes.
      </p>
      <div className="flex justify-center">
        <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "linear" }}
            className="h-full bg-emerald-600"
          />
        </div>
      </div>
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
              A tranquilidade de ter o controle do seu dinheiro.
            </h1>
            <p className="text-lg text-emerald-100 max-w-md">
              Crie sua conta em menos de 1 minuto e descubra como a nossa IA
              pode organizar sua vida financeira automaticamente.
            </p>

            {/* Pequeno reforço visual de features */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-emerald-50">
                <div className="bg-white/10 p-1.5 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">
                  100% gratuito para começar
                </span>
              </div>
              <div className="flex items-center gap-3 text-emerald-50">
                <div className="bg-white/10 p-1.5 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">
                  Categorização automática de despesas
                </span>
              </div>
            </div>
          </motion.div>

          <div className="text-sm text-emerald-200 z-10">
            &copy; {new Date().getFullYear()} SmartSaldo. Todos os direitos
            reservados.
          </div>

          {/* Elementos decorativos de fundo */}
          <Sparkles className="absolute -bottom-12 -right-12 w-48 h-48 text-white/10" />
          <Shield className="absolute top-12 -left-12 w-48 h-48 text-white/10" />
        </div>

        {/* Right Panel */}
        <div className="flex flex-col justify-center items-center py-12 px-6 sm:px-12">
          <div className="w-full max-w-lg">
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="flex items-center gap-3 justify-center">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-slate-800">
                  SmartSaldo
                </span>
              </Link>
            </div>

            <AnimatePresence mode="wait">
              {showSuccess ? (
                renderSuccess()
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-3xl font-bold text-slate-800">
                    Crie sua conta
                  </h2>
                  <p className="text-slate-500 mt-2 mb-8">
                    É rápido, fácil e gratuito.
                  </p>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="fullName"
                          className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                          Nome Completo
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input
                            {...register("fullName")}
                            type="text"
                            id="fullName"
                            placeholder="Seu nome"
                            className={`input-field ${errors.fullName ? "border-red-500" : "border-slate-200"}`}
                          />
                        </div>
                        {errors.fullName && (
                          <p className="form-error">
                            <AlertCircle size={14} /> {errors.fullName.message}
                          </p>
                        )}
                      </div>
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
                            className={`input-field ${errors.email ? "border-red-500" : "border-slate-200"}`}
                          />
                        </div>
                        {errors.email && (
                          <p className="form-error">
                            <AlertCircle size={14} /> {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-slate-700 mb-2"
                      >
                        Senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          {...register("password")}
                          type={showPassword ? "text" : "password"}
                          id="password"
                          placeholder="Crie uma senha forte"
                          className={`input-field ${errors.password ? "border-red-500" : "border-slate-200"}`}
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
                      <PasswordStrengthIndicator password={password} />
                      {errors.password && (
                        <p className="form-error">
                          <AlertCircle size={14} /> {errors.password.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-semibold text-slate-700 mb-2"
                      >
                        Confirmar Senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          {...register("confirmPassword")}
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          placeholder="Confirme sua senha"
                          className={`input-field ${errors.confirmPassword ? "border-red-500" : "border-slate-200"}`}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-slate-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-slate-400" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="form-error">
                          <AlertCircle size={14} />{" "}
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    <div className="pt-2">
                      <div className="flex items-start">
                        <input
                          {...register("acceptTerms")}
                          id="acceptTerms"
                          type="checkbox"
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded mt-1"
                        />
                        <label
                          htmlFor="acceptTerms"
                          className="ml-3 block text-sm text-slate-600"
                        >
                          Eu li e concordo com os{" "}
                          <Link
                            to="/terms"
                            className="font-semibold text-emerald-600 hover:underline"
                          >
                            Termos de Uso
                          </Link>{" "}
                          e a{" "}
                          <Link
                            to="/privacy"
                            className="font-semibold text-emerald-600 hover:underline"
                          >
                            Política de Privacidade
                          </Link>
                          .
                        </label>
                      </div>
                      {errors.acceptTerms && (
                        <p className="form-error mt-2">
                          <AlertCircle size={14} /> {errors.acceptTerms.message}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !isValid}
                      className="button-primary w-full group !mt-8"
                    >
                      {isLoading ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <span>Criar Conta Gratuita</span>
                      )}
                      <TrendingUp className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {!showSuccess && (
              <p className="text-center text-slate-500 mt-8 text-sm">
                Já possui uma conta?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-emerald-600 hover:underline"
                >
                  Fazer Login <ArrowRight className="inline h-4 w-4" />
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
