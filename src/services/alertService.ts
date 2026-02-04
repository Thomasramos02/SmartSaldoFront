import type { Alert } from '../types/alert';
import api from './api';

const alertService = {
  getAll: (): Promise<Alert[]> =>
    api.get('/alerts').then(res => res.data),

  markAsRead: (id: number): Promise<Alert> =>
    api.put(`/alerts/${id}/read`).then(res => res.data),

  markAllAsRead: (): Promise<void> =>
    api.put('/alerts/read-all').then(res => res.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/alerts/${id}`).then(res => res.data),
};

export default alertService;
