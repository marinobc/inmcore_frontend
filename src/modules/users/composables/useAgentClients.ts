import { ref, computed } from 'vue';
import { personService } from '@/modules/users/services/personService';
import { userService } from '@/modules/users/services/userService';
import type { User } from '@/modules/users/types/user';
import { usePagination } from '@/shared/composables/usePagination';
import { useAuthStore } from '@/modules/auth/stores/authStore';

export function useAgentClients() {
  const searchQuery = ref('');
  const authStore = useAuthStore();
  const hasLoadedOnce = ref(false);

  const {
    items: allUsers,
    loading,
    currentPage,
    pageSize,
    load: baseLoad,
  } = usePagination<User>(async (page, size) => {
    const agentId = authStore.currentUserId;
    if (!agentId) return { data: [], total: 0 };

    const res = await personService.getAssignedClients(agentId, page, size);
    return { data: res.data || [], total: res.meta?.total || 0 };
  });

  const users = computed(() => {
    if (!searchQuery.value) return allUsers.value;
    const q = searchQuery.value.toLowerCase();
    return allUsers.value.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q)
    );
  });

  const filteredTotal = computed(() => users.value.length);
  const filteredPages = computed(() =>
    Math.max(1, Math.ceil(filteredTotal.value / pageSize.value))
  );

  const load = async (query?: string) => {
    if (query !== undefined) {
      searchQuery.value = query;
      // We don't reset page if filtering client-side for now,
      // but usually we should load more from server if possible.
    }
    await baseLoad();
    hasLoadedOnce.value = true;
  };

  const create = async (data: Partial<User>) => {
    const agentId = authStore.currentUserId;
    await userService.createUser({ ...data, assignedAgentId: agentId });
    await load();
  };

  const update = async (id: string, data: Partial<User>) => {
    const agentId = authStore.currentUserId;
    // id ya debería ser el authUserId por la normalización, pero por seguridad permitimos pasar data.authUserId
    const targetId = data.authUserId || id;
    await userService.updateUser(targetId, { ...data, assignedAgentId: agentId });
    await load();
  };

  const deactivate = async (id: string) => {
    await userService.deactivateUser(id);
    await load();
  };

  return {
    users,
    loading,
    currentPage,
    pageSize,
    totalPages: filteredPages,
    totalUsers: filteredTotal,
    hasLoadedOnce,
    searchQuery,
    load,
    create,
    update,
    deactivate,
  };
}
