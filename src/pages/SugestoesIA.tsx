import { useState } from 'react';
import { Sparkles, TrendingUp, Tag, Lightbulb, AlertTriangle, Check, X, ThumbsUp } from 'lucide-react';

interface Suggestion {
  id: number;
  type: 'categorization' | 'pattern' | 'insight' | 'alert';
  title: string;
  description: string;
  confidence?: number;
  status: 'pending' | 'accepted' | 'rejected';
  impact?: 'high' | 'medium' | 'low';
  timestamp: string;
  data?: any;
}

const mockSuggestions: Suggestion[] = [
  {
    id: 1,
    type: 'categorization',
    title: 'Categorização Sugerida',
    description: 'O gasto "Mercado Livre - Notebook" pode ser categorizado como "Eletrônicos" ao invés de "Compras"',
    confidence: 92,
    status: 'pending',
    impact: 'medium',
    timestamp: '2h atrás',
    data: { expense: 'Mercado Livre - Notebook', from: 'Compras', to: 'Eletrônicos' }
  },
  {
    id: 2,
    type: 'pattern',
    title: 'Padrão Recorrente Identificado',
    description: 'Detectamos que todo dia 5 você tem um gasto de R$ 39,90 com Netflix. Deseja marcar como recorrente?',
    confidence: 98,
    status: 'pending',
    impact: 'low',
    timestamp: '5h atrás',
    data: { expense: 'Netflix', amount: 39.90, frequency: 'mensal' }
  },
  {
    id: 3,
    type: 'insight',
    title: 'Oportunidade de Economia',
    description: 'Você pode economizar até R$ 180/mês reduzindo gastos com delivery. Seus pedidos aumentaram 45% no último mês.',
    confidence: 85,
    status: 'pending',
    impact: 'high',
    timestamp: 'Ontem',
    data: { category: 'Alimentação', savings: 180, increase: 45 }
  },
  {
    id: 4,
    type: 'alert',
    title: 'Alerta Preventivo',
    description: 'Com base no seu padrão de gastos, você pode ultrapassar o limite de Alimentação em 5 dias se continuar no ritmo atual.',
    confidence: 88,
    status: 'pending',
    impact: 'high',
    timestamp: 'Ontem',
    data: { category: 'Alimentação', daysRemaining: 5 }
  },
  {
    id: 5,
    type: 'categorization',
    title: 'Categorização Automática',
    description: '3 gastos foram automaticamente categorizados como "Transporte" com base em padrões anteriores',
    status: 'accepted',
    impact: 'low',
    timestamp: '2 dias atrás',
  },
  {
    id: 6,
    type: 'insight',
    title: 'Análise de Tendência',
    description: 'Seus gastos com Saúde diminuíram 20% este mês. Continue assim para atingir sua meta de economia!',
    confidence: 94,
    status: 'accepted',
    impact: 'medium',
    timestamp: '3 dias atrás',
    data: { category: 'Saúde', change: -20 }
  },
];

export function SugestoesIA() {
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filter === 'all') return true;
    return suggestion.status === filter;
  });

  const acceptSuggestion = (id: number) => {
    setSuggestions(suggestions.map(s => 
      s.id === id ? { ...s, status: 'accepted' as const } : s
    ));
  };

  const rejectSuggestion = (id: number) => {
    setSuggestions(suggestions.map(s => 
      s.id === id ? { ...s, status: 'rejected' as const } : s
    ));
  };

  const dismissSuggestion = (id: number) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'categorization':
        return Tag;
      case 'pattern':
        return TrendingUp;
      case 'insight':
        return Lightbulb;
      case 'alert':
        return AlertTriangle;
      default:
        return Sparkles;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'categorization':
        return 'blue';
      case 'pattern':
        return 'purple';
      case 'insight':
        return 'emerald';
      case 'alert':
        return 'amber';
      default:
        return 'slate';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high':
        return 'red';
      case 'medium':
        return 'amber';
      case 'low':
        return 'green';
      default:
        return 'slate';
    }
  };

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;
  const acceptedCount = suggestions.filter(s => s.status === 'accepted').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <span className="text-slate-800">Sugestões de IA</span>
          </div>
          <div className="text-slate-500">
            {pendingCount > 0 ? `${pendingCount} sugestões aguardando sua análise` : 'Nenhuma sugestão pendente'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-slate-500">Categorizações</div>
              <div className="text-slate-800">
                {suggestions.filter(s => s.type === 'categorization').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-slate-500">Padrões</div>
              <div className="text-slate-800">
                {suggestions.filter(s => s.type === 'pattern').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-slate-500">Insights</div>
              <div className="text-slate-800">
                {suggestions.filter(s => s.type === 'insight').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-slate-500">Aceitas</div>
              <div className="text-slate-800">{acceptedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 inline-flex gap-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-emerald-50 text-emerald-600'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todas ({suggestions.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'pending'
              ? 'bg-emerald-50 text-emerald-600'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Pendentes ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'accepted'
              ? 'bg-emerald-50 text-emerald-600'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Aceitas ({acceptedCount})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'rejected'
              ? 'bg-emerald-50 text-emerald-600'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Rejeitadas ({suggestions.filter(s => s.status === 'rejected').length})
        </button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filteredSuggestions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-slate-400" />
            </div>
            <div className="text-slate-800 mb-2">Nenhuma sugestão encontrada</div>
            <div className="text-slate-500">A IA está analisando seus dados para gerar novas sugestões</div>
          </div>
        ) : (
          filteredSuggestions.map((suggestion) => {
            const Icon = getSuggestionIcon(suggestion.type);
            const color = getSuggestionColor(suggestion.type);
            const impactColor = getImpactColor(suggestion.impact);
            
            return (
              <div
                key={suggestion.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                  suggestion.status === 'pending' 
                    ? 'border-emerald-200' 
                    : suggestion.status === 'accepted'
                    ? 'border-green-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-slate-800">{suggestion.title}</span>
                            {suggestion.confidence && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                {suggestion.confidence}% confiança
                              </span>
                            )}
                            {suggestion.impact && (
                              <span className={`px-2 py-0.5 bg-${impactColor}-100 text-${impactColor}-700 rounded text-xs`}>
                                Impacto {suggestion.impact === 'high' ? 'Alto' : suggestion.impact === 'medium' ? 'Médio' : 'Baixo'}
                              </span>
                            )}
                            {suggestion.status === 'accepted' && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Aceita
                              </span>
                            )}
                            {suggestion.status === 'rejected' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1">
                                <X className="w-3 h-3" />
                                Rejeitada
                              </span>
                            )}
                          </div>
                          <div className="text-slate-600 mb-2">{suggestion.description}</div>
                          <div className="text-slate-400">{suggestion.timestamp}</div>
                        </div>
                      </div>
                      
                      {suggestion.status === 'pending' && (
                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() => acceptSuggestion(suggestion.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Aceitar
                          </button>
                          <button
                            onClick={() => rejectSuggestion(suggestion.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Rejeitar
                          </button>
                          <button
                            onClick={() => dismissSuggestion(suggestion.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            Descartar
                          </button>
                        </div>
                      )}
                      
                      {suggestion.status !== 'pending' && (
                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() => dismissSuggestion(suggestion.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            Descartar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
