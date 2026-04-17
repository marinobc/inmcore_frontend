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
      @view-details="selectedLog = $event"
    >
      <template #filters>
        <SearchableSelect
          v-model="filters.personId"
          :items="profileOptions"
          :label="t('audit.filters.profile')"
          :placeholder="t('audit.filters.searchProfile')"
          :loading="loadingProfiles"
          show-clear-button
        />
        <div class="flex flex-col">
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {{ t('audit.filters.action') }}
          </label>
          <select
            v-model="filters.action"
            class="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block p-2.5"
          >
            <option value="">{{ t('audit.actions.all') }}</option>
            <option value="CREATED">
              {{ t('auditLogs.actions.creations') }}
            </option>
            <option value="UPDATED">{{ t('auditLogs.actions.edits') }}</option>
            <option value="BAJA">{{ t('auditLogs.actions.removals') }}</option>
          </select>
        </div>
      </template>

      <template #col-timestamp="{ value }">{{ formatDateTime(value) }}</template>
      <template #col-personId="{ value }">{{ getProfileName(value) }}</template>
      <template #col-action="{ value }">
        <span
          :class="getActionBadgeClass(value)"
          class="px-2 py-0.5 rounded-full text-[10px] font-bold"
        >
          {{ getActionLabel(value) }}
        </span>
      </template>
      <template #col-changedBy="{ value }">
        {{ value || t('auditLogs.unidentifiedUser') }}
      </template>
      <template #col-changes="{ value }">
        <div v-if="value?.length" class="flex flex-wrap gap-1">
          <fwb-badge v-for="c in value" :key="c.field" type="dark" size="sm">
            {{ c.field }}
          </fwb-badge>
        </div>
        <span v-else class="text-xs text-gray-400">--</span>
      </template>
    </AuditLayout>

    <!-- Details Modal -->
    <AuditDetailsModal :log="selectedLog" @close="selectedLog = null" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbBadge } from 'flowbite-vue';

  import { auditService, type ProfileAuditLog } from '../services/auditService';
  import { apiClient as api } from '@/core/api';
  import { getLocaleString } from '@/core/locales/i18n';
  import { handleApiError } from '@/core/api/errorHandler';

  import SearchableSelect from '@/shared/components/common/SearchableSelect.vue';
  import AuditLayout from './AuditLayout.vue';
  import AuditDetailsModal from './AuditDetailsModal.vue';
  import type { TableColumn } from '@/shared/components/ui/DataTable.vue';

  const { t } = useI18n();

  interface Person {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }

  const logs = ref<ProfileAuditLog[]>([]);
  const loading = ref(false);
  const selectedLog = ref<ProfileAuditLog | null>(null);
  const currentPage = ref(0);
  const pageSize = ref(10);
  const totalPages = ref(0);
  const totalLogs = ref(0);
  const profiles = ref<Person[]>([]);
  const loadingProfiles = ref(false);

  const filters = ref({
    personId: '',
    changedBy: '',
    action: '',
    from: '',
    to: '',
  });

  const columns: TableColumn[] = [
    { key: 'timestamp', label: t('audit.table.dateTime') },
    { key: 'personId', label: t('audit.table.profile') },
    { key: 'action', label: t('audit.table.action') },
    { key: 'changedBy', label: t('audit.table.changedBy') },
    { key: 'changes', label: t('audit.table.changes') },
  ];

  const profileOptions = computed(() =>
    profiles.value.map((p) => ({
      value: p.id,
      label: `${p.firstName} ${p.lastName}`,
      subtitle: p.email,
    }))
  );
  const getProfileName = (id: string) => {
    const p = profiles.value.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };
  const formatDateTime = (ts: string) => new Date(ts).toLocaleString(getLocaleString());

  const getActionBadgeClass = (a: string) =>
    ({
      CREATED: 'bg-green-100 text-green-800',
      UPDATED: 'bg-blue-100 text-blue-800',
      BAJA: 'bg-red-100 text-red-800',
    })[a] || 'bg-gray-100 text-gray-800';

  const getActionLabel = (a: string) =>
    ({
      CREATED: t('auditLogs.actions.creation'),
      UPDATED: t('auditLogs.actions.edit'),
      BAJA: t('auditLogs.actions.removal'),
    })[a] || a;

  const fetchLogs = async () => {
    loading.value = true;
    try {
      const res = await auditService.getProfileAudit({
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
    filters.value = { personId: '', changedBy: '', action: '', from: '', to: '' };
    currentPage.value = 0;
    fetchLogs();
  };

  onMounted(async () => {
    loadingProfiles.value = true;
    try {
      const res = await api.get('/persons', {
        params: { page: 0, pageSize: 1000 },
      });
      profiles.value = res.data.data || [];
    } catch (e: unknown) {
      console.error(handleApiError(e).message);
    } finally {
      loadingProfiles.value = false;
    }
    fetchLogs();
  });
</script>
