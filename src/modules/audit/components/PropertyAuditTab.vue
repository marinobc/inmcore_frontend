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
      </template>

      <template #col-timestamp="{ value }">{{ formatDateTime(value) }}</template>
      <template #col-userId="{ value }">{{ getUserName(value) }}</template>
      <template #col-action="{ value }">
        <span
          :class="getActionBadgeClass(value)"
          class="px-2 py-0.5 rounded-full text-[10px] font-bold"
        >
          {{ formatAction(value) }}
        </span>
      </template>
      <template #col-propertyId="{ value }">{{ getPropertyName(value) }}</template>
      <template #col-change="{ item }">
        <div class="flex items-center gap-1 text-[10px]">
          <span class="text-red-500 line-through truncate max-w-[80px]">
            {{ item.previousValue || '--' }}
          </span>
          <IconLucideArrowRight class="w-3 h-3 text-gray-400" />
          <span class="text-green-600 font-bold truncate max-w-[80px]">
            {{ item.newValue || '--' }}
          </span>
        </div>
      </template>
    </AuditLayout>

    <!-- Details Modal -->
    <AuditDetailsModal :log="selectedLog" @close="selectedLog = null" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import IconLucideArrowRight from '~icons/lucide/arrow-right';

  import { auditService, type PropertyAuditLog } from '../services/auditService';
  import { userService } from '@/modules/users/services/userService';
  import type { User } from '@/modules/users/types/user';
  import { propertyService } from '@/modules/properties';
  import type { Property } from '@/modules/properties/types/property';
  import { getLocaleString } from '@/core/locales/i18n';

  import SearchableSelect from '@/shared/components/common/SearchableSelect.vue';
  import AuditLayout from './AuditLayout.vue';
  import AuditDetailsModal from './AuditDetailsModal.vue';
  import type { TableColumn } from '@/shared/components/ui/DataTable.vue';

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

  const filters = ref({ userId: '', propertyId: '', from: '', to: '' });

  const columns: TableColumn[] = [
    { key: 'timestamp', label: t('propertyAudit.table.dateTime') },
    { key: 'userId', label: t('propertyAudit.table.agent') },
    { key: 'action', label: t('propertyAudit.table.action') },
    { key: 'propertyId', label: t('propertyAudit.table.property') },
    { key: 'change', label: t('propertyAudit.table.change') },
  ];

  const userOptions = computed(() =>
    users.value.map((u) => ({
      value: u.id,
      label: u.fullName || u.email,
      subtitle: u.email,
    }))
  );
  const propertyOptions = computed(() =>
    properties.value.map((p) => ({
      value: p.id,
      label: p.title,
      subtitle: p.address,
    }))
  );

  const getUserName = (id?: string) =>
    users.value.find((u) => u.id === id)?.fullName || id || t('common.user');
  const getPropertyName = (id?: string) =>
    properties.value.find((p) => p.id === id)?.title || id || '--';
  const formatDateTime = (ts: string) => new Date(ts).toLocaleString(getLocaleString());

  const formatAction = (a: string) =>
    ({
      STATUS_CHANGE: t('propertyAudit.actions.statusChange'),
      PRICE_UPDATE: t('propertyAudit.actions.priceUpdate'),
      AGENT_ASSIGN: t('propertyAudit.actions.agentAssign'),
      PROPERTY_CREATE: t('propertyAudit.actions.propertyCreate'),
      PROPERTY_UPDATE: t('propertyAudit.actions.propertyUpdate'),
    })[a] || a;

  const getActionBadgeClass = (a: string) =>
    ({
      STATUS_CHANGE: 'bg-yellow-100 text-yellow-800',
      PRICE_UPDATE: 'bg-blue-100 text-blue-800',
      PROPERTY_CREATE: 'bg-green-100 text-green-800',
    })[a] || 'bg-gray-100 text-gray-800';

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
    } finally {
      loading.value = false;
    }
  };

  const clearFilters = () => {
    filters.value = { userId: '', propertyId: '', from: '', to: '' };
    currentPage.value = 0;
    fetchLogs();
  };

  onMounted(async () => {
    loadingUsers.value = true;
    loadingProperties.value = true;
    try {
      const [uRes, pRes] = await Promise.all([
        userService.getUsers(0, 1000),
        propertyService.getProperties(),
      ]);
      users.value = uRes.data || [];
      properties.value = pRes.data || [];
    } finally {
      loadingUsers.value = false;
      loadingProperties.value = false;
    }
    fetchLogs();
  });
</script>
