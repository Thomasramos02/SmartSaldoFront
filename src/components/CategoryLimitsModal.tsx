// src/components/CategoryLimitsModal.tsx
import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import type { Category } from "../types/category";

interface CategoryLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (limits: Record<number, number | null>) => Promise<void>;
  isLoading?: boolean;
}

export function CategoryLimitsModal({
  isOpen,
  onClose,
  categories,
  onSave,
  isLoading,
}: CategoryLimitsModalProps) {
  const [limits, setLimits] = useState<Record<number, string>>({});

  useEffect(() => {
    const initialLimits: Record<number, string> = {};
    categories.forEach((cat) => {
      initialLimits[cat.id] = cat.limit ? String(cat.limit) : "";
    });
    setLimits(initialLimits);
  }, [categories]);

  const handleChange = (id: number, value: string) => {
    setLimits((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async () => {
    const parsedLimits: Record<number, number | null> = {};

    Object.entries(limits).forEach(([id, value]) => {
      parsedLimits[Number(id)] =
        value.trim() === "" ? null : Number(value);
    });

    await onSave(parsedLimits);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Limites por Categoria"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Defina limites mensais para cada categoria.  
          Isso ajuda a acompanhar melhor seus gastos.
        </p>

        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium text-slate-900">
                  {category.name}
                </span>
              </div>

              <input
                type="number"
                placeholder="Sem limite"
                value={limits[category.id] || ""}
                onChange={(e) =>
                  handleChange(category.id, e.target.value)
                }
                className="w-32 px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            Salvar limites
          </button>
        </div>
      </div>
    </Modal>
  );
}
