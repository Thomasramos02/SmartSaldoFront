import {
  Clock,
  Calendar,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import userService from "../services/userService";
import type { UserProfile } from "../types/user";
import type { Expense } from "../types/expense";
import expenseService from "../services/expenseService";
import type { Category } from "../types/category";
import categoryService from "../services/categoryService";
import { Upload } from "lucide-react";
import { Modal } from "../components/Modal";
import { toast } from "sonner";
import { ExpenseForm } from "../components/ExpenseForm";
import type { UpdateExpenseDto } from "../types/updateExpense.dto";
import { WelcomeModal } from "../components/WelcomeModal.";
import { PageTransition } from "../components/PageTransition";
import { CategoryLimitsModal } from "../components/CategoryLimitsModal";
import { ReportGenerator } from "../components/ReportGenerator";
import stripeService from "../services/stripeService";

export function Dashboard() {
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [newlyCreatedExpenses, setNewlyCreatedExpenses] = useState<Expense[]>(
    [],
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [evolutionData, setEvolutionData] = useState<
    { month: string; total: number; budget: number }[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlySummary, setMonthlySummary] = useState<{
    month: string;
    total: number;
    budget: number;
  } | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isCategoryLimitsOpen, setIsCategoryLimitsOpen] = useState(false);

  const isPremium = userProfile?.plan == "premium";
  const getWelcomeStorageKey = (profile: UserProfile | null) =>
    profile ? `welcome_onboarding_seen_${profile.id}` : null;
  const markWelcomeSeen = () => {
    const key = getWelcomeStorageKey(userProfile);
    if (key) {
      localStorage.setItem(key, "1");
    }
  };

  useEffect(() => {
    if (!userProfile) return;
    const key = getWelcomeStorageKey(userProfile);
    if (!key) return;
    const hasSeen = localStorage.getItem(key) === "1";
    if (!hasSeen) {
      localStorage.setItem(key, "1");
      setIsWelcomeModalOpen(true);
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const today = new Date();
    const selectedMonthDate = new Date(selectedYear, selectedMonth);
    const lastDayOfSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0);

    if (
      selectedMonthDate.getMonth() === today.getMonth() &&
      selectedMonthDate.getFullYear() === today.getFullYear()
    ) {
      setDaysRemaining(lastDayOfSelectedMonth.getDate() - today.getDate());
    } else if (selectedMonthDate > today) {
      setDaysRemaining(lastDayOfSelectedMonth.getDate());
    } else {
      setDaysRemaining(0);
    }
  }, [selectedMonth, selectedYear]);

  // Função para salvar as configurações iniciais
  const handleSaveInitialSettings = async (
    budget: string,
    limits: Record<number, string>,
  ) => {
    try {
      setLoading(true);

      if (budget) {
        await userService.updateProfile({ monthlyBudget: parseFloat(budget) });
      }

      const limitPromises = Object.entries(limits).map(([id, limit]) => {
        if (limit) {
          return categoryService.update(Number(id), {
            limit: parseFloat(limit),
          });
        }
        return Promise.resolve();
      });

      await Promise.all(limitPromises);

      await Promise.all([
        loadMonthlySummary(selectedYear, selectedMonth),
        loadCategories(),
        userService.getProfile().then(setUserProfile),
      ]);

      toast.success("Perfil e limites configurados com sucesso!");
      markWelcomeSeen();
      setIsWelcomeModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar configurações iniciais:", error);
      toast.error("Falha ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const data = await expenseService.getAll();
      setExpenses(data);
    } catch (err) {
      console.error("Erro ao carregar despesas", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error("Erro ao carregar Categorias", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEvolutionDataExpense = async () => {
    try {
      const data = await expenseService.getTotalsGroupedByMonth();
      setEvolutionData(data);
    } catch (err) {
      console.error("Erro ao carregar Gastos totais por mes", err);
    }
  };

  const loadMonthlySummary = async (year: number, month: number) => {
    try {
      const data = await expenseService.getMonthlySummaryWithBudget(
        year,
        month + 1,
      );
      setMonthlySummary(data);
    } catch (err) {
      console.error("Erro ao carregar resumo mensal", err);
      setMonthlySummary(null);
    }
  };

  useEffect(() => {
    if (userProfile) {
      loadCategories();
      loadExpenses();
      loadEvolutionDataExpense();
      loadMonthlySummary(selectedYear, selectedMonth);
    }
  }, [userProfile, selectedYear, selectedMonth]);

  const getProjectedTotalForMonth = (
    monthExpenses: Expense[],
    monthTotal: number,
    year: number,
    month: number,
  ) => {
    const today = new Date();
    const isCurrentMonth =
      month === today.getMonth() && year === today.getFullYear();

    if (!isCurrentMonth) {
      return monthTotal;
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysElapsed = Math.max(1, today.getDate());
    const remainingDays = Math.max(0, daysInMonth - daysElapsed);

    // Janela dos Ãºltimos 7 dias para captar tendÃªncia recente
    const windowDays = Math.min(7, daysElapsed);
    const windowStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - (windowDays - 1),
    );

    const windowTotal = monthExpenses
      .filter((e) => {
        const d = new Date(e.date);
        return d >= windowStart && d <= today;
      })
      .reduce((acc, e) => acc + e.amount, 0);

    const recentDailyAverage =
      windowTotal > 0 ? windowTotal / windowDays : monthTotal / daysElapsed;

    // --- melhorias: outlier + média ponderada + faixa ---
    const dailyTotals = new Map<number, number>();
    monthExpenses.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() !== month || d.getFullYear() !== year) return;
      const day = d.getDate();
      dailyTotals.set(day, (dailyTotals.get(day) || 0) + e.amount);
    });
    const dailyValues = Array.from(dailyTotals.values());
    const overallDailyAverage = monthTotal / daysElapsed;

    let filteredDaily = dailyValues;
    if (dailyValues.length >= 5) {
      const sorted = [...dailyValues].sort((a, b) => a - b);
      const median =
        sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
      const deviations = sorted.map((v) => Math.abs(v - median));
      const devSorted = [...deviations].sort((a, b) => a - b);
      const mad =
        devSorted.length % 2 === 0
          ? (devSorted[devSorted.length / 2 - 1] +
              devSorted[devSorted.length / 2]) /
            2
          : devSorted[Math.floor(devSorted.length / 2)];
      const threshold = mad * 3;
      filteredDaily =
        mad === 0
          ? sorted
          : sorted.filter((v) => Math.abs(v - median) <= threshold);
    }

    const weights = [
      { offset: 0, weight: 0.5 },
      { offset: 1, weight: 0.3 },
      { offset: 2, weight: 0.2 },
    ];
    let weightedSum = 0;
    let weightTotal = 0;
    weights.forEach(({ offset, weight }) => {
      const day = today.getDate() - offset;
      if (day >= 1) {
        const value = dailyTotals.get(day);
        if (value !== undefined) {
          weightedSum += value * weight;
          weightTotal += weight;
        }
      }
    });
    const recentWeightedAvg =
      weightTotal > 0
        ? weightedSum / weightTotal
        : filteredDaily.length > 0
          ? filteredDaily.reduce((acc, v) => acc + v, 0) / filteredDaily.length
          : overallDailyAverage;

    let projected = monthTotal + recentWeightedAvg * remainingDays;

    // Ajuste final: média aparada dos últimos 14 dias para projeção mais realista
    const lastNDays = Math.min(14, daysElapsed);
    const windowStartTrim = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - (lastNDays - 1),
    );
    const windowDailyValues = Array.from(dailyTotals.entries())
      .filter(([day]) => {
        const d = new Date(today.getFullYear(), today.getMonth(), day);
        return d >= windowStartTrim && d <= today;
      })
      .map(([, value]) => value);
    if (windowDailyValues.length >= 3) {
      const sorted = [...windowDailyValues].sort((a, b) => a - b);
      const trim = Math.floor(sorted.length * 0.1);
      const trimmed = sorted.slice(trim, sorted.length - trim);
      const base = trimmed.length > 0 ? trimmed : sorted;
      const recentDailyAverage =
        base.reduce((acc, v) => acc + v, 0) / base.length;
      projected = monthTotal + recentDailyAverage * remainingDays;
    }

    return projected;
  };

  // Calculate chartData with useMemo early to comply with Rules of Hooks
  const chartData = useMemo(() => {
    return evolutionData.map((data, index) => {
      const isLastMonth = index === evolutionData.length - 1;
      const budget = monthlySummary?.budget ?? 0;
      const isCurrentMonth =
        selectedMonth === new Date().getMonth() &&
        selectedYear === new Date().getFullYear();

      // Calculate projectedTotal inside useMemo
      const filteredExp = expenses.filter((e) => {
        const expenseDate = new Date(e.date);
        return (
          expenseDate.getMonth() === selectedMonth &&
          expenseDate.getFullYear() === selectedYear
        );
      });
      const totalSpentMonth = filteredExp.reduce((acc, e) => acc + e.amount, 0);
      const projectedTotal = getProjectedTotalForMonth(
        filteredExp,
        totalSpentMonth,
        selectedYear,
        selectedMonth,
      );

      return {
        month: data.month,
        total: data.total,
        budget: data.budget || budget,
        projection: isLastMonth && isCurrentMonth ? projectedTotal : data.total,
      };
    });
  }, [evolutionData, monthlySummary, selectedMonth, selectedYear, expenses]);

  if (loading) return <p>Carregando...</p>;

  const formatCurrency = (value?: number) => {
    if (value === undefined) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleMonthChange = (direction: number) => {
    const newDate = new Date(selectedYear, selectedMonth + direction);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const handleSaveCategoryLimits = async (
    limits: Record<number, number | null>,
  ) => {
    try {
      const promises = Object.entries(limits).map(([id, limit]) => {
        return categoryService.update(Number(id), { limit });
      });

      await Promise.all(promises);
      await loadCategories();

      toast.success("Limites atualizados com sucesso!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Erro ao salvar limites.");
    }
  };

  const goToCurrentMonth = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleUpdateExpense = async (
    updatedData: Partial<UpdateExpenseDto>,
  ) => {
    if (!editingExpense) return;

    try {
      const updatedExpense = await expenseService.update(
        editingExpense.id,
        updatedData,
      );

      setNewlyCreatedExpenses((prev) =>
        prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)),
      );

      await loadExpenses();

      setIsEditModalOpen(false);
      setEditingExpense(null);
      toast.success("Gasto atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar gasto:", error);
      toast.error("Erro ao atualizar gasto.");
    }
  };

  const handleDeleteInModal = async (id: number) => {
    try {
      await expenseService.delete(id);
      setNewlyCreatedExpenses((prev) => prev.filter((e) => e.id !== id));
      await loadExpenses();
      toast.success("Gasto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir gasto:", error);
      toast.error("Erro ao excluir gasto.");
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const createdExpenses = await expenseService.uploadStatement(file);
      setNewlyCreatedExpenses(createdExpenses);
      setIsExpensesModalOpen(true);
      await loadExpenses();
      await loadCategories();
      toast.success("Extrato importado! Verifique os gastos criados.");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(
        `Erro ao importar extrato: ${error.message || "Erro desconhecido"}`,
      );
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast.error("Por favor, selecione um arquivo no formato CSV.");
        // Clear the input to allow re-selection of a correct file
        event.target.value = "";
        return;
      }
      uploadFile(file);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // ordena do mais recente pro mais antigo
    .slice(0, 10); // pega os 10 últimos gastoso

  const budget = monthlySummary?.budget ?? 0;
  const spent = monthlySummary?.total ?? 0;
  const percentageUsed = budget > 0 ? (spent / budget) * 100 : 0; // Recalculate percentage based on monthly values
  const remaining = budget - spent;
  const isOverBudgetForSelected = budget > 0 && spent > budget;
  const budgetStatusColor =
    isOverBudgetForSelected
      ? "bg-red-500"
      : percentageUsed >= 75
        ? "bg-amber-500"
        : "bg-emerald-600";

  // Total gasto no mês selecionado pelo usuario
  // Exclusão de gastos recorrentes automáticos se não for premium
  const filteredExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    const isInSelectedMonth =
      expenseDate.getMonth() === selectedMonth &&
      expenseDate.getFullYear() === selectedYear;

    // Se não for premium, exclui gastos recorrentes criados automaticamente
    if (!isPremium && e.isRecurring) {
      return false;
    }

    return isInSelectedMonth;
  });

  const totalSpentMonth = filteredExpenses.reduce(
    (acc, e) => acc + e.amount,
    0,
  );

  // Média diária
  // 1. Identificar se o mês visualizado é o atual, passado ou futuro
  const today = new Date();
  const isCurrentMonth =
    selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
  const isPastMonth =
    new Date(selectedYear, selectedMonth) <
    new Date(today.getFullYear(), today.getMonth());

  // 2. Quantidade de dias para o cálculo da média
  const daysInSelectedMonth = new Date(
    selectedYear,
    selectedMonth + 1,
    0,
  ).getDate();

  let daysToDivide = daysInSelectedMonth; // Para meses passados, divide pelo mês cheio
  if (isCurrentMonth) {
    daysToDivide = today.getDate(); // Divide pelos dias decorridos até hoje
  } else if (!isPastMonth) {
    daysToDivide = 1; // Evita divisão por zero em meses futuros
  }

  // 3. Cálculos
  const dailyAverage = totalSpentMonth / daysToDivide;

  // --- Lógica de Projeção (sempre mês atual) ---
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentMonthExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear &&
      (isPremium || !e.isRecurring)
    );
  });
  const currentMonthTotal = currentMonthExpenses.reduce(
    (acc, e) => acc + e.amount,
    0,
  );
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const remainingDays = daysInMonth - today.getDate();

  // 1. Projeção baseada na tendência recente (últimos 7 dias)
  const projectedTotal = getProjectedTotalForMonth(
    currentMonthExpenses,
    currentMonthTotal,
    currentYear,
    currentMonth,
  );

  // 2. Quanto o usuário AINDA PODE gastar por dia para não estourar o orçamento
  // Fórmula: (Orçamento - Total Gasto) / Dias Restantes
  const safetyDailyBudget =
    remainingDays > 0
      ? Math.max(0, (budget - currentMonthTotal) / remainingDays)
      : 0;

  // 3. Status da Projeção
  const isOverBudget = projectedTotal > budget && budget > 0;

  const kpiCards = [
    {
      id: "projected",
      label: "Projeção Final (mês atual)",
      value: projectedTotal,
      // O texto de detalhe carrega a cor, não o valor grande
      detail: isOverBudget
        ? `Estouro de ${formatCurrency(projectedTotal - budget)}`
        : "Dentro do orçamento",
      detailColor: isOverBudget ? "text-red-600" : "text-emerald-600",
    },
    {
      id: "safety",
      label: "Limite Diário",
      value: safetyDailyBudget,
      detail: "Para não estourar",
      detailColor: "text-slate-400", // Neutro
    },
    {
      id: "avg",
      label: "Média Diária",
      value: dailyAverage,
      detail: `Últimos ${daysToDivide} dias`,
      detailColor: "text-slate-400", // Neutro
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "emerald";
      case "warning":
        return "amber";
      case "danger":
        return "red";
      default:
        return "slate";
    }
  };
  // Total gasto no mês atual (já temos)
  const totalMonth = totalSpentMonth || 1;

  // Calcula o breakdown real por categoria
  const categoryBreakdown = categories
    .map((cat) => {
      const expensesOfCat = filteredExpenses.filter(
        (e) => e.category.id === cat.id,
      );

      const totalValue = expensesOfCat.reduce((acc, e) => acc + e.amount, 0);

      return {
        name: cat.name,
        value: totalValue,
        color: cat.color,
        budget: cat.limit ?? null,
        percentage: Math.round((totalValue / totalMonth) * 100),
      };
    })
    .filter((cat) => cat.value > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const getDailyExpenses = () => {
    const map = new Map<number, number>();

    filteredExpenses.forEach((expense) => {
      const day = new Date(expense.date).getDate();
      map.set(day, (map.get(day) || 0) + expense.amount);
    });

    const totalDaysInMonth = new Date(
      selectedYear,
      selectedMonth + 1,
      0,
    ).getDate();

    return Array.from({ length: totalDaysInMonth }, (_, i) => ({
      day: i + 1,
      total: map.get(i + 1) || 0,
    }));
  };

  const categoriesWithLimit = categoryBreakdown.filter(
    (c) => c.budget && c.budget > 0,
  );
  const hasAnyLimit = categoriesWithLimit.length > 0;

  const dailyExpensesData = getDailyExpenses();

  const dailyAverageLine =
    dailyExpensesData.reduce((acc, d) => acc + d.total, 0) /
    Math.max(1, new Date().getDate());

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Period Selector & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Visualizando</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleMonthChange(-1)} // Function to navigate to previous month
                className="p-1.5 rounded-full hover:bg-stone-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h1 className="text-lg font-semibold text-slate-900">
                {new Date(selectedYear, selectedMonth).toLocaleString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </h1>
              <button
                onClick={() => handleMonthChange(1)} // Function to navigate to next month
                className="p-1.5 rounded-full hover:bg-stone-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={goToCurrentMonth} // Function to go to current month
                className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-sm"
              >
                <span>Este mês</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <Clock className="w-4 h-4" />
              <span>{daysRemaining} dias restantes</span>
              <span>•</span>
              <span>Atualizado agora</span>
            </div>
          </div>

          {isPremium ? (
            <>
              <label
                htmlFor="extract-upload"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm"
              >
                <Upload size={18} />
                Importar Extrato
              </label>

              <input
                type="file"
                id="extract-upload"
                className="hidden"
                onChange={handleFileChange}
              />

              <ReportGenerator
                isPremium={isPremium}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  toast.info(
                    "Recurso disponível apenas para usuários Premium 🚀",
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-600 rounded-xl cursor-not-allowed"
              >
                <Upload size={18} />
                Importar Extrato (Premium)
              </button>

              <ReportGenerator
                isPremium={isPremium}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </>
          )}
        </div>
        {!isPremium && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-sm border border-emerald-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-wider text-emerald-100 font-semibold">
                  Plano Premium
                </div>
                <h2 className="text-2xl font-bold mt-1">
                  Desbloqueie relatórios, previsões e automações
                </h2>
                <p className="text-emerald-100 text-sm mt-2 max-w-2xl">
                  Tenha acesso a relatórios em PDF, projeções avançadas e
                  importação automática de extratos.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => stripeService.handlePremiumCheckout("monthly")}
                  className="px-5 py-2.5 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  Assinar Mensal
                </button>
                <button
                  onClick={() => stripeService.handlePremiumCheckout("yearly")}
                  className="px-5 py-2.5 bg-emerald-900/30 text-white font-semibold rounded-xl border border-white/30 hover:bg-emerald-900/40 transition-colors"
                >
                  Assinar Anual (20% off)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main KPI - Budget Overview */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">
                Status do Orçamento
              </div>
              <div className="flex items-baseline gap-3">
                <span
                  className="text-3xl font-bold text-slate-900"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatCurrency(spent)}
                </span>
                <span className="text-sm text-slate-600">
                  / {formatCurrency(budget)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar ALTERADA PARA EMERALD */}
          <div className="space-y-3">
            <div
              className={`relative h-4 bg-stone-100 rounded-full overflow-hidden ${isOverBudgetForSelected ? "ring-2 ring-red-500 ring-offset-2" : ""}`}
            >
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${budgetStatusColor}`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${budgetStatusColor}`}
                  />
                  <span className="text-slate-600">
                    {percentageUsed.toFixed(1)}% usado ({formatCurrency(spent)})
                  </span>
                </div>
              </div>
              <span className="font-semibold text-slate-800">
                {formatCurrency(remaining)} restantes
              </span>
            </div>
          </div>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.id}
              className={`bg-white rounded-xl border border-stone-200 p-5 shadow-sm hover:border-stone-300 transition-colors ${
                kpi.id === "projected" && !isPremium
                  ? "relative opacity-60"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {kpi.label}
                </div>
                {kpi.id === "projected" && !isPremium && (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Valor sempre neutro para um look mais Clean */}
              <div
                className="text-2xl font-bold text-slate-900 mb-2"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(kpi.value ?? 0)}
              </div>

              {/* A cor de alerta fica apenas aqui, no detalhe informativo */}
              <div
                className={`text-xs font-medium ${kpi.color || "text-slate-400"}`}
              >
                {kpi.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm relative overflow-hidden">
              {/* Overlay para usuários FREE */}
              {!isPremium && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[4px] transition-all">
                  <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-100 flex flex-col items-center text-center max-w-[280px]">
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      Análise de Evolução
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Visualize seu histórico financeiro dos últimos 6 meses e
                      identifique padrões.
                    </p>
                    <div className="flex w-full gap-2">
                      <button
                        onClick={() =>
                          stripeService.handlePremiumCheckout("monthly")
                        }
                        className="w-full py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Assinar Mensal
                      </button>
                      <button
                        onClick={() =>
                          stripeService.handlePremiumCheckout("yearly")
                        }
                        className="w-full py-2 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition-colors"
                      >
                        Assinar Anual (20% off)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="font-semibold text-slate-900 mb-2">
                    Evolução dos Gastos
                  </div>
                  <div className="text-xs text-slate-500">
                    {isPremium ? "Últimos 6 meses" : "Apenas mês atual (Free)"}
                  </div>
                </div>
              </div>

              <div
                style={{ width: "100%", height: 280 }}
                className={!isPremium ? "opacity-40" : ""}
              >
                {evolutionData && evolutionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e7e5e4",
                        }}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Line
                        type="monotone"
                        dataKey="budget"
                        stroke="#cbd5e1"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#059669"
                        strokeWidth={3}
                        dot={{ fill: "#059669", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      {isCurrentMonth &&
                        isPremium && ( // Só mostra projeção no gráfico se for Premium
                          <Line
                            type="monotone"
                            dataKey="projection"
                            stroke={isOverBudget ? "#ef4444" : "#10b981"}
                            strokeWidth={3}
                            strokeDasharray="8 4"
                            dot={{ r: 4 }}
                          />
                        )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className="text-slate-500">
                      Sem dados de evolução para exibir.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <div className="font-semibold text-slate-900 mb-2">
                Distribuição por Categoria
              </div>
              <div className="text-xs text-slate-500 mb-4">
                Onde seu dinheiro está indo
              </div>

              <div className="space-y-4">
                {!hasAnyLimit ? (
                  /* =========================
       ESTÁGIO 1 — nenhum limite
       ========================= */
                  <div className="text-center py-8 border border-dashed border-stone-300 rounded-xl">
                    <p className="text-xs text-slate-500 mb-4">
                      Defina limites para acompanhar quanto cada categoria
                      consome do seu orçamento.
                    </p>

                    <button
                      onClick={() => setIsCategoryLimitsOpen(true)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Definir limites
                    </button>
                  </div>
                ) : (
                  /* =========================
       ESTÁGIO 2 — alguns limites
       ========================= */
                  <>
                    <p className="text-xs text-slate-500 mb-3">
                      Mostrando {categoriesWithLimit.length} de{" "}
                      {categoryBreakdown.length} categorias com limite definido
                    </p>

                    {categoriesWithLimit.map((category) => {
                      const percent = (category.value / category.budget!) * 100;

                      return (
                        <div key={category.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-sm font-medium text-slate-900">
                                {category.name}
                              </span>
                            </div>

                            <span
                              className="text-sm font-medium text-slate-900"
                              style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              R$ {category.value.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1 relative h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(percent, 100)}%`,
                                  backgroundColor:
                                    percent >= 100 ? "#ef4444" : category.color,
                                }}
                              />
                            </div>

                            <span className="text-xs font-medium text-slate-500 min-w-[60px] text-right">
                              {percent.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="mb-4">
            <div className="font-semibold text-slate-900">
              Gastos por Dia do Mês
            </div>
            <div className="text-xs text-slate-500">
              Identifique picos de gasto ao longo do mês
            </div>
          </div>

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyExpensesData}>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e7e5e4",
                    fontSize: "12px",
                  }}
                />

                {/* Linha da média */}
                <ReferenceLine
                  y={dailyAverageLine}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{
                    value: "Média diária",
                    position: "right",
                    fill: "#f59e0b",
                    fontSize: 12,
                  }}
                />

                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-slate-900 mb-2">
                Atividade Recente
              </div>
              <div className="text-xs text-slate-500">
                Últimos gastos registrados
              </div>
            </div>
            {/* LINK ALTERADO PARA EMERALD */}
            <Link
              to="/gastos"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              Ver todos
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left text-xs font-medium text-slate-500 pb-3">
                    Data
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 pb-3">
                    Descrição
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 pb-3">
                    Categoria
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 pb-3">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-4 text-slate-400 text-xs"
                    >
                      Nenhum gasto registrado ainda
                    </td>
                  </tr>
                )}

                {expenses
                  .slice(-5)
                  .reverse()
                  .map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-stone-50 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 text-sm text-slate-600">
                        {new Date(expense.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="py-3 text-sm text-slate-900 font-medium">
                        {expense.description}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100">
                          {expense.category.name}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className="text-sm font-medium text-red-600"
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          -R$ {expense.amount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Modal de Boas-Vindas */}
        <WelcomeModal
          isOpen={isWelcomeModalOpen}
          onClose={() => {
            markWelcomeSeen();
            setIsWelcomeModalOpen(false);
          }}
          onSave={handleSaveInitialSettings}
          categories={categories}
          isLoading={loading}
        />

        <Modal
          isOpen={isExpensesModalOpen}
          onClose={() => setIsExpensesModalOpen(false)}
          title="Gastos Criados a Partir do Extrato"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Abaixo estão os gastos que foram importados do seu extrato. Você
              pode revisar, editar ou excluir cada um deles.
            </p>
            <div className="max-h-[40vh] overflow-y-auto pr-2">
              <ul className="space-y-3">
                {newlyCreatedExpenses.map((expense) => (
                  <li
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {expense.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(expense.date).toLocaleDateString("pt-BR")} â€¢{" "}
                        {expense.category.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="font-medium text-red-600"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        -{formatCurrency(expense.amount)}
                      </span>
                      <button
                        onClick={() => handleEditClick(expense)}
                        className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteInModal(expense.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setIsExpensesModalOpen(false)}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </Modal>

        <CategoryLimitsModal
          isOpen={isCategoryLimitsOpen}
          onClose={() => setIsCategoryLimitsOpen(false)}
          categories={categories}
          onSave={handleSaveCategoryLimits}
        />

        {editingExpense && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title={`Editar Gasto: ${editingExpense.description}`}
          >
            <ExpenseForm
              expense={editingExpense}
              onSubmit={handleUpdateExpense}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </Modal>
        )}
      </div>
    </PageTransition>
  );
}
