<template>
  <div>
    <PageHeader :title="t('users.view.title')" :subtitle="t('users.subtitle')">
      <template #actions>
        <fwb-button @click="openCreateModal" color="blue" class="inline-flex items-center gap-2">
          <IconLucidePlus class="w-4 h-4" />
          <span>{{ t('users.addNew') }}</span>
        </fwb-button>
      </template>
    </PageHeader>

    <PageContainer class="space-y-6">
      <SearchFilterBar
        v-model="searchQuery"
        v-model:active-pill-value="statusFilter"
        :pill-options="statusOptions"
        :placeholder="t('users.view.searchPlaceholder')"
        :clear-label="t('users.view.clearSearch')"
        @input="handleSearch"
        @clear="load"
      />

      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <DataTable :columns="columns" :items="users" :loading="loading" has-actions>
          <template #col-fullName="{ item }">
            <div class="flex flex-col" :class="{ 'opacity-60': item.status === 'INACTIVE' }">
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ item.fullName }}
              </span>
              <span class="text-xs text-gray-500">{{ item.email }}</span>
            </div>
          </template>
          <template #col-role="{ value }">
            <span
              class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            >
              {{ resolveRoleName(value) }}
            </span>
          </template>
          <template #col-status="{ value }">
            <StatusBadge :status="value" />
          </template>
          <template #actions="{ item }">
            <ActionIconGroup
              :actions="getUserActions(item)"
              container-class="justify-end"
              @action="handleUserAction($event, item)"
            />
          </template>
        </DataTable>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total="totalUsers"
        @change="load"
      />
    </PageContainer>

    <!-- Modals -->
    <fwb-modal v-if="showModal" @close="closeModal" size="2xl">
      <template #header>
        <div class="text-xl font-bold">
          {{ isEditing ? t('users.view.editTitle') : t('users.view.createTitle') }}
        </div>
      </template>
      <template #body>
        <user-form
          :key="formKey"
          :initial-data="editingUser || undefined"
          :is-editing="isEditing"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </fwb-modal>

    <UserDetailsModal
      :show="showDetailsModal"
      :user="selectedUser"
      show-admin-actions
      @close="closeDetailsModal"
      @delete="
        userToRemove = $event;
        showRemoveModal = true;
      "
    />

    <ConfirmModal
      v-model="showDeactivateModal"
      :title="t('users.view.deactivateModalTitle')"
      :message="
        t('users.view.deactivateModalText', {
          name: userToDeactivate?.fullName,
        })
      "
      confirm-color="yellow"
      @confirm="confirmDeactivate"
    />
    <ConfirmModal
      v-model="showRemoveModal"
      :title="t('users.view.removeModalTitle')"
      :message="t('users.view.removeModalText', { name: userToRemove?.fullName })"
      confirm-color="red"
      @confirm="confirmRemove"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch, computed } from 'vue';
  import { FwbModal, FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import { debounce } from '@/utils/debounce';
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucideEye from '~icons/lucide/eye';
  import IconLucideMail from '~icons/lucide/mail';
  import IconLucidePencil from '~icons/lucide/pencil';
  import IconLucideRefreshCw from '~icons/lucide/refresh-cw';
  import IconLucideBan from '~icons/lucide/ban';
  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';
  import { useUsers } from '@/modules/users';
  import { handleApiError } from '@/core/api/errorHandler';
  import UserForm from '@/modules/users/components/UserForm.vue';
  import UserDetailsModal from '@/modules/users/components/UserDetailsModal.vue';
  import StatusBadge from '@/shared/components/ui/StatusBadge.vue';
  import DataTable, { type TableColumn } from '@/shared/components/ui/DataTable.vue';
  import Pagination from '@/shared/components/ui/Pagination.vue';
  import ConfirmModal from '@/shared/components/ui/ConfirmModal.vue';
  import SearchFilterBar from '@/shared/components/ui/SearchFilterBar.vue';
  import ActionIconGroup, { type ActionIconItem } from '@/shared/components/ui/ActionIconGroup.vue';
  import { useToast } from '@/shared/composables/useToast';
  import type { User, UserFormPayload } from '@/modules/users/types/user';

  const { t } = useI18n();
  const toast = useToast();
  const {
    users,
    currentPage,
    pageSize,
    totalPages,
    totalUsers,
    statusFilter,
    searchQuery,
    loading,
    load,
    create,
    remove,
    deactivate,
    reactivate,
    resendTemporaryPassword,
    update,
    fetchUserProfile,
  } = useUsers();

  const statusOptions = computed(() =>
    ['ALL', 'ACTIVE', 'INACTIVE'].map((s) => ({
      label: t(`users.view.filter${s.charAt(0) + s.slice(1).toLowerCase()}`),
      value: s,
    }))
  );

  const columns: TableColumn[] = [
    { key: 'fullName', label: t('users.table.name') },
    { key: 'userType', label: t('users.table.role') },
    { key: 'status', label: t('users.table.status') },
  ];

  const showModal = ref(false);
  const isEditing = ref(false);
  const editingUser = ref<Partial<User> | null>(null);
  const formKey = ref(0);
  const showDetailsModal = ref(false);
  const selectedUser = ref<User | null>(null);
  const showDeactivateModal = ref(false);
  const showRemoveModal = ref(false);
  const userToDeactivate = ref<User | null>(null);
  const userToRemove = ref<User | null>(null);

  const handleSearch = debounce(() => {
    load(searchQuery.value);
  }, 300);

  const openCreateModal = () => {
    editingUser.value = null;
    isEditing.value = false;
    formKey.value++;
    showModal.value = true;
  };
  const openEditModal = async (u: User) => {
    const profile = await fetchUserProfile(u.id);
    // Profile first, then Identity (u) to ensure Identity's status and ID are preserved
    editingUser.value = { ...profile, ...u };
    isEditing.value = true;
    formKey.value++;
    showModal.value = true;
  };
  const closeModal = () => {
    showModal.value = false;
    editingUser.value = null;
  };
  const openDetailsModal = async (u: User) => {
    const profile = await fetchUserProfile(u.id);
    // Profile first, then Identity (u) to ensure Identity's status and ID are preserved
    selectedUser.value = { ...profile, ...u } as User;
    showDetailsModal.value = true;
  };
  const closeDetailsModal = () => {
    showDetailsModal.value = false;
    selectedUser.value = null;
  };

  const getUserActions = (u: User): ActionIconItem[] => [
    {
      id: 'view',
      icon: IconLucideEye,
      tooltip: t('users.tooltips.viewDetails'),
      color: 'blue',
    },
    {
      id: 'resend',
      icon: IconLucideMail,
      tooltip: t('users.tooltips.resendPassword'),
      color: 'green',
      show: u.status !== 'DELETED',
    },
    {
      id: 'edit',
      icon: IconLucidePencil,
      tooltip: t('users.tooltips.editUser'),
      color: 'blue',
      show: u.status === 'ACTIVE',
    },
    {
      id: 'reactivate',
      icon: IconLucideRefreshCw,
      tooltip: t('users.tooltips.reactivateUser'),
      color: 'green',
      show: u.status === 'INACTIVE',
    },
    {
      id: 'deactivate',
      icon: IconLucideBan,
      tooltip: t('users.tooltips.deactivateUser'),
      color: 'red',
      show: u.status === 'ACTIVE',
    },
  ];

  const handleUserAction = (actionId: string, u: User) => {
    switch (actionId) {
      case 'view':
        openDetailsModal(u);
        break;
      case 'resend':
        handleResend(u);
        break;
      case 'edit':
        openEditModal(u);
        break;
      case 'reactivate':
        handleReactivate(u);
        break;
      case 'deactivate':
        userToDeactivate.value = u;
        showDeactivateModal.value = true;
        break;
    }
  };

  const handleSubmit = async (data: Partial<UserFormPayload>) => {
    try {
      if (isEditing.value && editingUser.value?.id) {
        await update(editingUser.value.id, data as Partial<User>);
      } else {
        await create(data as Partial<User>);
      }
      toast.success(t(isEditing.value ? 'users.view.userUpdated' : 'users.view.userCreated'));
      closeModal();
      load(searchQuery.value);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || t('common.error'));
    }
  };

  const confirmDeactivate = async () => {
    if (userToDeactivate.value?.id) {
      await deactivate(userToDeactivate.value.id);
      toast.success(t('users.view.userUpdated'));
      showDeactivateModal.value = false;
      load(searchQuery.value);
    }
  };
  const confirmRemove = async () => {
    if (userToRemove.value?.id) {
      await remove(userToRemove.value.id);
      toast.success(t('users.view.userUpdated'));
      showRemoveModal.value = false;
      closeDetailsModal();
      load(searchQuery.value);
    }
  };
  const handleReactivate = async (u: User) => {
    await reactivate(u.id);
    toast.success(t('users.view.userUpdated'));
    load(searchQuery.value);
  };
  const handleResend = async (u: User) => {
    try {
      await resendTemporaryPassword(u.email);
      toast.success(t('users.view.resendSuccess', { email: u.email }));
    } catch (e) {
      toast.error(handleApiError(e).message);
    }
  };

  const resolveRoleName = (type: string) => {
    if (!type) return t('common.unknown');
    const tMap: Record<string, string> = {
      ADMIN: t('roleTypes.admin'),
      EMPLOYEE: t('roleTypes.agent'),
      OWNER: t('roleTypes.owner'),
      INTERESTED_CLIENT: t('roleTypes.client'),
    };
    return tMap[type.toUpperCase()] || type;
  };

  watch([statusFilter, pageSize], () => {
    currentPage.value = 0;
    load(searchQuery.value);
  });
  onMounted(() => {
    statusFilter.value = 'ALL';
    load();
  });
</script>
