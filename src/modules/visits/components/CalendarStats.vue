<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-center shadow-sm"
    >
      <p class="text-3xl font-bold tracking-tight" :class="stat.class">{{ stat.value }}</p>
      <p
        class="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mt-1"
      >
        {{ t(stat.label) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  export interface CalendarStat {
    label: string;
    value: number | string;
    class: string;
  }

  defineProps<{
    stats: CalendarStat[];
  }>();
</script>
