<template>
  <div class="space-y-6">
    <div
      class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchableSelect
          v-model="filters.userId"
          :items="userOptions"
          :label="t('propertyAudit.agentUserLabel')"
          :placeholder="t('propertyAudit.searchAgent')"
          :loading="loadingUsers"
          show-clear-button
        />

        <SearchableSelect
          v-model="filters.propertyId"
          :items="propertyOptions"
          :label="t('propertyAudit.propertyLabel')"
          :placeholder="t('propertyAudit.searchProperty')"
          :loading="loadingProperties"
          show-clear-button
        />

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('propertyAudit.from') }}
            </label>
            <input
              v-model="filters.from"
              type="date"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('propertyAudit.to') }}
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
            {{ t('propertyAudit.filter') }}
          </div>
        </fwb-button>
        <fwb-button @click="clearFilters" color="alternative" size="sm">
          {{ t('propertyAudit.clearFilters') }}
        </fwb-button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500 text-sm">{{ t('propertyAudit.loading') }}</p>
    </div>

    <div v-else-if="logs.length > 0" class="overflow-x-auto">
      <fwb-table hoverable>
        <fwb-table-head>
          <fwb-table-head-cell>{{ t('propertyAudit.table.dateTime') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('propertyAudit.table.agent') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('propertyAudit.table.action') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('propertyAudit.table.property') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('propertyAudit.table.change') }}</fwb-table-head-cell>
          <fwb-table-head-cell>
            <span class="sr-only">{{ t('propertyAudit.table.details') }}</span>
          </fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="log in logs" :key="log.id">
            <fwb-table-cell class="whitespace-nowrap text-xs font-mono">
              {{ formatDateTime(log.timestamp) }}
            </fwb-table-cell>
            <fwb-table-cell>
              <span class="text-xs font-medium">{{ getUserName(log.userId) }}</span>
            </fwb-table-cell>
            <fwb-table-cell>
              <span
                :class="getActionBadgeClass(log.action)"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
              >
                {{ formatAction(log.action) }}
              </span>
            </fwb-table-cell>
            <fwb-table-cell>
              <span class="text-xs">{{ getPropertyName(log.propertyId) }}</span>
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex items-center gap-1 text-[10px]">
                <span class="text-red-500 line-through truncate max-w-[80px]">
                  {{ log.previousValue || '--' }}
                </span>
                <IconLucideArrowRight class="w-3 h-3 text-gray-400" />
                <span class="text-green-600 font-bold truncate max-w-[80px]">
                  {{ log.newValue || '--' }}
                </span>
              </div>
            </fwb-table-cell>
            <fwb-table-cell class="text-right">
              <button @click="openModal(log)" class="text-blue-600 hover:underline text-xs">
                {{ t('propertyAudit.verDetalles') }}
              </button>
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
      <p class="text-gray-500 text-sm">{{ t('propertyAudit.noResultsTitle') }}</p>
    </div>

    <!-- Details Modal -->
    <fwb-modal v-if="selectedLog" @close="selectedLog = null" size="lg">
      <template #header>
        <div class="text-lg font-bold">{{ t('propertyAudit.changeDetailTitle') }}</div>
      </template>
      <template #body>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500 block text-xs">{{ t('propertyAudit.agente') }}</span>
              <p class="font-semibold">{{ getUserName(selectedLog.userId) }}</p>
            </div>
            <div>
              <span class="text-gray-500 block text-xs">{{ t('propertyAudit.propiedad') }}</span>
              <p class="font-semibold">{{ getPropertyName(selectedLog.propertyId) }}</p>
            </div>
          </div>

          <div v-if="selectedLog.changes && selectedLog.changes.length > 0" class="border-t pt-4">
            <h4 class="text-xs font-bold text-gray-500 uppercase mb-2">
              {{ t('propertyAudit.modifiedFields') }}
            </h4>
            <div class="space-y-2">
              <div
                v-for="change in selectedLog.changes"
                :key="change.field"
                class="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm"
              >
                <span class="text-[10px] font-bold text-blue-600">{{ change.field }}</span>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-red-500 line-through">{{ change.oldValue || '--' }}</span>
                  <IconLucideArrowRight class="w-3 h-3 text-gray-400" />
                  <span class="text-green-600 font-bold">{{ change.newValue }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';
  import { auditService, type PropertyAuditLog } from '@/services/auditService';
  import { userService } from '@/services/userService';
  import { propertyService } from '@/modules/properties';
  import SearchableSelect, { type SelectItem } from '@/components/common/SearchableSelect.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import type { User } from '@/types/user';
  import type { Property } from '@/types/property';
  import {
    FwbTable,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableBody,
    FwbTableRow,
    FwbTableCell,
    FwbModal,
    FwbButton,
  } from 'flowbite-vue';
  import IconLucideSearch from '~icons/lucide/search';
  import IconLucideArrowRight from '~icons/lucide/arrow-right';
  import { handleApiError } from '@/api/errorHandler';

  const { t } = useI18n();

  const logs = ref<PropertyAuditLog[]>([]);
  const loading = ref(false);
  const selectedLog = ref<PropertyAuditLog | null>(null);

  const currentPage = ref(0);
  const pageSize = ref(10);
  const totalPages = ref(0);
  const totalLogs = ref(0);

  const users = ref<User[]>([]);
  const properties = ref<Property[]>([]);
  const loadingUsers = ref(false);
  const loadingProperties = ref(false);

  const filters = ref({
    userId: '',
    propertyId: '',
    from: '',
    to: '',
  });

  const userOptions = computed<SelectItem[]>(() =>
    users.value.map((u) => ({
      value: u.id,
      label: u.fullName || `${u.firstName} ${u.lastName}`,
      subtitle: u.email,
    }))
  );

  const propertyOptions = computed<SelectItem[]>(() =>
    properties.value.map((p) => ({ value: p.id, label: p.title, subtitle: p.address }))
  );

  const getUserName = (id?: string) =>
    users.value.find((u) => u.id === id)?.fullName || id || t('auditLogs.unidentifiedUser');

  const getPropertyName = (id?: string) =>
    properties.value.find((p) => p.id === id)?.title || id || '--';

  const formatDateTime = (ts: string) => new Date(ts).toLocaleString(getLocaleString());

  const formatAction = (action: string) => {
    const map: Record<string, string> = {
      STATUS_CHANGE: t('propertyAudit.actions.statusChange'),
      PRICE_UPDATE: t('propertyAudit.actions.priceUpdate'),
      AGENT_ASSIGN: t('propertyAudit.actions.agentAssign'),
      PROPERTY_CREATE: t('propertyAudit.actions.propertyCreate'),
      PROPERTY_UPDATE: t('propertyAudit.actions.propertyUpdate'),
    };
    return map[action] || action;
  };

  const getActionBadgeClass = (action: string) => {
    if (action === 'STATUS_CHANGE') return 'bg-yellow-100 text-yellow-800';
    if (action === 'PRICE_UPDATE') return 'bg-blue-100 text-blue-800';
    if (action === 'PROPERTY_CREATE') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const fetchLogs = async () => {
    loading.value = true;
    try {
      const res = await auditService.getPropertyAudit({
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
    filters.value = { userId: '', propertyId: '', from: '', to: '' };
    resetAndLoad();
  };

  const openModal = (log: PropertyAuditLog) => {
    selectedLog.value = log;
  };

  onMounted(async () => {
    loadingUsers.value = true;
    loadingProperties.value = true;
    try {
      const [uRes, pList] = await Promise.all([
        userService.getUsers(0, 1000),
        propertyService.getProperties(),
      ]);
      users.value = uRes.data || [];
      properties.value = pList || [];
    } catch (e) {
      console.error(handleApiError(e).message);
    } finally {
      loadingUsers.value = false;
      loadingProperties.value = false;
    }
    fetchLogs();
  });
</script>
