import { Badge } from './badge';
import { Button } from './button';
import { Check, X, TrendingUp, Tag, Lightbulb, AlertTriangle } from 'lucide-react';

interface Suggestion {
  id: number;
  type: 'categorization' | 'pattern' | 'insight' | 'alert';
  title: string;
  description: string;
  confidence?: number;
  status: 'pending' | 'accepted' | 'rejected';
  impact?: 'high' | 'medium' | 'low';
  timestamp: string;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

const suggestionConfig = {
  categorization: { icon: Tag, color: 'blue', label: 'Categorização' },
  pattern: { icon: TrendingUp, color: 'purple', label: 'Padrão' },
  insight: { icon: Lightbulb, color: 'emerald', label: 'Insight' },
  alert: { icon: AlertTriangle, color: 'amber', label: 'Alerta' },
};

const impactConfig = {
  high: { label: 'Alto', color: 'red' },
  medium: { label: 'Médio', color: 'amber' },
  low: { label: 'Baixo', color: 'green' },
};

export default function SuggestionCard({ suggestion, onAccept, onReject }: SuggestionCardProps) {
  const config = suggestionConfig[suggestion.type];
  const Icon = config.icon;
  
  const impact = suggestion.impact ? impactConfig[suggestion.impact] : null;

  const baseColor = config.color;
  const iconBgClass = `bg-${baseColor}-100`;
  const iconTextClass = `text-${baseColor}-600`;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-6 transition-all duration-300 ${suggestion.status === 'pending' ? 'border-emerald-200' : 'border-slate-200'}`}>
      <div className="flex gap-5">
        <div className={`w-12 h-12 rounded-xl ${iconBgClass} flex-shrink-0 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconTextClass}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
                <h3 className="font-semibold text-slate-800">{suggestion.title}</h3>
                <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    <Badge variant="secondary">{config.label}</Badge>
                    {impact && <Badge variant={impact.color === 'red' ? 'destructive' : 'default'} className={`bg-${impact.color}-100 text-${impact.color}-700`}>Impacto {impact.label}</Badge>}
                    {suggestion.confidence && <Badge variant="outline">Confiança: {suggestion.confidence}%</Badge>}
                </div>
            </div>
             <p className="text-xs text-slate-500 whitespace-nowrap">{suggestion.timestamp}</p>
          </div>

          <p className="text-sm text-slate-600 mt-3 mb-4">{suggestion.description}</p>

          {suggestion.status === 'pending' && (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => onAccept(suggestion.id)}>
                <Check className="w-4 h-4 mr-2" />
                Aceitar
              </Button>
              <Button size="sm" variant="outline" onClick={() => onReject(suggestion.id)}>
                <X className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
            </div>
          )}
          {suggestion.status === 'accepted' && <Badge variant="default" className="bg-green-100 text-green-700"><Check className="w-4 h-4 mr-1.5"/>Aceita</Badge>}
          {suggestion.status === 'rejected' && <Badge variant="destructive"><X className="w-4 h-4 mr-1.5"/>Rejeitada</Badge>}

        </div>
      </div>
    </div>
  );
}
