import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { User, Bell, Shield, Camera, Save, Trash2 } from "lucide-react";

import { toast } from "sonner";

import userService, { type UpdateUserDto } from "../services/userService";
import { authService } from "../services/api";

import type { UserProfile } from "../types/user";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/alert-dialog";
import { PageTransition } from "../components/PageTransition";

type Tab = "profile" | "preferences" | "security";

interface ChangePasswordDto {
  password: string;

  confirmPassword: string;
}

export function Configuracoes() {
  const isPasswordUpdateEnabled = false;
  const isDeleteAccountEnabled = true;
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [loading, setLoading] = useState(true);

  // Profile State

  const [userData, setUserData] = useState<UserProfile>({
    id: 0,

    name: "",

    email: "",

    createdAt: "",

    monthlyBudget: 0,
  });

  // Security State

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",

    newPassword: "",

    confirmPassword: "",
  });

  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const deleteConfirmationText = "EXCLUIR";
  const isDeleteConfirmationValid =
    deleteConfirmation.trim().toUpperCase() === deleteConfirmationText;
  const showDeleteConfirmationError =
    deleteConfirmation.length > 0 && !isDeleteConfirmationValid;

  // Preferences State

  const [emailNotifications, setEmailNotifications] = useState(true);

  const [pushNotifications, setPushNotifications] = useState(true);

  const [weeklyReport, setWeeklyReport] = useState(true);

  const [theme, setTheme] = useState<"light" | "dark">("light"); // Default theme, no localStorage

  const [language, setLanguage] = useState("pt-BR");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await userService.getProfile(); // ou /auth/me
        setUserData(response);
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
        toast.error("Erro ao carregar dados do usuário");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Apply theme to html element based on current state
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleProfileSave = async () => {
    try {
      const profileData: UpdateUserDto = {
        name: userData.name,

        email: userData.email,

        monthlyBudget: userData.monthlyBudget,
      };

      await userService.updateProfile(profileData);

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar perfil. Tente novamente.");

      console.error("Erro ao salvar perfil", error);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!isPasswordUpdateEnabled) {
      toast.info("Em breve: atualizaÃ§Ã£o de senha no painel.");
      return;
    }

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Por favor, preencha todos os campos.");

      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem.");

      return;
    }

    // This part would also ideally be in the userService

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const payload: ChangePasswordDto = {
        password: passwordData.newPassword,

        confirmPassword: passwordData.confirmPassword,
      };

      // await userService.changePassword(payload);

      toast.success("Senha atualizada com sucesso!");

      setPasswordData({
        currentPassword: "",

        newPassword: "",

        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Erro ao atualizar a senha.");

      console.error("Erro ao atualizar senha", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isDeleteAccountEnabled) {
      toast.info("Em breve: exclusao de conta.");
      return;
    }

    if (!isDeleteConfirmationValid) {
      toast.error("Digite EXCLUIR para confirmar.");
      return;
    }

    // This part would also ideally be in the userService

    try {
      await userService.deleteAccount();
      toast.success("Conta excluida com sucesso.");
      setDeleteAlertOpen(false);
      setDeleteConfirmation("");
      authService.logout(); // Use authService.logout() instead of localStorage.removeItem
      window.location.href = "/login";
    } catch (error) {
      toast.error("Erro ao excluir conta. Tente novamente.");
      console.error("Erro ao excluir conta", error);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-600 font-medium">
        Carregando configurações...
      </div>
    );

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            Configurações
          </h2>

          <p className="text-slate-500 text-sm">
            Gerencie sua conta e preferências de sistema
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tab Navigation */}

          <div className="border-b border-slate-200 bg-slate-50/50">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap font-medium ${
                  activeTab === "profile"
                    ? "border-emerald-600 text-emerald-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <User className="w-4 h-4" /> Perfil
              </button>

              <button
                onClick={() => setActiveTab("preferences")}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap font-medium ${
                  activeTab === "preferences"
                    ? "border-emerald-600 text-emerald-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <Bell className="w-4 h-4" /> Preferências
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap font-medium ${
                  activeTab === "security"
                    ? "border-emerald-600 text-emerald-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <Shield className="w-4 h-4" /> Segurança
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* PROFILE TAB */}

            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="relative">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-bold">
                      {userData.name.substring(0, 2).toUpperCase()}
                    </div>

                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50">
                      <Camera className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {userData.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Membro desde{" "}
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">
                      Nome
                    </label>

                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) =>
                        setUserData({ ...userData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">
                      E-mail
                    </label>

                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">
                      Orçamento Mensal (R$)
                    </label>

                    <input
                      type="number"
                      value={userData.monthlyBudget}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          monthlyBudget: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">
                      ID do Usuário
                    </label>

                    <input
                      type="text"
                      value={userData.id}
                      disabled
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <section>
                  <h3 className="text-slate-800 font-semibold mb-4">
                    Notificações
                  </h3>

                  <div className="space-y-3">
                    {[
                      {
                        label: "E-mail",
                        desc: "Alertas importantes na sua conta",
                        state: emailNotifications,
                        setter: setEmailNotifications,
                      },

                      {
                        label: "Push",
                        desc: "Notificações em tempo real no navegador",
                        state: pushNotifications,
                        setter: setPushNotifications,
                      },

                      {
                        label: "Relatórios",
                        desc: "Resumo semanal de desempenho",
                        state: weeklyReport,
                        setter: setWeeklyReport,
                      },
                    ].map((item, idx) => (
                      <label
                        key={idx}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800">
                            {item.label}
                          </div>

                          <div className="text-xs text-slate-500">
                            {item.desc}
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={item.state}
                          onChange={(e) => item.setter(e.target.checked)}
                          className="w-5 h-5 accent-emerald-600"
                        />
                      </label>
                    ))}
                  </div>
                </section>

                <section className="pt-4 border-t border-slate-100">
                  <h3 className="text-slate-800 font-semibold mb-4">
                    Aparência e Idioma
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tema
                      </label>

                      <select
                        value={theme}
                        onChange={(e) =>
                          setTheme(e.target.value as "light" | "dark")
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                      >
                        <option value="light">Claro</option>

                        <option value="dark">Escuro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Idioma
                      </label>

                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                      >
                        <option value="pt-BR">Português (Brasil)</option>

                        <option value="en-US">English (US)</option>
                      </select>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* SECURITY TAB */}

            {activeTab === "security" && (
              <div className="space-y-8">
                <section>
                  <h3 className="text-slate-800 font-semibold mb-1">
                    Alterar Senha
                  </h3>

                  <p className="text-sm text-slate-500 mb-4">
                    Recomendamos usar uma senha forte que você não usa em outro
                    lugar.
                  </p>

                  <div className="max-w-md space-y-4">
                    <input
                      type="password"
                      placeholder="Senha Atual"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <input
                      type="password"
                      placeholder="Nova Senha"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <input
                      type="password"
                      placeholder="Confirmar Nova Senha"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <button
                      onClick={handlePasswordUpdate}
                      disabled={!isPasswordUpdateEnabled}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
                    >
                      Atualizar Senha
                    </button>
                  </div>
                </section>

                <section className="pt-6 border-t border-red-200">
                  <h3 className="text-red-700 font-semibold mb-1">
                    Excluir Conta
                  </h3>

                  <p className="text-sm text-slate-500 mb-4">
                    Esta ação é irreversível. Todos os seus dados, incluindo
                    gastos, metas e orçamentos, serão permanentemente apagados.
                  </p>

                  <AlertDialog
                    open={isDeleteAlertOpen}
                    onOpenChange={(open) => {
                      setDeleteAlertOpen(open);
                      if (!open) {
                        setDeleteConfirmation("");
                      }
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <button
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!isDeleteAccountEnabled}
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir minha conta
                      </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className="sm:rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-xl">
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>

                          <AlertDialogDescription>
                            Esta acao e permanente. Seus dados e historico
                            financeiro serao removidos e nao poderao ser
                            recuperados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                          Ao confirmar, sua conta sera encerrada imediatamente.
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Digite EXCLUIR para confirmar
                          </label>
                          <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) =>
                              setDeleteConfirmation(e.target.value)
                            }
                            placeholder="EXCLUIR"
                            autoComplete="off"
                            className={`w-full px-4 py-2 border rounded-lg outline-none ${
                              showDeleteConfirmationError
                                ? "border-red-400 focus:ring-2 focus:ring-red-400"
                                : "border-slate-200 focus:ring-2 focus:ring-red-500"
                            }`}
                          />
                          {showDeleteConfirmationError && (
                            <p className="text-xs text-red-600">
                              Digite EXCLUIR exatamente para liberar o botao.
                            </p>
                          )}
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>

                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={
                              !isDeleteAccountEnabled ||
                              !isDeleteConfirmationValid
                            }
                          >
                            Excluir definitivamente
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </motion.div>
                    </AlertDialogContent>
                  </AlertDialog>
                </section>
              </div>
            )}

            {/* Global Save Button */}

            {activeTab !== "security" && (
              <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={handleProfileSave}
                  className="inline-flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all active:scale-95 font-medium shadow-sm"
                >
                  <Save className="w-4 h-4" /> Salvar Alterações
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}



