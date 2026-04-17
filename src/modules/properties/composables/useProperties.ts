import { ref } from 'vue';
import { propertyService } from '../services/propertyService';
import { favoriteService } from '../services/favoriteService';
import type { Property } from '../types/property';
import { usePagination } from '@/shared/composables/usePagination';
import { useAuthStore } from '@/modules/auth';
import { handleApiError } from '@/core/api/errorHandler';

export function useProperties(initialStatus?: string) {
  const authStore = useAuthStore();
  const error = ref<string | null>(null);
  const favorites = ref<Set<string>>(new Set());
  const filters = ref({
    agentId: undefined as string | undefined,
    status: initialStatus as string | undefined,
    type: undefined as string | undefined,
    operationType: undefined as string | undefined,
    zone: undefined as string | undefined,
  });

  const {
    items: properties,
    loading,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    load: baseLoad,
  } = usePagination<Property>(async (page, size) => {
    error.value = null;
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries({ ...filters.value, page, pageSize: size }).filter(
          ([_, v]) => v !== '' && v !== undefined
        )
      );
      const res = await propertyService.getProperties(cleanFilters);
      return { data: res.data || [], total: res.meta?.total || 0 };
    } catch (e) {
      error.value = handleApiError(e).message;
      return { data: [], total: 0 };
    }
  });

  async function loadFavorites() {
    // Only fetch if user is a client
    const isClient =
      authStore.user?.userType === 'INTERESTED_CLIENT' ||
      authStore.user?.roles?.includes('INTERESTED_CLIENT');

    if (!isClient) return;

    try {
      const favs = await favoriteService.getFavorites();
      favorites.value = new Set(favs);
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  }

  async function load() {
    currentPage.value = 0; // Reset to first page when filtering
    await loadFavorites();
    await baseLoad();
  }

  async function loadPage() {
    await loadFavorites();
    await baseLoad();
  }

  function isFavorite(id: string) {
    return favorites.value.has(id);
  }

  async function toggleFavorite(id: string) {
    if (favorites.value.has(id)) {
      await favoriteService.removeFavorite(id);
      favorites.value.delete(id);
    } else {
      await favoriteService.addFavorite(id);
      favorites.value.add(id);
    }
  }

  return {
    properties,
    loading,
    error,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    filters,
    favorites,
    load,
    loadPage,
    loadFavorites,
    isFavorite,
    toggleFavorite,
  };
}
