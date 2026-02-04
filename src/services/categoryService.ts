import type { Category } from '../types/category';
import type { CreateCategoryDto } from '../types/createCategory.dto';
import type { UpdateCategoryDto } from '../types/updateCategory.dto';
import api from './api';


const categoryService = {
  getAll: (): Promise<Category[]> =>
    api.get('/categories').then(res => res.data),

  getById: (id: number): Promise<Category> =>
    api.get(`/categories/${id}`).then(res => res.data),

  create: (data: CreateCategoryDto): Promise<Category> =>
    api.post('/categories', data).then(res => res.data),

  update: (id: number, data: UpdateCategoryDto): Promise<Category> =>
    api.put(`/categories/${id}`, data).then(res => res.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/categories/${id}`),
};

export default categoryService;
