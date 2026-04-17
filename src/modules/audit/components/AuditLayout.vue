<template>
  <div class="space-y-6 pt-6">
    <!-- Filter Bar -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <slot name="filters"></slot>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('common.from') || 'From' }}
            </label>
            <input
              v-model="internalFilters.from"
              type="date"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('common.to') || 'To' }}
            </label>
            <input
              v-model="internalFilters.to"
              type="date"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <fwb-button @click="$emit('apply')" gradient="blue" size="sm">
          <div class="flex items-center gap-2">
            <IconLucideSearch class="w-4 h-4" />
            {{ t('common.filter') }}
          </div>
        </fwb-button>
        <fwb-button @click="$emit('clear')" color="alternative" size="sm">
          {{ t('common.clearFilters') || 'Clear Filters' }}
        </fwb-button>
      </div>
    </div>

    <!-- Data Table Container -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <DataTable :columns="columns" :items="items" :loading="loading" has-actions>
        <!-- Re-expose slots to the parent -->
        <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
          <slot :name="slotName" v-bind="slotProps"></slot>
        </template>

        <template #actions="{ item }">
          <button
            @click="$emit('view-details', item)"
            class="text-blue-600 hover:underline text-xs"
          >
            {{ t('common.viewDetails') || 'View Details' }}
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Pagination -->
    <Pagination
      v-model:current-page="currentPageModel"
      v-model:page-size="pageSizeModel"
      :total-pages="totalPages"
      :total="total"
      @change="$emit('apply')"
    />
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton } from 'flowbite-vue';
  import IconLucideSearch from '~icons/lucide/search';
  import DataTable, { type TableColumn } from '@/shared/components/ui/DataTable.vue';
  import Pagination from '@/shared/components/ui/Pagination.vue';

  const { t } = useI18n();

  const props = defineProps<{
    columns: TableColumn[];
    items: T[];
    loading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters: any;
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }>();

  const emit = defineEmits([
    'update:filters',
    'update:currentPage',
    'update:pageSize',
    'apply',
    'clear',
    'view-details',
  ]);

  const internalFilters = computed({
    get: () => props.filters,
    set: (val) => emit('update:filters', val),
  });

  const currentPageModel = computed({
    get: () => props.currentPage,
    set: (val) => emit('update:currentPage', val),
  });

  const pageSizeModel = computed({
    get: () => props.pageSize,
    set: (val) => emit('update:pageSize', val),
  });
</script>
