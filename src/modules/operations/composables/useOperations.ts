import { ref } from 'vue';
import { apiClient as api } from '@/core/api';
import type { ApiResponse } from '@/shared/types/api';

export interface Operation {
  id: string;
  operationType?: string;
  propertyName?: string;
  clientName?: string;
  agentName?: string;
  createdAt?: string;
  status?: string;
}

import i18n from '@/core/locales/i18n';

export function useOperations() {
  const { t } = i18n.global;
  const operations = ref<Operation[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<ApiResponse<Operation[]>>('/operations');
      operations.value = res.data.data || [];
    } catch (e) {
      error.value = t('operations.loadError');
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  return { operations, loading, error, load };
}
