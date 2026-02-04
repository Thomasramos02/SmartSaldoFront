import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import categoryService from '../services/categoryService';
import userService from '../services/userService'; // <--- NEW IMPORT
import type { Category } from '../types/category';
import type { UserProfile } from '../types/user'; // <--- NEW IMPORT
import { PageTransition } from '../components/PageTransition';

const colorOptions = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
];

const iconOptions = ['🍕', '🚗', '🏠', '🎮', '❤️', '📚', '✈️', '🛒', '💼', '🎬', '☕', '🏋️', '💊', '🐶', '🎁'];

export default function Categories() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Estado usa a interface real do Backend
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Estados do Formulário
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0]);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  
  // Renomeado de targetBudget para targetLimit para alinhar com o backend
  const [targetLimit, setTargetLimit] = useState(''); 

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Formatter para BRL
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      // O backend retorna um array de Category com { id, name, limit, total, count }
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setNewCategoryName('');
    setSelectedIcon(iconOptions[0]);
    setSelectedColor(colorOptions[0].value);
    setTargetLimit(''); // Limpa o campo de limite
  };

  // Determine user plan status and limits dynamically
  const isFreeUser = userProfile?.plan === 'free';
  const freeCategoryLimit = 5; // Assuming the free limit is 5, as enforced by the backend

  const handleCreateCategory = async () => {
    // Check if user is free and has reached the limit
    if (isFreeUser && categories.length >= freeCategoryLimit) {
      toast.error(
        "Você atingiu o limite de categorias para usuários gratuitos. Faça upgrade para o plano Premium para adicionar mais!",
        {
          duration: 6000,
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        }
      );
      setShowModal(false); // Close the modal
      return; // Prevent further execution
    }

    try {
      // Payload usando os nomes exatos do DTO do Backend
      const payload = {
        name: newCategoryName,
        icon: selectedIcon,
        color: selectedColor,
        limit: parseFloat(targetLimit) || 0, // Envia 'limit'
      };

      const newCategory = await categoryService.create(payload);
      
      // Adicionamos visualmente com total e count zerados (pois é nova)
      setCategories([...categories, { ...newCategory, total: 0, count: 0 }]);
      resetForm();
      toast.success("Categoria criada com sucesso!");
    } catch (error) {
      console.error('Failed to create category', error);
      toast.error("Erro ao criar categoria. Tente novamente.");
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setSelectedIcon(category.icon || iconOptions[0]);
    setSelectedColor(category.color || colorOptions[0].value);
    // Carrega o valor atual do limit no input
    setTargetLimit(category.limit ? category.limit.toString() : '');
    setShowEditModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const payload = {
        name: editingCategory.name,
        icon: selectedIcon,
        color: selectedColor,
        limit: parseFloat(targetLimit) || 0, // Envia 'limit'
      };

      const updatedCategory = await categoryService.update(editingCategory.id, payload);

      // Atualiza a lista local mantendo os dados de total/count antigos
      // (Geralmente o update retorna só a categoria, sem a soma das transações)
      setCategories(categories.map((c) => 
        c.id === updatedCategory.id 
          ? { ...updatedCategory, total: c.total, count: c.count } 
          : c
      ));

      setShowEditModal(false);
      setEditingCategory(null);
      toast.success("Categoria atualizada com sucesso!");
    } catch (error) {
      console.error('Failed to update category', error);
      toast.error("Erro ao atualizar categoria. Tente novamente.");
    }
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      await categoryService.delete(deletingCategory.id);
      setCategories(categories.filter((c) => c.id !== deletingCategory.id));
      setShowDeleteModal(false);
      setDeletingCategory(null);
      toast.success("Categoria excluída com sucesso!");
    } catch (error) {
      console.error('Failed to delete category', error);
      toast.error("Erro ao excluir categoria. Tente novamente.");
    }
  };

  // Lógica da Barra de Progresso usando 'total' e 'limit'
  const getProgressStats = (currentTotal: number, limit: number) => {
    if (!limit || limit === 0) return { percent: 0, color: 'bg-slate-200' };
    
    const percent = Math.min((currentTotal / limit) * 100, 100);
    
    let color = 'bg-emerald-500';
    if (percent >= 80) color = 'bg-amber-500';
    if (percent >= 100) color = 'bg-red-500';
    
    return { percent, color };
  };

  return (
    <PageTransition>
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl text-slate-800 font-extrabold tracking-tight">Categorias</h1>
          <p className="text-slate-500 mt-1">Gerencie limites e acompanhe gastos por setor.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all font-semibold shadow-lg shadow-emerald-200"
        >
          <Plus className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => {
          // Extraindo variáveis com os nomes do Backend
          const currentTotal = Number(category.total) || 0; // Backend: total
          const currentLimit = Number(category.limit) || 0; // Backend: limit
          const currentCount = Number(category.count) || 0; // Backend: count

          const { percent, color } = getProgressStats(currentTotal, currentLimit);
          const isOverLimit = currentLimit > 0 && currentTotal > currentLimit;

          return (
            <div key={category.id} className="group bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5
 transition-all duration-300 relative overflow-hidden hover:shadow-emerald-200/20
">
              
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight">{category.name}</h3>
                    <span className="text-xs font-medium text-slate-400">
                      {currentCount} transações
                    </span>
                  </div>
                </div>
                
                {/* Ações */}
                <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditClick(category)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteClick(category)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Valores */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${isOverLimit ? 'text-red-500' : 'text-slate-700'}`}>
                    {formatCurrency(currentTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium mt-1">
                  <span className="text-slate-400">
                    {currentLimit > 0 ? `Limite: ${formatCurrency(currentLimit)}` : 'Sem limite definido'}
                  </span>
                  {currentLimit > 0 && (
                    <span className={`${percent >= 90 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {percent.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden mb-5">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <button className="w-full py-2.5 rounded-xl border border-stone-200 text-slate-600 font-semibold text-sm hover:bg-stone-50 hover:border-emerald-200 hover:text-emerald-700 transition-all flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Ver Extrato
              </button>
            </div>
          );
        })}

        {/* Botão Card de Adicionar */}
        <button 
          onClick={() => setShowModal(true)}
          className="flex flex-col items-center justify-center min-h-[240px] rounded-3xl border-2 border-dashed border-stone-300 hover:border-emerald-400 hover:bg-emerald-50/10 transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-stone-50 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
            <Plus className="w-6 h-6 text-stone-400 group-hover:text-emerald-600" />
          </div>
          <span className="font-bold text-stone-500 group-hover:text-emerald-700">Criar Nova Categoria</span>
        </button>
      </div>

      {/* --- MODAL DE CRIAÇÃO --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-0 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Nova Categoria</h2>
              <button onClick={resetForm} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nome</label>
                <input 
                  autoFocus
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="Ex: Lazer"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
              </div>

              {/* Input de Limite */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Limite Mensal</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-medium">R$</span>
                  <input 
                    type="number" 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    placeholder="0,00"
                    value={targetLimit}
                    onChange={e => setTargetLimit(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-1">Deixe vazio para sem limite.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(icon => (
                    <button key={icon} onClick={() => setSelectedIcon(icon)} className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all ${selectedIcon === icon ? 'bg-emerald-100 border-2 border-emerald-500 shadow-sm' : 'bg-stone-50 border border-stone-200 hover:bg-stone-100'}`}>{icon}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Cor da Tag</label>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map(color => (
                    <button key={color.name} onClick={() => setSelectedColor(color.value)} className={`w-8 h-8 rounded-full transition-all ring-2 ring-offset-2 ${selectedColor === color.value ? 'ring-slate-400 scale-110' : 'ring-transparent hover:scale-110'}`} style={{ backgroundColor: color.value }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-100 flex gap-3">
              <button onClick={resetForm} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-stone-200 transition-colors">Cancelar</button>
              <button onClick={handleCreateCategory} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">Criar Categoria</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE EDIÇÃO --- */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-0 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Editar Categoria</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nome</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  value={editingCategory.name}
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Limite Mensal</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-medium">R$</span>
                  <input 
                    type="number" 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    value={targetLimit}
                    onChange={e => setTargetLimit(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(icon => (
                    <button key={icon} onClick={() => setSelectedIcon(icon)} className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all ${selectedIcon === icon ? 'bg-emerald-100 border-2 border-emerald-500 shadow-sm' : 'bg-stone-50 border border-stone-200 hover:bg-stone-100'}`}>{icon}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Cor da Tag</label>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map(color => (
                    <button key={color.name} onClick={() => setSelectedColor(color.value)} className={`w-8 h-8 rounded-full transition-all ring-2 ring-offset-2 ${selectedColor === color.value ? 'ring-slate-400 scale-110' : 'ring-transparent hover:scale-110'}`} style={{ backgroundColor: color.value }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-100 flex gap-3">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-stone-200 transition-colors">Cancelar</button>
              <button onClick={handleUpdateCategory} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE EXCLUSÃO --- */}
      {showDeleteModal && deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Excluir {deletingCategory.name}?</h2>
              <p className="text-slate-500 mb-6 text-sm">
                Isso removerá a categoria e pode afetar o histórico de gastos passados. Essa ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-stone-100 hover:bg-stone-200 transition-colors">Cancelar</button>
                <button onClick={handleDeleteCategory} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-colors">Sim, excluir</button>
              </div>
           </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
}