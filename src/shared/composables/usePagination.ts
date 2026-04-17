import { ref, computed, type Ref } from 'vue';

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination<T>(
  fetchFn: (page: number, size: number) => Promise<{ data: T[]; total: number }>,
  options: PaginationOptions = {}
) {
  const items = ref<T[]>([]) as unknown as Ref<T[]>;
  const loading = ref(false);
  const currentPage = ref(options.initialPage ?? 0);
  const pageSize = ref(options.initialPageSize ?? 10);
  const totalElements = ref(0);

  const totalPages = computed(() => Math.ceil(totalElements.value / pageSize.value));

  async function load() {
    loading.value = true;
    try {
      const result = await fetchFn(currentPage.value, pageSize.value);
      items.value = result.data;
      totalElements.value = result.total;
    } catch (e) {
      console.error('Pagination load error:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function changePage(page: number) {
    currentPage.value = page;
    return load();
  }

  function changePageSize(size: number) {
    pageSize.value = size;
    currentPage.value = 0;
    return load();
  }

  return {
    items,
    loading,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    load,
    changePage,
    changePageSize,
  };
}
