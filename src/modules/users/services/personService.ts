import { apiClient as api } from '@/core/api';

interface PersonProfile {
  id: string;
  [key: string]: unknown;
}

interface CreatePersonPayload {
  firstName: string;
  lastName: string;
  email: string;
  [key: string]: unknown;
}

interface ClientPayload {
  firstName: string;
  lastName: string;
  email: string;
  [key: string]: unknown;
}

export const personService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  normalizePerson(p: any) {
    if (!p) return p;
    return {
      ...p,
      personId: p.id, // Guardamos el ID interno de MongoDB por si se necesita
      id: p.authUserId || p.id, // Priorizamos el ID de identidad para operaciones de usuario
      userType: p.userType || p.personType,
      status: p.status, // Don't default here, let the merge logic handle it
    };
  },

  async getPersonByAuthUserId(authUserId: string): Promise<PersonProfile> {
    try {
      const response = await api.get(`/persons/by-auth/${authUserId}`);
      return this.normalizePerson(response.data.data);
    } catch (error) {
      console.error('Error fetching person by authUserId:', error);
      throw error;
    }
  },

  async createPerson(payload: CreatePersonPayload): Promise<PersonProfile> {
    try {
      console.log('Creating person with payload:', payload);
      const response = await api.post('/persons', payload);
      console.log('Person created successfully:', response.data.data);
      return this.normalizePerson(response.data.data);
    } catch (error) {
      console.error('Error creating person:', error);
      throw error;
    }
  },

  async updatePersonByAuthUserId(
    authUserId: string,
    payload: Record<string, unknown>
  ): Promise<PersonProfile> {
    try {
      const response = await api.put(`/persons/by-auth/${authUserId}`, payload);
      return this.normalizePerson(response.data.data);
    } catch (error) {
      console.error('Error updating person by authUserId:', error);
      throw error;
    }
  },

  async deletePersonByAuthUserId(authUserId: string) {
    try {
      await api.delete(`/persons/by-auth/${authUserId}`);
    } catch (error) {
      console.error('Error deleting person by authUserId:', error);
      throw error;
    }
  },

  async getPersons(params: { type?: string; page?: number; pageSize?: number; query?: string }) {
    const response = await api.get('/persons', { params });
    if (response.data.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.data.data = response.data.data.map((p: any) => this.normalizePerson(p));
    }
    return response.data;
  },

  async getAssignedClients(agentId: string, page = 0, pageSize = 10, query = '') {
    const response = await api.get(`/persons/agents/${agentId}/clients/all`, {
      params: { page, pageSize, query },
    });
    if (response.data.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.data.data = response.data.data.map((p: any) => this.normalizePerson(p));
    }
    return response.data;
  },

  async getAssignedOwners(agentId: string, page = 0, pageSize = 10, query = '') {
    const response = await api.get(`/persons/agents/${agentId}/owners`, {
      params: { page, pageSize, query },
    });
    if (response.data.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.data.data = response.data.data.map((p: any) => this.normalizePerson(p));
    }
    return response.data;
  },

  async getClientsForAgent(page = 0, pageSize = 10, query = '') {
    const response = await api.get('/persons/agents/clients', {
      params: { page, pageSize, query },
    });
    if (response.data.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.data.data = response.data.data.map((p: any) => this.normalizePerson(p));
    }
    return response.data;
  },

  async createClientForAgent(payload: ClientPayload) {
    const response = await api.post('/persons/agents/clients', payload);
    return this.normalizePerson(response.data.data);
  },

  async updateClientForAgent(clientId: string, payload: ClientPayload) {
    const response = await api.put(`/persons/agents/clients/${clientId}`, payload);
    return this.normalizePerson(response.data.data);
  },
};
