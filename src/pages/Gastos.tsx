import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Calendar,
  DollarSign,
  Tag,
  RefreshCw,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import expenseService from "../services/expenseService";
import categoryService from "../services/categoryService";
import type { Category } from "../types/category";
import type { Expense } from "../types/expense";
import type { CreateExpenseDto } from "../types/createExpense.dto";
import { PageTransition } from "../components/PageTransition";

export function Gastos() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "description">(
    "date",
  );
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minAmount, setMinAmount] = useState<number | "">("");
  const [maxAmount, setMaxAmount] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "recurring" | "deductible" | "none"
  >("all");
  const [showFilters, setShowFilters] = useState(false);
  const [quickDateFilter, setQuickDateFilter] = useState<
    "today" | "week" | "month" | "quarter" | "year" | "custom"
  >("month");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [newExpense, setNewExpense] = useState<CreateExpenseDto>({
    description: "",
    amount: 0,
    date: "",
    categoryId: 0,
    isRecurring: false,
    isDeductible: false,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<number[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesData, categoriesData] = await Promise.all([
          expenseService.getAll(),
          categoryService.getAll(),
        ]);
        setExpenses(expensesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Aplicar filtros rápidos de data
    const today = new Date();
    const start = new Date();

    switch (quickDateFilter) {
      case "today": {
        const localToday = new Date();
        // Formata como YYYY-MM-DD usando a data local
        const year = localToday.getFullYear();
        const month = String(localToday.getMonth() + 1).padStart(2, "0");
        const day = String(localToday.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        setDateStart(formattedDate);
        setDateEnd(formattedDate);
        break;
      }
      case "week":
        start.setDate(today.getDate() - 7);
        setDateStart(start.toISOString().split("T")[0]);
        setDateEnd(today.toISOString().split("T")[0]);
        break;
      case "month":
        start.setMonth(today.getMonth() - 1);
        setDateStart(start.toISOString().split("T")[0]);
        setDateEnd(today.toISOString().split("T")[0]);
        break;
      case "quarter":
        start.setMonth(today.getMonth() - 3);
        setDateStart(start.toISOString().split("T")[0]);
        setDateEnd(today.toISOString().split("T")[0]);
        break;
      case "year":
        start.setFullYear(today.getFullYear() - 1);
        setDateStart(start.toISOString().split("T")[0]);
        setDateEnd(today.toISOString().split("T")[0]);
        break;
      case "custom":
        // Mantém as datas personalizadas
        break;
    }
  }, [quickDateFilter]);

  const handleCreateExpense = async () => {
    try {
      const createdExpense = await expenseService.create(newExpense);
      setExpenses([...expenses, createdExpense]);
      setShowModal(false);
      setNewExpense({
        description: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        categoryId: 0,
        isRecurring: false,
        isDeductible: false,
      });
      toast.success("Gasto criado com sucesso!");
    } catch (error) {
      console.error("Failed to create expense", error);
      toast.error("Erro ao criar gasto. Tente novamente.");
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setShowEditModal(true);
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;

    try {
      const updatedExpense = await expenseService.update(editingExpense.id, {
        description: editingExpense.description,
        amount: editingExpense.amount,
        date: editingExpense.date,
        categoryId: editingExpense.category.id,
        isRecurring: editingExpense.isRecurring,
        isDeductible: editingExpense.isDeductible,
      });
      setExpenses(
        expenses.map((e) => (e.id === editingExpense.id ? updatedExpense : e)),
      );
      setShowEditModal(false);
      setEditingExpense(null);
      toast.success("Gasto atualizado com sucesso!");
    } catch (error) {
      console.error("Failed to update expense", error);
      toast.error("Erro ao atualizar gasto. Tente novamente.");
    }
  };

  const handleDeleteClick = (expense: Expense) => {
    setDeletingExpense(expense);
    setShowDeleteModal(true);
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setDateStart("");
    setDateEnd("");
    setSelectedCategories([]);
    setMinAmount("");
    setMaxAmount("");
    setStatusFilter("all");
    setQuickDateFilter("month");
    setCurrentPage(1);
  };
  const toggleSelectExpense = (id: number) => {
    setSelectedExpenseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedExpenseIds.length === paginatedExpenses.length) {
      setSelectedExpenseIds([]);
    } else {
      setSelectedExpenseIds(paginatedExpenses.map((e) => e.id));
    }
  };
  // Abre o modal para múltiplos
  const handleDeleteMultipleClick = () => {
    if (selectedExpenseIds.length === 0) {
      toast.error("Selecione ao menos um gasto para excluir.");
      return;
    }
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  // Função unificada que o botão "Confirmar" do modal vai chamar
  const handleConfirmDelete = async () => {
    try {
      if (isBulkDelete) {
        // Lógica para múltiplos
        await Promise.all(
          selectedExpenseIds.map((id) => expenseService.delete(id)),
        );
        setExpenses(expenses.filter((e) => !selectedExpenseIds.includes(e.id)));
        setSelectedExpenseIds([]);
        toast.success(`${selectedExpenseIds.length} gastos excluídos!`);
      } else if (deletingExpense) {
        // Lógica para um único (já existente)
        await expenseService.delete(deletingExpense.id);
        setExpenses(expenses.filter((e) => e.id !== deletingExpense.id));
        toast.success("Gasto excluído com sucesso!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir. Tente novamente.");
    } finally {
      setShowDeleteModal(false);
      setDeletingExpense(null);
      setIsBulkDelete(false);
    }
  };

  const filteredExpenses = expenses
    .filter((expense) => {
      // Filtro de texto
      const descMatch = expense.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const catMatch =
        expense.category &&
        expense.category.name.toLowerCase().includes(searchTerm.toLowerCase());
      const textMatch = descMatch || catMatch;

      // Filtro de período
      const expenseDate = new Date(expense.date);
      let dateMatch = true;
      if (dateStart) {
        const startDate = new Date(dateStart + "T00:00:00");
        startDate.setHours(0, 0, 0, 0);
        dateMatch = expenseDate >= startDate;
      }
      if (dateEnd) {
        const endDate = new Date(dateEnd + "T23:59:59");
        endDate.setHours(23, 59, 59, 999);
        dateMatch = dateMatch && expenseDate <= endDate;
      }

      // Filtro de categoria
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(expense.category.id);

      // Filtro de valor
      const amountMatch =
        (!minAmount || expense.amount >= minAmount) &&
        (!maxAmount || expense.amount <= maxAmount);

      // Filtro de status
      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "recurring" && expense.isRecurring) ||
        (statusFilter === "deductible" && expense.isDeductible) ||
        (statusFilter === "none" &&
          !expense.isRecurring &&
          !expense.isDeductible);

      return (
        textMatch && dateMatch && categoryMatch && amountMatch && statusMatch
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return sortOrder === "desc"
            ? b.amount - a.amount
            : a.amount - b.amount;
        case "description":
          return sortOrder === "desc"
            ? b.description.localeCompare(a.description)
            : a.description.localeCompare(b.description);
        case "date":
        default: {
          const da = new Date(a.date).getTime();
          const db = new Date(b.date).getTime();
          return sortOrder === "desc" ? db - da : da - db;
        }
      }
    });

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Métricas
  const totalAmount = filteredExpenses.reduce(
    (sum, exp) => sum + Math.abs(exp.amount),
    0,
  );
  const avgAmount =
    filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;
  const recurringCount = filteredExpenses.filter((e) => e.isRecurring).length;
  const deductibleAmount = filteredExpenses
    .filter((e) => e.isDeductible)
    .reduce((sum, exp) => sum + Math.abs(exp.amount), 0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getDateRangeLabel = () => {
    if (!dateStart && !dateEnd) return "Todo período";
    const start = dateStart
      ? new Date(dateStart).toLocaleDateString("pt-BR")
      : "";
    const end = dateEnd ? new Date(dateEnd).toLocaleDateString("pt-BR") : "";
    return `${start} - ${end}`;
  };

  // Mobile menu for filters
  const MobileFilterMenu = () => (
    <div
      className={`md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 ${mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >
      <div
        className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-800">Filtros</h2>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-120px)]">
          {/* Quick Date Filters Mobile */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Período</h3>
            <div className="grid grid-cols-2 gap-2">
              {["today", "week", "month", "quarter", "year"].map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setQuickDateFilter(period as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${quickDateFilter === period ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-slate-600 hover:bg-stone-200"}`}
                >
                  {period === "today"
                    ? "Hoje"
                    : period === "week"
                      ? "7 dias"
                      : period === "month"
                        ? "30 dias"
                        : period === "quarter"
                          ? "Trimestre"
                          : "1 ano"}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Mobile */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">
              Categorias
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-stone-50 rounded-lg">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 text-emerald-600 border-stone-300 rounded"
                  />
                  <span className="text-slate-700">
                    {category.icon} {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount Range Mobile */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Valor</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-600 mb-1 block">
                  Mínimo
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={minAmount}
                    onChange={(e) =>
                      setMinAmount(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full pl-10 pr-3 py-2.5 border border-stone-200 rounded-lg bg-white"
                  />
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-600 mb-1 block">
                  Máximo
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    placeholder="10.000,00"
                    value={maxAmount}
                    onChange={(e) =>
                      setMaxAmount(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full pl-10 pr-3 py-2.5 border border-stone-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Filter Mobile */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "all", label: "Todos", color: "bg-slate-100" },
                {
                  value: "recurring",
                  label: "Recorrentes",
                  color: "bg-blue-50",
                },
                {
                  value: "deductible",
                  label: "Dedutíveis",
                  color: "bg-purple-50",
                },
                { value: "none", label: "Sem tags", color: "bg-stone-50" },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value as any)}
                  className={`px-3 py-2.5 rounded-lg transition-all ${statusFilter === status.value ? "border-2 border-emerald-500" : "border border-stone-200"} ${status.color}`}
                >
                  <span className="font-medium text-slate-700 text-sm">
                    {status.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Mobile */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">
              Período Personalizado
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-600 mb-1 block">De</span>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => {
                    setDateStart(e.target.value);
                    setQuickDateFilter("custom");
                  }}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-slate-600 bg-white"
                />
              </div>
              <div>
                <span className="text-xs text-slate-600 mb-1 block">Até</span>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => {
                    setDateEnd(e.target.value);
                    setQuickDateFilter("custom");
                  }}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-slate-600 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Sort Options Mobile */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">
              Ordenar por
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "date", label: "Data" },
                { value: "amount", label: "Valor" },
                { value: "description", label: "Descrição" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`px-3 py-2.5 rounded-lg transition-all ${sortBy === option.value ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-slate-600 hover:bg-stone-200"}`}
                >
                  <span className="font-medium text-sm">{option.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setSortOrder("desc")}
                className={`px-3 py-2.5 rounded-lg transition-all ${sortOrder === "desc" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-slate-600 hover:bg-stone-200"}`}
              >
                <span className="font-medium text-sm">Decrescente</span>
              </button>
              <button
                onClick={() => setSortOrder("asc")}
                className={`px-3 py-2.5 rounded-lg transition-all ${sortOrder === "asc" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-slate-600 hover:bg-stone-200"}`}
              >
                <span className="font-medium text-sm">Crescente</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-stone-200 bg-white">
          <div className="flex gap-3">
            <button
              onClick={() => {
                resetFilters();
                setMobileMenuOpen(false);
              }}
              className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-stone-100 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Limpar Tudo
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl text-slate-800 font-bold mb-1">
              Gestão de Gastos
            </h1>
            <p className="text-sm md:text-base text-slate-500">
              Visualize e controle suas despesas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-all font-medium"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all font-semibold shadow-lg shadow-emerald-200"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Novo Gasto</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
        </div>

        {/* Painel de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-emerald-100 ">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-600 font-bold text-xs md:text-sm">
                TOTAL
              </span>
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-800 truncate">
              {totalAmount.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <div className="text-slate-500 text-xs md:text-sm mt-1">
              {filteredExpenses.length} trans.
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 font-bold text-xs md:text-sm">
                MÉDIA
              </span>
              <Tag className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-800 truncate">
              {avgAmount.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <div className="text-slate-500 text-xs md:text-sm mt-1 ">
              Valor médio
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-purple-100 col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 font-bold text-xs md:text-sm">
                DEDUTÍVEL
              </span>
              <RefreshCw className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-800 truncate">
              {deductibleAmount.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <div className="text-slate-500 text-xs md:text-sm mt-1">
              Economia
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-amber-100 col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-600 font-bold text-xs md:text-sm">
                RECORRENTES
              </span>
              <RefreshCw className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-800">
              {recurringCount}
            </div>
            <div className="text-slate-500 text-xs md:text-sm mt-1">
              Despesas fixas
            </div>
          </div>
        </div>

        {/* Desktop Filters (Hidden on Mobile) */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm p-4 border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800">Filtros</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1"
              >
                {showFilters ? "Ocultar" : "Mais filtros"}
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Limpar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Filtros Rápidos */}
            <div className="flex flex-wrap gap-2">
              {["today", "week", "month", "quarter", "year", "custom"].map(
                (period) => (
                  <button
                    key={period}
                    onClick={() => setQuickDateFilter(period as any)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all ${quickDateFilter === period ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-slate-600 hover:bg-stone-200"}`}
                  >
                    {period === "today" ? (
                      "Hoje"
                    ) : period === "week" ? (
                      "7 dias"
                    ) : period === "month" ? (
                      "30 dias"
                    ) : period === "quarter" ? (
                      "Trimestre"
                    ) : period === "year" ? (
                      "1 ano"
                    ) : (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />{" "}
                        Personalizado
                      </span>
                    )}
                  </button>
                ),
              )}
            </div>

            {/* Barra de Pesquisa e Filtros Básicos */}
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por descrição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm md:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "date" | "amount" | "description",
                    )
                  }
                  className="px-3 md:px-4 py-2 md:py-2.5 border border-stone-200 rounded-xl bg-white text-slate-600 font-medium cursor-pointer text-sm md:text-base"
                >
                  <option value="date">Ordenar por data</option>
                  <option value="amount">Ordenar por valor</option>
                  <option value="description">Ordenar por descrição</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  className="px-3 md:px-4 py-2 md:py-2.5 border border-stone-200 rounded-xl bg-white text-slate-600 font-medium cursor-pointer text-sm md:text-base"
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>

            {/* Filtros Avançados */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-stone-200">
                {/* Filtro por Categoria */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Categorias
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="w-4 h-4 text-emerald-600 border-stone-300 rounded"
                        />
                        <span className="text-slate-600 text-sm">
                          {category.icon} {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro por Valor */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Faixa de Valor
                  </label>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">
                        Valor mínimo
                      </span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                          R$
                        </span>
                        <input
                          type="number"
                          placeholder="0,00"
                          value={minAmount}
                          onChange={(e) =>
                            setMinAmount(
                              e.target.value ? Number(e.target.value) : "",
                            )
                          }
                          className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">
                        Valor máximo
                      </span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                          R$
                        </span>
                        <input
                          type="number"
                          placeholder="10.000,00"
                          value={maxAmount}
                          onChange={(e) =>
                            setMaxAmount(
                              e.target.value ? Number(e.target.value) : "",
                            )
                          }
                          className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtro por Status */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Status
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "Todos", color: "bg-slate-100" },
                      {
                        value: "recurring",
                        label: "Recorrentes",
                        color: "bg-blue-50",
                      },
                      {
                        value: "deductible",
                        label: "Dedutíveis",
                        color: "bg-purple-50",
                      },
                      {
                        value: "none",
                        label: "Sem tags",
                        color: "bg-stone-50",
                      },
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => setStatusFilter(status.value as any)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${statusFilter === status.value ? "border-2 border-emerald-500" : "border border-stone-200"} ${status.color}`}
                      >
                        <span className="font-medium text-slate-700">
                          {status.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Período Personalizado */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Período Personalizado
                  </label>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">
                        Data inicial
                      </span>
                      <input
                        type="date"
                        value={dateStart}
                        onChange={(e) => {
                          setDateStart(e.target.value);
                          setQuickDateFilter("custom");
                        }}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-slate-600 text-sm"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">
                        Data final
                      </span>
                      <input
                        type="date"
                        value={dateEnd}
                        onChange={(e) => {
                          setDateEnd(e.target.value);
                          setQuickDateFilter("custom");
                        }}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-slate-600 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden bg-white rounded-xl shadow-sm p-3 border border-stone-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar gastos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Indicador de Filtros Ativos */}
        {(searchTerm ||
          selectedCategories.length > 0 ||
          minAmount ||
          maxAmount ||
          statusFilter !== "all" ||
          dateStart ||
          dateEnd) && (
          <div className="flex items-center flex-wrap gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <span className="text-xs md:text-sm font-medium text-emerald-700">
              Filtros:
            </span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full text-xs">
                "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 text-emerald-400 hover:text-emerald-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategories.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full text-xs">
                {selectedCategories.length} cat.
                <button
                  onClick={() => setSelectedCategories([])}
                  className="ml-1 text-emerald-400 hover:text-emerald-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(minAmount || maxAmount) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full text-xs">
                {minAmount ? `Min: ${minAmount}` : ""}{" "}
                {maxAmount ? `Max: ${maxAmount}` : ""}
                <button
                  onClick={() => {
                    setMinAmount("");
                    setMaxAmount("");
                  }}
                  className="ml-1 text-emerald-400 hover:text-emerald-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full text-xs">
                {statusFilter === "recurring"
                  ? "Recorrentes"
                  : statusFilter === "deductible"
                    ? "Dedutíveis"
                    : "Sem tags"}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="ml-1 text-emerald-400 hover:text-emerald-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(dateStart || dateEnd) && quickDateFilter === "custom" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full text-xs">
                Período
                <button
                  onClick={() => {
                    setDateStart("");
                    setDateEnd("");
                    setQuickDateFilter("month");
                  }}
                  className="ml-1 text-emerald-400 hover:text-emerald-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition-all"
            >
              <XCircle className="w-3 h-3" />
              Limpar tudo
            </button>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {/* BARRA DE AÇÕES EM MASSA */}
          {selectedExpenseIds.length > 0 && (
            <div className="bg-emerald-50 p-3 border-b border-emerald-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    selectedExpenseIds.length === paginatedExpenses.length
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 ml-3"
                />
                <span className="text-emerald-700 text-sm font-bold">
                  {selectedExpenseIds.length} selecionados
                </span>
              </div>
              <button
                onClick={handleDeleteMultipleClick}
                className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-bold shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Excluir selecionados
              </button>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-stone-200 text-slate-500 font-medium">
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        paginatedExpenses.length > 0 &&
                        selectedExpenseIds.length === paginatedExpenses.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="text-right px-6 py-4">Valor</th>
                  <th className="text-center px-6 py-4">Status/Tags</th>
                  <th className="text-right px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedExpenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      Nenhum gasto encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className={`hover:bg-emerald-50/30 transition-colors group ${selectedExpenseIds.includes(expense.id) ? "bg-emerald-50/50" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedExpenseIds.includes(expense.id)}
                          onChange={() => toggleSelectExpense(expense.id)}
                          className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                        {new Date(expense.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-semibold max-w-xs truncate">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 px-2 py-1 bg-stone-100 w-fit rounded-lg group-hover:bg-white transition-colors">
                          <span>{expense.category.icon}</span>
                          <span className="text-slate-600 whitespace-nowrap">
                            {expense.category.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-500 whitespace-nowrap">
                        {expense.amount.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          {expense.isRecurring && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                              Recorrente
                            </span>
                          )}
                          {expense.isDeductible && (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                              Dedutível
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditClick(expense)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(expense)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Table (List/Cards View) */}
          <div className="hidden">
            {paginatedExpenses.map((expense) => (
              <div
                key={expense.id}
                className={`p-4 flex items-start gap-3 ${selectedExpenseIds.includes(expense.id) ? "bg-emerald-50/50" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selectedExpenseIds.includes(expense.id)}
                  onChange={() => toggleSelectExpense(expense.id)}
                  className="mt-1 w-5 h-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 truncate pr-2">
                      {expense.description}
                    </h4>
                    <span className="font-bold text-red-500 whitespace-nowrap">
                      {expense.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span>
                      {new Date(expense.date).toLocaleDateString("pt-BR")}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {expense.category.icon} {expense.category.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {expense.isRecurring && (
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold uppercase">
                        Fixa
                      </span>
                    )}
                    {expense.isDeductible && (
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded text-[9px] font-bold uppercase">
                        Dedutível
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEditClick(expense)}
                    className="p-2 text-slate-400 hover:text-emerald-600 bg-stone-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(expense)}
                    className="p-2 text-slate-400 hover:text-red-600 bg-stone-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-stone-100">
          {paginatedExpenses.map((expense) => (
            <div
              key={expense.id}
              className={`p-3 md:p-4 space-y-3 ${selectedExpenseIds.includes(expense.id) ? "bg-emerald-50/50" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedExpenseIds.includes(expense.id)}
                    onChange={() => toggleSelectExpense(expense.id)}
                    className="mt-2 w-5 h-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-100 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
                    {expense.category.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-900 font-bold text-sm md:text-base truncate">
                      {expense.description}
                    </div>
                    <div className="text-slate-500 text-xs md:text-sm">
                      {expense.category.name}
                    </div>
                  </div>
                </div>
                <div className="text-red-500 font-bold text-sm md:text-base whitespace-nowrap pl-2">
                  {expense.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-slate-400 font-medium">
                  {new Date(expense.date).toLocaleDateString("pt-BR")}
                </span>
                <div className="flex gap-1">
                  {expense.isRecurring && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] md:text-[10px] font-bold">
                      REC
                    </span>
                  )}
                  {expense.isDeductible && (
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[9px] md:text-[10px] font-bold">
                      DED
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => handleEditClick(expense)}
                  className="flex-1 py-2 text-slate-600 bg-stone-50 rounded-lg font-medium text-sm hover:bg-stone-100 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(expense)}
                  className="flex-1 py-2 text-red-600 bg-red-50 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination & Footer Info */}
        <div className="bg-stone-50/50 border-t border-stone-200 px-3 md:px-6 py-3 md:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
            <div className="grid grid-cols-3 gap-3 md:gap-4 lg:gap-8">
              <div>
                <div className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                  Total
                </div>
                <div className="text-slate-900 font-bold text-sm md:text-base truncate">
                  {totalAmount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
              <div>
                <div className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                  Transações
                </div>
                <div className="text-slate-900 font-bold text-sm md:text-base">
                  {filteredExpenses.length}
                </div>
              </div>
              <div>
                <div className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                  Média
                </div>
                <div className="text-emerald-700 font-bold text-sm md:text-base truncate">
                  {avgAmount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 md:gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 md:p-2 border border-stone-200 rounded-xl hover:bg-white hover:text-emerald-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <div className="text-xs md:text-sm font-semibold text-slate-600 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-stone-200 min-w-[80px] text-center">
                {currentPage} <span className="text-slate-300 mx-1">/</span>{" "}
                {totalPages}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 md:p-2 border border-stone-200 rounded-xl hover:bg-white hover:text-emerald-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-5 md:h-6 bg-emerald-500 rounded-full"></div>
                <h2 className="text-slate-800 font-bold text-base md:text-lg">
                  Novo Gasto
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 md:p-2 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded-full transition-all"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Assinatura Software"
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm md:text-base"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs md:text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    placeholder="0,00"
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-emerald-700 text-sm md:text-base"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        amount: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Categoria
                </label>
                <select
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-sm md:text-base"
                  value={newExpense.categoryId}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      categoryId: Number(e.target.value),
                    })
                  }
                >
                  <option value={0}>Selecione uma categoria...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Data
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm md:text-base"
                    value={newExpense.date}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm md:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 md:gap-3 pt-2">
                <label className="flex items-center gap-2 md:gap-3 group cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 md:w-5 md:h-5 border-stone-300 rounded-lg md:rounded-lg text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                    checked={newExpense.isRecurring}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        isRecurring: e.target.checked,
                      })
                    }
                  />
                  <span className="text-slate-700 font-medium text-sm md:text-base group-hover:text-emerald-700 transition-colors">
                    Gasto Recorrente
                  </span>
                </label>
                <label className="flex items-center gap-2 md:gap-3 group cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 md:w-5 md:h-5 border-stone-300 rounded-lg md:rounded-lg text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                    checked={newExpense.isDeductible}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        isDeductible: e.target.checked,
                      })
                    }
                  />
                  <span className="text-slate-700 font-medium text-sm md:text-base group-hover:text-emerald-700 transition-colors">
                    Item Dedutível (IR)
                  </span>
                </label>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-stone-100 bg-stone-50/50 flex gap-2 md:gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-3 md:px-4 py-2.5 md:py-3 text-slate-600 font-bold hover:bg-stone-200 rounded-xl md:rounded-2xl transition-all text-sm md:text-base"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateExpense}
                className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-emerald-600 text-white rounded-xl md:rounded-2xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-200 text-sm md:text-base"
              >
                Salvar Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-5 md:h-6 bg-emerald-500 rounded-full"></div>
                <h2 className="text-slate-800 font-bold text-base md:text-lg">
                  Editar Gasto
                </h2>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 md:p-2 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded-full transition-all"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Assinatura Software"
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm md:text-base"
                  value={editingExpense.description}
                  onChange={(e) =>
                    setEditingExpense({
                      ...editingExpense,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs md:text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    placeholder="0,00"
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-emerald-700 text-sm md:text-base"
                    value={editingExpense.amount}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        amount: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Categoria
                </label>
                <select
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-sm md:text-base"
                  value={editingExpense.category.id}
                  onChange={(e) => {
                    const category = categories.find(
                      (c) => c.id === Number(e.target.value),
                    );
                    if (category) {
                      setEditingExpense({ ...editingExpense, category });
                    }
                  }}
                >
                  <option value={0}>Selecione uma categoria...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Data
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm md:text-base"
                    value={editingExpense.date}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm md:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 md:gap-3 pt-2">
                <label className="flex items-center gap-2 md:gap-3 group cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 md:w-5 md:h-5 border-stone-300 rounded-lg md:rounded-lg text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                    checked={editingExpense.isRecurring}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        isRecurring: e.target.checked,
                      })
                    }
                  />
                  <span className="text-slate-700 font-medium text-sm md:text-base group-hover:text-emerald-700 transition-colors">
                    Gasto Recorrente
                  </span>
                </label>
                <label className="flex items-center gap-2 md:gap-3 group cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 md:w-5 md:h-5 border-stone-300 rounded-lg md:rounded-lg text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                    checked={editingExpense.isDeductible}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        isDeductible: e.target.checked,
                      })
                    }
                  />
                  <span className="text-slate-700 font-medium text-sm md:text-base group-hover:text-emerald-700 transition-colors">
                    Item Dedutível (IR)
                  </span>
                </label>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-stone-100 bg-stone-50/50 flex gap-2 md:gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-3 md:px-4 py-2.5 md:py-3 text-slate-600 font-bold hover:bg-stone-200 rounded-xl md:rounded-2xl transition-all text-sm md:text-base"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateExpense}
                className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-emerald-600 text-white rounded-xl md:rounded-2xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-200 text-sm md:text-base"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {isBulkDelete ? "Excluir Gastos" : "Excluir Gasto"}
              </h3>

              <p className="text-slate-500 mb-6">
                {isBulkDelete
                  ? `Tem certeza que deseja excluir os ${selectedExpenseIds.length} gastos selecionados? Esta ação não pode ser desfeita.`
                  : `Tem certeza que deseja excluir "${deletingExpense?.description}"? Esta ação não pode ser desfeita.`}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setIsBulkDelete(false);
                  }}
                  className="flex-1 px-4 py-2.5 border border-stone-200 text-slate-600 font-semibold rounded-xl hover:bg-stone-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-200"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Menu */}
      <MobileFilterMenu />
    </PageTransition>
  );
}
