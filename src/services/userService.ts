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
    const nameParts = payload.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.';

    const apiPayload = {
      firstName: firstName,
      lastName: lastName,
      email: payload.email,
      userType: payload.userType,
      roleIds: payload.roleId ? [payload.roleId] : [],
      birthDate: payload.birthDate,
      phone: payload.phone,
      sendTemporaryCredentials: true
    };

    const response = await api.post('/users', apiPayload);
    return response.data;
  },

  async updateUser(userId: string | number, payload: any) {
    const response = await api.patch(`/users/${userId}`, payload);
    return response.data;
  },

  async deleteUser(userId: string | number) {
    await api.delete(`/users/${userId}`);
  }
}