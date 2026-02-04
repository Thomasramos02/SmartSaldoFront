import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import goalService, { type CreateGoalDto, type UpdateGoalDto } from '../services/goalService';
import type { Goal } from '../types/goal';
import { PageTransition } from '../components/PageTransition';


export function Metas() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const initialFormData = { name: '', targetAmount: 0, currentAmount: 0, deadline: '' };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await goalService.getAll();
      setGoals(data);
    } catch (error) {
      toast.error('Falha ao carregar as metas.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (goal: Goal | null = null) => {
    if (goal) {
      setIsEditMode(true);
      setCurrentGoal(goal);
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
      });
    } else {
      setIsEditMode(false);
      setCurrentGoal(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const dto: CreateGoalDto | UpdateGoalDto = {
      name: formData.name,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount),
      deadline: formData.deadline || undefined,
    };

    try {
      if (isEditMode && currentGoal) {
        const updatedGoal = await goalService.update(currentGoal.id, dto);
        setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
        toast.success('Meta atualizada com sucesso!');
      } else {
        const newGoal = await goalService.create(dto as CreateGoalDto);
        setGoals([newGoal, ...goals]);
        toast.success('Meta criada com sucesso!');
      }
      closeModal();
    } catch (error) {
      toast.error(`Falha ao ${isEditMode ? 'atualizar' : 'criar'} a meta.`);
      console.error(error);
    }
  };

  const openDeleteAlert = (goal: Goal) => {
    setGoalToDelete(goal);
    setShowDeleteAlert(true);
  };

  const handleDelete = async () => {
    if (!goalToDelete) return;
    try {
      await goalService.delete(goalToDelete.id);
      setGoals(goals.filter(g => g.id !== goalToDelete.id));
      toast.success('Meta excluída com sucesso!');
      setShowDeleteAlert(false);
      setGoalToDelete(null);
    } catch (error) {
      toast.error('Falha ao excluir a meta.');
      console.error(error);
    }
  };
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <PageTransition>
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl text-slate-800 font-extrabold tracking-tight">Minhas Metas</h1>
          <p className="text-slate-500 mt-1">Defina objetivos e acompanhe seu progresso para alcançá-los.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all font-semibold shadow-lg shadow-emerald-200"
        >
          <Plus className="w-5 h-5" />
          Nova Meta
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Carregando metas...</p>
        ) : goals.length === 0 ? (
           <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-2xl border border-dashed border-stone-300">
             <Target className="w-12 h-12 mx-auto text-stone-400 mb-2"/>
             <h3 className="font-semibold text-slate-700">Nenhuma meta encontrada</h3>
             <p className="text-sm text-slate-500">Comece criando sua primeira meta financeira!</p>
           </div>
        ) : (
          goals.map((goal) => {
            const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <div key={goal.id} className="group bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 bg-emerald-100 text-emerald-600">
                      <Target/>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">{goal.name}</h3>
                      {goal.deadline && (
                        <span className="text-xs font-medium text-slate-400">
                          Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(goal)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => openDeleteAlert(goal)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="font-semibold text-emerald-600">{percentage.toFixed(1)}%</span>
                    <span className="text-slate-500">
                      {formatCurrency(goal.currentAmount)} / <span className="font-medium text-slate-700">{formatCurrency(goal.targetAmount)}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- MODAL DE CRIAÇÃO/EDIÇÃO --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-0 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Editar Meta' : 'Nova Meta'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Meta</label>
                <input 
                  autoFocus
                  type="text" 
                  name="name"
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="Ex: Viagem para a praia"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Valor Alvo (R$)</label>
                  <input 
                    type="number" 
                    name="targetAmount"
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="1000,00"
                    value={formData.targetAmount}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Valor Atual (R$)</label>
                  <input 
                    type="number" 
                    name="currentAmount"
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="250,00"
                    value={formData.currentAmount}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

               <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Prazo (Opcional)</label>
                <input 
                  type="date" 
                  name="deadline"
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  value={formData.deadline}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-100 flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-stone-200 transition-colors">Cancelar</button>
              <button onClick={handleSubmit} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                {isEditMode ? 'Salvar Alterações' : 'Criar Meta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE EXCLUSÃO --- */}
      {showDeleteAlert && goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Excluir meta "{goalToDelete.name}"?
            </h2>

            <p className="text-slate-500 mb-6 text-sm">
              Isso removerá a meta e seu histórico. Essa ação não pode ser desfeita.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteAlert(false);
                  setGoalToDelete(null);
                }}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
