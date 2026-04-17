<template>
  <div>
    <PageHeader :title="t('operations.title')" :subtitle="t('operations.subtitle')" />

    <PageContainer>
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <DataTable
          :columns="columns"
          :items="operations"
          :loading="loading"
          has-actions
          @row-click="$router.push(`/operations/${$event.id}`)"
        >
          <template #col-operationType="{ value }">
            <FwbBadge type="default" size="sm">
              {{ value || t('operations.standardBadge') }}
            </FwbBadge>
          </template>
          <template #col-propertyName="{ item }">
            <div class="flex flex-col">
              <span class="font-bold text-gray-900 dark:text-white">
                {{ item.propertyName || t('operations.noName') }}
              </span>
              <span class="text-xs text-gray-500">
                {{ item.clientName || t('operations.noClient') }}
              </span>
            </div>
          </template>
          <template #col-createdAt="{ value }">{{ formatDate(value) }}</template>
          <template #col-status="{ value }">
            <FwbBadge :type="badgeType(value)" size="sm">
              {{ value || t('status.pending') }}
            </FwbBadge>
          </template>
          <template #actions="{ item }">
            <button
              @click.stop="$router.push(`/operations/${item.id}`)"
              class="text-blue-600 hover:underline text-xs flex items-center gap-1"
            >
              {{ t('common.viewDetails') }}
              <IconLucideChevronRight class="w-3 h-3" />
            </button>
          </template>
        </DataTable>
      </div>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbBadge } from 'flowbite-vue';
  import IconLucideChevronRight from '~icons/lucide/chevron-right';

  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';
  import { useOperations } from '../composables/useOperations';
  import DataTable, { type TableColumn } from '@/shared/components/ui/DataTable.vue';
  import { getLocaleString } from '@/core/locales/i18n';

  const { t } = useI18n();
  const { operations, loading, load } = useOperations();

  const columns: TableColumn[] = [
    { key: 'operationType', label: t('common.type') },
    { key: 'propertyName', label: t('propertyForm.title') },
    { key: 'agentName', label: t('operations.agent') },
    { key: 'createdAt', label: t('operations.date') },
    { key: 'status', label: t('common.status') },
  ];

  const formatDate = (iso?: string) =>
    !iso
      ? t('common.notSpecified')
      : new Date(iso).toLocaleDateString(getLocaleString(), {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  const badgeType = (s?: string): 'green' | 'dark' | 'red' | 'yellow' => {
    const types: Record<string, 'green' | 'dark' | 'red' | 'yellow'> = {
      ACTIVE: 'green',
      CLOSED: 'dark',
      CANCELLED: 'red',
      PENDING: 'yellow',
    };
    return types[s || ''] || 'dark';
  };

  onMounted(load);
</script>
