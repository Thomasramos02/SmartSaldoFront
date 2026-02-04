export interface CreateExpenseDto {
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  isRecurring: boolean;
  isDeductible: boolean;
}