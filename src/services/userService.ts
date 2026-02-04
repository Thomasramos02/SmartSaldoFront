
import api from './api'; // Assumindo que você tem uma instância do axios configurada
import type { UserProfile } from '../types/user';

// Corresponde ao UpdateUserDto do backend
export interface UpdateUserDto {
  name?: string;
  email?: string;
  monthlyBudget?: number;
}

export interface ChangePasswordDto {
  password: string;
  confirmPassword: string;
}

class UsersService {
  // Bate no endpoint @Get('me') do seu Controller
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/users/me');
    return response.data;
  }

  // Bate no endpoint @Patch('me') do seu Controller
  async updateProfile(data: UpdateUserDto): Promise<UserProfile> {
    const response = await api.patch<UserProfile>('/users/me', data);
    return response.data;
  }

  // Novo método para alterar senha
  async changePassword(data: ChangePasswordDto): Promise<void> {
    await api.patch('/users/me/password', data);
  }

  // Novo método para deletar conta
  async deleteAccount(): Promise<void> {
    await api.delete('/users/me');
  }
}

export default new UsersService();