import { apiClient as api } from '@/core/api';
import type {
  Property,
  PropertyFormPayload,
  AssignAgentPayload,
  OperationType,
} from '@/modules/properties/types/property';

export const propertyService = {
  async getProperties(filters?: {
    title?: string;
    type?: string;
    zone?: string;
    operationType?: string;
    status?: string;
    agentId?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    try {
      const response = await api.get('/properties', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  async getPropertiesByAgent(agentId: string) {
    const response = await api.get(`/properties/agent/${agentId}`);
    return response.data.data;
  },

  async getPropertiesByOwner(ownerId: string) {
    const response = await api.get(`/properties/owner/${ownerId}`);
    return response.data.data;
  },

  async getPropertyById(id: string): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response.data.data;
  },

  async createProperty(payload: PropertyFormPayload) {
    const response = await api.post('/properties', payload);
    return response.data.data;
  },

  async updatePrice(propertyId: string, newPrice: number) {
    const response = await api.patch(`/properties/${propertyId}/price`, {
      newPrice,
    });
    return response.data.data;
  },

  async assignAgent(propertyId: string, payload: AssignAgentPayload) {
    const response = await api.patch(`/properties/${propertyId}/assign-agent`, payload);
    return response.data.data;
  },

  async assignOwner(propertyId: string, payload: { ownerId: string }) {
    const response = await api.patch(`/properties/${propertyId}/assign-owner`, payload);
    return response.data.data;
  },

  async updateOperationType(propertyId: string, operationType: OperationType) {
    const response = await api.patch(`/properties/${propertyId}/operation-type`, {
      operationType,
    });
    return response.data.data;
  },

  async deleteProperty(propertyId: string): Promise<void> {
    await api.delete(`/properties/${propertyId}`);
  },

  async updateStatus(id: string, status: string): Promise<Property> {
    const response = await api.patch(`/properties/${id}/status`, {
      status,
    });
    return response.data.data;
  },

  async getStatusHistory(id: string): Promise<Record<string, unknown>[]> {
    const response = await api.get(`/properties/${id}/status-history`);
    return response.data.data;
  },

  async updateProperty(propertyId: string, payload: Partial<PropertyFormPayload>) {
    const response = await api.put(`/properties/${propertyId}`, payload);
    return response.data.data;
  },

  async updatePropertyAsAgent(propertyId: string, payload: Partial<PropertyFormPayload>) {
    const response = await api.patch(`/properties/${propertyId}/agent-update`, payload);
    return response.data.data;
  },
};

export default propertyService;
