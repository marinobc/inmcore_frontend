<template>
  <div class="space-y-6">
    <div
      class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <option value="USER_LOGIN">LOGIN</option>
            <option value="USER_LOGOUT">LOGOUT</option>
            <option value="USER_CREATE">CREATE</option>
            <option value="USER_UPDATE">UPDATE</option>
            <option value="USER_DEACTIVATE">DEACTIVATE</option>
            <option value="USER_REACTIVATE">REACTIVATE</option>
            <option value="PASSWORD_CHANGE">PASSWORD CHANGE</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('audit.filters.from') }}
            </label>
            <input
              v-model="filters.from"
              type="date"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('audit.filters.to') }}
            </label>
            <input
              v-model="filters.to"
              type="date"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <fwb-button @click="resetAndLoad" gradient="blue" size="sm">
          <div class="flex items-center gap-2">
            <IconLucideSearch class="w-4 h-4" />
            {{ t('common.filter') }}
          </div>
        </fwb-button>
        <fwb-button @click="clearFilters" color="alternative" size="sm">
          {{ t('common.clearFilters') }}
        </fwb-button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500 text-sm">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="logs.length > 0" class="overflow-x-auto">
      <fwb-table hoverable>
        <fwb-table-head>
          <fwb-table-head-cell>{{ t('audit.table.dateTime') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('audit.table.user') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('audit.table.action') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('audit.table.details') }}</fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="log in logs" :key="log.id">
            <fwb-table-cell class="whitespace-nowrap text-xs font-mono">
              {{ formatDateTime(log.timestamp) }}
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex flex-col">
                <span class="text-xs font-medium">{{ log.userEmail || log.userId }}</span>
                <span v-if="log.performedBy" class="text-[10px] text-gray-400">
                  {{ t('auditLogs.by') }} {{ log.performedBy }}
                </span>
              </div>
            </fwb-table-cell>
            <fwb-table-cell>
              <span
                :class="getActionBadgeClass(log.action)"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
              >
                {{ getActionLabel(log.action) }}
              </span>
            </fwb-table-cell>
            <fwb-table-cell>
              <p class="text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">
                {{ log.details }}
              </p>
            </fwb-table-cell>
          </fwb-table-row>
        </fwb-table-body>
      </fwb-table>

      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total="totalLogs"
        @change="fetchLogs"
      />
    </div>

    <div
      v-else
      class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <p class="text-gray-500 text-sm">{{ t('audit.noRecords') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';
  import { auditService, type IdentityAuditLog } from '@/services/auditService';
  import { userService } from '@/services/userService';
  import type { User } from '@/types/user';
  import SearchableSelect, { type SelectItem } from '@/components/common/SearchableSelect.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import {
    FwbTable,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableBody,
    FwbTableRow,
    FwbTableCell,
    FwbButton,
  } from 'flowbite-vue';
  import IconLucideSearch from '~icons/lucide/search';
  import { handleApiError } from '@/api/errorHandler';

  const { t } = useI18n();

  const logs = ref<IdentityAuditLog[]>([]);
  const loading = ref(false);
  const currentPage = ref(0);
  const pageSize = ref(10);
  const totalPages = ref(0);
  const totalLogs = ref(0);

  const users = ref<User[]>([]);
  const loadingUsers = ref(false);

  const filters = ref({
    userId: '',
    action: '',
    from: '',
    to: '',
  });

  const userOptions = computed<SelectItem[]>(() =>
    users.value.map((u) => ({ value: u.id, label: u.fullName || u.email, subtitle: u.userType }))
  );

  const formatDateTime = (ts: string) => new Date(ts).toLocaleString(getLocaleString());

  const getActionBadgeClass = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE') || action.includes('DEACTIVATE'))
      return 'bg-red-100 text-red-800';
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800';
    if (action.includes('LOGOUT')) return 'bg-orange-100 text-orange-800';
    if (action.includes('REACTIVATE')) return 'bg-teal-100 text-teal-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActionLabel = (action: string) => {
    // Map backend action strings to localized labels if available
    const map: Record<string, string> = {
      USER_LOGIN: 'LOGIN',
      USER_LOGOUT: 'LOGOUT',
      USER_CREATE: t('auditLogs.actions.creation'),
      USER_UPDATE: t('auditLogs.actions.edit'),
      USER_DEACTIVATE: t('auditLogs.actions.deactivation'),
      USER_REACTIVATE: t('auditLogs.actions.reactivation'),
      PASSWORD_CHANGE: t('auditLogs.actions.passwordChange'),
    };
    return map[action] || action;
  };

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
    } catch (error) {
      console.error(handleApiError(error).message);
    } finally {
      loading.value = false;
    }
  };

  const resetAndLoad = () => {
    currentPage.value = 0;
    fetchLogs();
  };

  const clearFilters = () => {
    filters.value = { userId: '', action: '', from: '', to: '' };
    resetAndLoad();
  };

  onMounted(async () => {
    loadingUsers.value = true;
    try {
      const uRes = await userService.getUsers(0, 1000);
      users.value = uRes.data || [];
    } catch (e) {
      console.error(handleApiError(e).message);
    } finally {
      loadingUsers.value = false;
    }
    fetchLogs();
  });
</script>
