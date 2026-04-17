<template>
  <div
    class="relative overflow-x-auto shadow-md sm:rounded-lg border border-gray-100 dark:border-gray-700 min-h-[200px]"
    style="scrollbar-gutter: stable"
  >
    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 z-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-[1px] flex flex-col items-center justify-center transition-all duration-300"
    >
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3"
      >
        <IconLucideLoader class="animate-spin h-10 w-10 text-blue-600" />
        <p class="text-sm font-bold text-gray-600 dark:text-gray-300">{{ t('common.loading') }}</p>
      </div>
    </div>

    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            class="px-6 py-3"
            :class="col.class"
          >
            {{ col.label }}
          </th>
          <th v-if="hasActions" scope="col" class="px-6 py-3 text-right">
            {{ t('users.table.actions') }}
          </th>
        </tr>
      </thead>
      <tbody :class="{ 'opacity-40 pointer-events-none transition-opacity duration-300': loading }">
        <tr v-if="!loading && items.length === 0" class="bg-white dark:bg-gray-800">
          <td :colspan="columns.length + (hasActions ? 1 : 0)" class="px-6 py-20 text-center">
            <div class="flex flex-col items-center gap-3">
              <div
                class="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center"
              >
                <IconLucideSearch class="w-8 h-8 text-gray-300 dark:text-gray-500" />
              </div>
              <p class="text-gray-500 dark:text-gray-400 font-medium">
                {{ emptyText || t('common.noResults') }}
              </p>
            </div>
          </td>
        </tr>
        <tr
          v-for="(item, index) in items"
          :key="(item as any).id || index"
          class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <td v-for="col in columns" :key="col.key" class="px-6 py-4" :class="col.rowClass">
            <slot :name="'col-' + col.key" :item="item" :value="(item as any)[col.key]">
              {{ (item as any)[col.key] }}
            </slot>
          </td>
          <td v-if="hasActions" class="px-6 py-4 text-right">
            <div class="flex justify-end gap-2">
              <slot name="actions" :item="item"></slot>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
  export interface TableColumn {
    key: string;
    label: string;
    class?: string;
    rowClass?: string;
  }
</script>

<script setup lang="ts" generic="T extends Record<string, any>">
  import { useI18n } from 'vue-i18n';
  import IconLucideLoader from '~icons/lucide/loader';
  import IconLucideSearch from '~icons/lucide/search';

  const { t } = useI18n();

  defineProps<{
    columns: TableColumn[];
    items: T[];
    loading?: boolean;
    hasActions?: boolean;
    emptyText?: string;
  }>();
</script>
