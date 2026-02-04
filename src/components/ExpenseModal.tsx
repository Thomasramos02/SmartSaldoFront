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

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // expense?: Expense | null; // To handle editing in the future
}

export default function ExpenseModal({ open, onOpenChange }: ExpenseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Novo Gasto</DialogTitle>
          <DialogDescription>
            Adicione uma nova despesa. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" placeholder="Ex: Compras do mês" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="amount">Valor</Label>
                <Input id="amount" type="number" placeholder="0,00" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" />
            </div>
          </div>
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
           <div className="flex items-center space-x-2">
            <input type="checkbox" id="isRecurring" className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500" />
            <Label htmlFor="isRecurring" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Gasto Recorrente
            </Label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
