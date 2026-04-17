<template>
  <div>
    <AuditLayout
      v-model:filters="filters"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :columns="columns"
      :items="logs"
      :loading="loading"
      :total="totalLogs"
      :total-pages="totalPages"
      @apply="fetchLogs"
      @clear="clearFilters"
    >
      <template #filters>
        <SearchableSelect
          v-model="filters.userId"
          :items="userOptions"
          :label="t('audit.filters.user')"
          :placeholder="t('audit.filters.searchUser')"
          :loading="loadingUsers"
          show-clear-button
        />
        <div class="flex flex-col">
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {{ t('audit.filters.action') }}
          </label>
          <select
            v-model="filters.action"
            class="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="">{{ t('audit.actions.all') }}</option>
            <option
              v-for="a in [
                'USER_LOGIN',
                'USER_LOGOUT',
                'USER_CREATE',
                'USER_UPDATE',
                'USER_DEACTIVATE',
                'USER_REACTIVATE',
                'PASSWORD_CHANGE',
              ]"
              :key="a"
              :value="a"
            >
              {{ a.replace('USER_', '') }}
            </option>
          </select>
        </div>
      </template>

      <template #col-timestamp="{ value }">{{ formatDateTime(value) }}</template>
      <template #col-userId="{ item }">
        <div class="flex flex-col">
          <span class="text-xs font-medium">{{ item.userEmail || item.userId }}</span>
          <span v-if="item.performedBy" class="text-[10px] text-gray-400">
            {{ t('auditLogs.by') }} {{ item.performedBy }}
          </span>
        </div>
      </template>
      <template #col-action="{ value }">
        <span
          :class="getActionBadgeClass(value)"
          class="px-2 py-0.5 rounded-full text-[10px] font-bold"
        >
          {{ getActionLabel(value) }}
        </span>
      </template>
      <template #col-details="{ value }">
        <p class="text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate" :title="value">
          {{ value }}
        </p>
      </template>
    </AuditLayout>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { auditService, type IdentityAuditLog } from '../services/auditService';
  import { userService } from '@/modules/users/services/userService';
  import type { User } from '@/modules/users/types/user';
  import { getLocaleString } from '@/core/locales/i18n';
  import { handleApiError } from '@/core/api/errorHandler';

  import SearchableSelect from '@/shared/components/common/SearchableSelect.vue';
  import AuditLayout from './AuditLayout.vue';
  import type { TableColumn } from '@/shared/components/ui/DataTable.vue';

  const { t } = useI18n();

  const logs = ref<IdentityAuditLog[]>([]);
  const loading = ref(false);
  const currentPage = ref(0);
  const pageSize = ref(10);
  const totalPages = ref(0);
  const totalLogs = ref(0);
  const users = ref<User[]>([]);
  const loadingUsers = ref(false);

  const filters = ref({ userId: '', action: '', from: '', to: '' });

  const columns: TableColumn[] = [
    { key: 'timestamp', label: t('audit.table.dateTime') },
    { key: 'userId', label: t('audit.table.user') },
    { key: 'action', label: t('audit.table.action') },
    { key: 'details', label: t('audit.table.details') },
  ];

  const userOptions = computed(() =>
    users.value.map((u) => ({
      value: u.id,
      label: u.fullName || u.email,
      subtitle: u.userType,
    }))
  );
  const formatDateTime = (ts: string) => new Date(ts).toLocaleString(getLocaleString());

  const getActionBadgeClass = (a: string) => {
    if (a.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (a.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (a.includes('DEACTIVATE')) return 'bg-red-100 text-red-800';
    if (a.includes('LOGIN')) return 'bg-purple-100 text-purple-800';
    if (a.includes('LOGOUT')) return 'bg-orange-100 text-orange-800';
    if (a.includes('REACTIVATE')) return 'bg-teal-100 text-teal-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActionLabel = (a: string) =>
    ({
      USER_LOGIN: 'LOGIN',
      USER_LOGOUT: 'LOGOUT',
      USER_CREATE: t('auditLogs.actions.creation'),
      USER_UPDATE: t('auditLogs.actions.edit'),
      USER_DEACTIVATE: t('auditLogs.actions.deactivation'),
      USER_REACTIVATE: t('auditLogs.actions.reactivation'),
      PASSWORD_CHANGE: t('auditLogs.actions.passwordChange'),
    })[a] || a;

  const fetchLogs = async () => {
    loading.value = true;
    try {
      const res = await auditService.getIdentityAudit({
        ...filters.value,
        page: currentPage.value,
        pageSize: pageSize.value,
      });
      logs.value = res.data || [];
      totalLogs.value = res.meta?.total || 0;
      totalPages.value = Math.ceil(totalLogs.value / pageSize.value);
    } catch (e: unknown) {
      console.error(handleApiError(e).message);
    } finally {
      loading.value = false;
    }
  };

  const clearFilters = () => {
    filters.value = { userId: '', action: '', from: '', to: '' };
    currentPage.value = 0;
    fetchLogs();
  };

  onMounted(async () => {
    loadingUsers.value = true;
    try {
      const uRes = await userService.getUsers(0, 1000);
      users.value = uRes.data || [];
    } catch (e: unknown) {
      console.error(handleApiError(e).message);
    } finally {
      loadingUsers.value = false;
    }
    fetchLogs();
  });
</script>
