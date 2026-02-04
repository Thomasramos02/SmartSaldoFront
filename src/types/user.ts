export interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  monthlyBudget: number;
  totalSpent?: number;
  budgetUsagePercentage?: number;
  plan?: string;
}