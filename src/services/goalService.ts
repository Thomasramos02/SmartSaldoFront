import api from './api';
import type { Goal } from '../types/goal';

export interface CreateGoalDto {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
}

export interface UpdateGoalDto {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
}

const goalService = {
  getAll: (): Promise<Goal[]> => 
    api.get('/goals').then(res => res.data),

  create: (data: CreateGoalDto): Promise<Goal> =>
    api.post('/goals', data).then(res => res.data),

  update: (id: number, data: UpdateGoalDto): Promise<Goal> =>
    api.patch(`/goals/${id}`, data).then(res => res.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/goals/${id}`),
};

export default goalService;
