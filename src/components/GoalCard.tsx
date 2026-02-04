import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { useState, useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

// Defina a interface Goal
interface Goal {
  id: number;
  name: string;
  type: 'category' | 'total';
  category?: string;
  categoryIcon?: string;
  limit: number;
  current: number;
  period: 'monthly' | 'weekly';
  status: 'safe' | 'warning' | 'danger';
}

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
}

export default function GoalModal({ open, onOpenChange, goal }: GoalModalProps) {
  const [goalType, setGoalType] = useState<'category' | 'total'>('category');
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [category, setCategory] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');

  // Preencher os campos se estiver editando
  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setGoalType(goal.type);
      setLimit(goal.limit.toString());
      setCategory(goal.category || '');
      setPeriod(goal.period);
    } else {
      // Resetar para valores padrão se for uma nova meta
      setName('');
      setGoalType('category');
      setLimit('');
      setCategory('');
      setPeriod('monthly');
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para salvar a meta
    console.log({ name, goalType, limit, category, period });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{goal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
            <DialogDescription>
              Defina um limite de gastos para uma categoria ou para o total de suas despesas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label>Tipo de Meta</Label>
              <ToggleGroup 
                type="single" 
                value={goalType}
                onValueChange={(value: 'category' | 'total') => value && setGoalType(value)}
              >
                <ToggleGroupItem value="category" className="w-full">
                  Por Categoria
                </ToggleGroupItem>
                <ToggleGroupItem value="total" className="w-full">
                  Limite Total
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Meta</Label>
              <Input 
                id="name" 
                placeholder="Ex: Economizar em restaurantes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {goalType === 'category' && (
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <select 
                  id="category" 
                  className="input-field !pl-3"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required={goalType === 'category'}
                >
                  <option value="">Selecione...</option>
                  <option value="Alimentação">🍕 Alimentação</option>
                  <option value="Transporte">🚗 Transporte</option>
                  <option value="Moradia">🏠 Moradia</option>
                  <option value="Lazer">🎮 Lazer</option>
                  <option value="Saúde">❤️ Saúde</option>
                </select>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="limit">Valor Limite (R$)</Label>
              <Input 
                id="limit" 
                type="number" 
                placeholder="500,00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="period">Período</Label>
              <select 
                id="period" 
                className="input-field !pl-3"
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'monthly' | 'weekly')}
                required
              >
                <option value="monthly">Mensal</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">
              {goal ? 'Salvar Alterações' : 'Criar Meta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}