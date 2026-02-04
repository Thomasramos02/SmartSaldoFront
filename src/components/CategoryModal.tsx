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

const iconOptions = ['🍕', '🚗', '🏠', '🎮', '❤️', '📚', '✈️', '🛒', '💼', '🎬', '☕', '🏋️'];

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // category?: Category | null;
}

export default function CategoryModal({ open, onOpenChange }: CategoryModalProps) {
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0]);
  const [categoryName, setCategoryName] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">Nova Categoria</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Crie uma nova categoria para organizar seus gastos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs font-medium text-slate-500">Nome da Categoria</Label>
            <Input
              id="name"
              placeholder="Ex: Alimentação"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-xs font-medium text-slate-500">Ícone</Label>
            <div className="grid grid-cols-8 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`flex items-center justify-center p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 aspect-square ${
                    selectedIcon === icon
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs font-medium text-slate-500">Cor</Label>
            <div className="grid grid-cols-8 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 aspect-square ${
                    selectedColor === color.value
                      ? 'border-slate-800 ring-2 ring-offset-2 ring-slate-800'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <Label className="text-xs font-medium text-slate-500">Pré-visualização</Label>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                {selectedIcon}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{categoryName || 'Nova Categoria'}</div>
                <div className="text-xs text-slate-500">0 gastos</div>
              </div>
            </div>
          </div>

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit">Salvar Categoria</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
