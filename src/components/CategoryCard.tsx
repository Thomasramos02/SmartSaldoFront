import { Edit2, Trash2 } from 'lucide-react';
import { Button } from './button';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}

interface CategoryCardProps {
  category: Category;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
      <div>
        <div className="flex items-start justify-between mb-4">
            <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${category.color}20` }}
            >
            {category.icon}
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onEdit(category.id)}>
                    <Edit2 className="w-4 h-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onDelete(category.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            </div>
        </div>

        <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800">{category.name}</h3>
            <p className="text-sm text-slate-500">{category.count} transações</p>
        </div>
        
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total gasto</span>
                <span className="font-semibold text-slate-800">
                {category.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
            <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                    width: `${category.percentage}%`,
                    backgroundColor: category.color,
                }}
                />
            </div>
        </div>
      </div>
    </div>
  );
}
