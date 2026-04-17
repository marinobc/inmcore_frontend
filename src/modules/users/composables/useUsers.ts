import { ref } from 'vue';
import { userService } from '@/modules/users/services/userService';
import { personService } from '@/modules/users/services/personService';
import type { User } from '@/modules/users/types/user';
import { usePagination } from '@/shared/composables/usePagination';

export function useUsers() {
  const statusFilter = ref('ALL');
  const searchQuery = ref('');

  const {
    items: users,
    loading,
    currentPage,
    pageSize,
    totalElements: totalUsers,
    totalPages,
    load: baseLoad,
  } = usePagination<User>(async (page, size) => {
    const res = await userService.getUsers(
      page,
      size,
      statusFilter.value !== 'ALL' ? statusFilter.value : undefined,
      searchQuery.value || undefined
    );
    return { data: res.data || [], total: res.meta?.total || 0 };
  });

  const load = (query?: string, status?: string) => {
    if (status !== undefined) {
      statusFilter.value = status;
      currentPage.value = 0;
    }
    if (query !== undefined) {
      searchQuery.value = query;
      currentPage.value = 0;
    }
    return baseLoad();
  };

  const create = async (data: Partial<User>) => {
    await userService.createUser(data);
    await load();
  };
  const remove = async (id: string) => {
    await userService.deleteUser(id);
    await load();
  };
  const deactivate = async (id: string) => {
    await userService.deactivateUser(id);
    await load();
  };
  const reactivate = async (id: string) => {
    await userService.reactivateUser(id);
    await load();
  };
  const resendTemporaryPassword = async (email: string) => {
    await userService.resendTemporaryPassword(email);
  };
  const update = async (id: string, data: Partial<User>) => {
    await userService.updateUser(id, data);
    await load();
  };
  const fetchUserProfile = async (id: string) => personService.getPersonByAuthUserId(id);

  return {
    users,
    loading,
    currentPage,
    pageSize,
    totalPages,
    totalUsers,
    statusFilter,
    searchQuery,
    load,
    create,
    remove,
    deactivate,
    reactivate,
    resendTemporaryPassword,
    update,
    fetchUserProfile,
  };
}
