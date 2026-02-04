import type { Category } from "./category";

export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: Category;
  isRecurring: boolean;
  isDeductible: boolean;
}
