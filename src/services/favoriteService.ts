import { api } from './api';

interface PropertyHistory {
  propertyId: string;
  viewedAt: string;
  [key: string]: unknown;
}

export const favoriteService = {
  async getFavorites(): Promise<string[]> {
    const res = await api.get('/api/favoritos');
    return res.data;
  },
  async addFavorite(propertyId: string) {
    await api.post('/api/favoritos', { propertyId });
  },
  async removeFavorite(propertyId: string) {
    await api.delete(`/api/favoritos/${propertyId}`);
  },
  async getHistory(limit = 20): Promise<PropertyHistory[]> {
    const res = await api.get('/api/favoritos/history', { params: { limit } });
    return res.data;
  },
  async getPropertyHistory(propertyId: string): Promise<PropertyHistory[]> {
    const res = await api.get(`/api/favoritos/history/${propertyId}`);
    return res.data;
  },
};
