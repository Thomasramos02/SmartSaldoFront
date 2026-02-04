import type { CreateExpenseDto } from '../types/createExpense.dto';
import type { Expense } from '../types/expense';
import type { UpdateExpenseDto } from '../types/updateExpense.dto';
import api from './api';




const expenseService = {
  getAll: (): Promise<Expense[]> =>
    api.get('/expenses').then(res => res.data),

  getById: (id: number): Promise<Expense> =>
    api.get(`/expenses/${id}`).then(res => res.data),

  create: (data: CreateExpenseDto): Promise<Expense> =>
    api.post('/expenses', data).then(res => res.data),

  update: (id: number, data: UpdateExpenseDto): Promise<Expense> =>
    api.put(`/expenses/${id}`, data).then(res => res.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/expenses/${id}`),
  
  getMonthlySummary: (year: number, month: number) =>
    api.get(`/expenses/summary/month`, { params: { year, month } })
       .then(res => res.data),

  getMonthlySummaryWithBudget: (year: number, month: number): Promise<{ month: string; total: number; budget: number; }> =>
    api.get(`/expenses/summary/${year}/${month}`).then(res => res.data),

  getExpensesByMonth: (year: number, month: number): Promise<Expense[]> =>
    api.get(`/expenses/by-month/${year}/${month}`).then(res => res.data),

 getTotalsGroupedByMonth: () =>
    api.get('/expenses/total').then(res => res.data),

  uploadStatement: (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/expenses/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },



};

export default expenseService;
