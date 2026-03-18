import { api } from './api'
import type { UserFormPayload } from '../types/user'

export const userService = {
  async getRoles() {
    const response = await api.get('/roles');
    return response.data;
  },
  
  async getUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async createUser(payload: UserFormPayload) {
    const apiPayload = {
      firstName: payload.name.split(' ')[0] || '',
      lastName: payload.name.split(' ').slice(1).join(' ') || '.',
      email: payload.email,
      userType: 'AGENT',
      roleIds: [payload.roleId]
    };
    const response = await api.post('/users', apiPayload);
    return response.data;
  },

  async assignRole(userId: string | number, roleIds: string[]) {
    const response = await api.patch(`/users/${userId}/role`, { roleIds });
    return response.data;
  }
}
