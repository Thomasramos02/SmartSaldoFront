import {
  Calendar,
  TrendingUp,
  Sparkles,
  Info,
  CheckCircle,
  Zap,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import stripeService from "../services/stripeService";

interface Category {
  id: number;
  name: string;
  color: string;
  limit?: number;
}

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    budget: string,
    categoryLimits: Record<number, string>,
  ) => Promise<void>;
  categories: Category[];
  isLoading?: boolean;
}

export function WelcomeModal({
  isOpen,
  onClose,
  onSave,
  categories,
  isLoading = false,
}: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [budgetInput, setBudgetInput] = useState("");
  const [categoryLimits, setCategoryLimits] = useState<Record<number, string>>(
    {},
  );
  const [isPremiumSkipped, setIsPremiumSkipped] = useState(false);
  const premiumMonthly = 29.9;
  const premiumYearly = 287;

  const totalSteps = 3;

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
    setBudgetInput("");
    setCategoryLimits({});
    setIsPremiumSkipped(false);
  }, [isOpen]);

  const handleSkipAll = () => {
    setCurrentStep(1);
    setBudgetInput("");
    setCategoryLimits({});
    setIsPremiumSkipped(false);
    onClose();
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteSetup = async () => {
    await onSave(budgetInput, categoryLimits);
    setCurrentStep(1);
    setBudgetInput("");
    setCategoryLimits({});
    setIsPremiumSkipped(false);
  };

  const handleSkipPremium = () => {
    setIsPremiumSkipped(true);
    handleNextStep();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkipAll}
      hideHeader={true}
      showCloseButton={false}
      maxWidth="max-w-4xl"
      className="rounded-2xl"
      contentClassName="p-0 max-h-[85vh] overflow-hidden"
    >
      <div className="flex flex-col h-full">
        {/* Header com Progresso */}
        <div className="flex-shrink-0 px-6 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                {currentStep === 1 && (
                  <Calendar className="w-5 h-5 text-white" />
                )}
                {currentStep === 2 && (
                  <TrendingUp className="w-5 h-5 text-white" />
                )}
                {currentStep === 3 && (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {currentStep === 1 && "Seu Orçamento"}
                  {currentStep === 2 && "Limites por Categoria"}
                  {currentStep === 3 && "Finalizar"}
                </h2>
                <p className="text-xs text-slate-500">
                  Passo {currentStep} de {totalSteps}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-emerald-600">
                {Math.round((currentStep / totalSteps) * 100)}% completo
              </div>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-hidden px-6">
          <div className="h-full">
            {/* PASSO 1 - Orçamento */}
            {currentStep === 1 && (
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Qual seu orçamento para este mês?
                    </h3>
                    <p className="text-sm text-slate-600">
                      Defina uma meta flexível para seus gastos
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Input Principal */}
                    <div className="relative group">
                      <div className="flex items-center justify-center bg-white border-2 border-emerald-200 rounded-2xl p-2 hover:border-emerald-300 transition-all group-focus-within:border-emerald-500 group-focus-within:ring-2 group-focus-within:ring-emerald-200">
                        <span className="text-lg text-slate-500 mr-3 font-medium">
                          R$
                        </span>
                        <input
                          type="number"
                          placeholder="0,00"
                          className="w-full text-2xl font-bold text-slate-900 placeholder-slate-300 outline-none text-center py-4"
                          style={{ fontVariantNumeric: "tabular-nums" }}
                          value={budgetInput}
                          onChange={(e) => setBudgetInput(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Sugestões Rápidas */}
                    <div className="grid grid-cols-3 gap-2">
                      {[1000, 2000, 3000, 5000, 7500, 10000].map((value) => (
                        <button
                          key={value}
                          onClick={() => setBudgetInput(value.toString())}
                          className="p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all active:scale-95"
                        >
                          <div className="font-medium text-slate-900 text-sm">
                            R$ {value.toLocaleString("pt-BR")}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Dica */}
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600">
                          Você pode ajustar este valor a qualquer momento nas
                          configurações do perfil.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 2 - Categorias */}
            {currentStep === 2 && (
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Ajuste limites por categoria
                    </h3>
                    <p className="text-sm text-slate-600">
                      Organize melhor seus gastos mensais
                    </p>
                  </div>

                  {/* Lista de Categorias */}
                  <div className="grid grid-cols-2 gap-3 h-[calc(100%-100px)] overflow-y-auto pr-1 pb-2">
                    {categories.slice(0, 8).map((cat) => (
                      <div
                        key={cat.id}
                        className="bg-white border border-slate-200 rounded-xl p-3 hover:border-emerald-200 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                            style={{ backgroundColor: cat.color }}
                          >
                            {cat.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 text-sm truncate">
                              {cat.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              Sugestão: R${" "}
                              {(cat.limit || 0).toLocaleString("pt-BR")}
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <span className="absolute left-2 top-2.5 text-slate-400 text-xs">
                            R$
                          </span>
                          <input
                            type="number"
                            placeholder="Limite"
                            className="w-full pl-7 pr-2 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
                            value={categoryLimits[cat.id] || ""}
                            onChange={(e) =>
                              setCategoryLimits({
                                ...categoryLimits,
                                [cat.id]: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 3 - Finalização */}
            {currentStep === 3 && (
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  {!isPremiumSkipped ? (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          Desbloqueie recursos premium
                        </h3>
                        <p className="text-sm text-slate-600">
                          Teste grátis por 7 dias
                        </p>
                      </div>

                      {/* Benefícios */}
                      <div className="space-y-3 mb-6">
                        {[
                          {
                            icon: Zap,
                            title: "Insights de IA ilimitados",
                            desc: "Análises personalizadas",
                          },
                          {
                            icon: TrendingUp,
                            title: "Previsões automáticas",
                            desc: "Baseadas nos seus hábitos",
                          },
                          {
                            icon: ArrowUpRight,
                            title: "Relatórios avançados",
                            desc: "Exporte em PDF e Excel",
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl"
                          >
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <item.icon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-slate-900 text-sm">
                                {item.title}
                              </div>
                              <div className="text-xs text-slate-500">
                                {item.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Preço */}
                      <div className="text-center mb-6">
                        <div
                          className="text-2xl font-bold text-slate-900 mb-1"
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          R${" "}
                          {premiumMonthly.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                          <span className="text-sm text-slate-500 font-normal">
                            /mês
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Cancele quando quiser
                        </div>
                        <div className="text-xs text-emerald-700 font-medium">
                          ou R${" "}
                          {premiumYearly.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                          /ano (20% off)
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-3">
                          Tudo pronto! 🎉
                        </h3>
                        <p className="text-sm text-slate-600 mb-8">
                          Seu controle financeiro está configurado e pronto para
                          uso.
                        </p>

                        {/* Resumo */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="p-4 bg-emerald-50 rounded-xl">
                            <div className="text-xs font-medium text-slate-600 mb-1">
                              Orçamento Mensal
                            </div>
                            <div
                              className="text-lg font-bold text-emerald-700"
                              style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {budgetInput
                                ? `R$ ${parseFloat(budgetInput).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                : "Flexível"}
                            </div>
                          </div>
                          <div className="p-4 bg-teal-50 rounded-xl">
                            <div className="text-xs font-medium text-slate-600 mb-1">
                              Categorias
                            </div>
                            <div className="text-lg font-bold text-teal-700">
                              {Object.keys(categoryLimits).length} ajustadas
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com Navegação */}
        <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center">
            {/* Botão Esquerda */}
            {currentStep === 1 ? (
              <button
                onClick={handleSkipAll}
                className="px-4 py-3 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-50 rounded-lg transition-colors"
              >
                Pular tudo
              </button>
            ) : (
              <button
                onClick={handlePrevStep}
                className="px-4 py-3 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>
            )}

            {/* Botão Direita */}
            {currentStep < totalSteps ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-bold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : isPremiumSkipped ? (
              <button
                onClick={handleCompleteSetup}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Começar a usar
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSkipPremium}
                  className="px-4 py-3 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Agora não
                </button>
                <button
                  onClick={() => stripeService.handlePremiumCheckout("monthly")}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm hover:shadow-md"
                >
                  Assinar Mensal
                </button>
                <button
                  onClick={() => stripeService.handlePremiumCheckout("yearly")}
                  className="px-6 py-3 bg-white text-emerald-700 border border-emerald-200 rounded-lg font-bold hover:bg-emerald-50 transition-all shadow-sm hover:shadow-md"
                >
                  Assinar Anual
                </button>
              </div>
            )}
          </div>

          {/* Indicadores de Passo */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === step
                    ? "bg-emerald-500 w-6"
                    : "bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Ir para passo ${step}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
