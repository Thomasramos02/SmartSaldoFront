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
import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // goal?: Goal | null;
}

export default function GoalModal({ open, onOpenChange }: GoalModalProps) {
  const [goalType, setGoalType] = useState<'category' | 'total'>('category');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Meta</DialogTitle>
          <DialogDescription>
            Defina um limite de gastos para uma categoria ou para o total de suas despesas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid gap-2">
                <Label>Tipo de Meta</Label>
                <ToggleGroup type="single" defaultValue="category" onValueChange={(value: 'category' | 'total') => value && setGoalType(value)}>
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
                <Input id="name" placeholder="Ex: Economizar em restaurantes" />
            </div>

            {goalType === 'category' && (
                <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <select id="category" className="input-field !pl-3">
                    <option>Selecione...</option>
                    <option>🍕 Alimentação</option>
                    <option>🚗 Transporte</option>
                    <option>🏠 Moradia</option>
                    <option>🎮 Lazer</option>
                    <option>❤️ Saúde</option>
                    </select>
                </div>
            )}
            
            <div className="grid gap-2">
                <Label htmlFor="limit">Valor Limite (R$)</Label>
                <Input id="limit" type="number" placeholder="500,00" />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="period">Período</Label>
                <select id="period" className="input-field !pl-3">
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
          <Button type="submit">Criar Meta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
