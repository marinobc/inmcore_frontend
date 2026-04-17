<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-2 flex items-center justify-between"
  >
    <fwb-button
      @click="$emit('prev')"
      color="alternative"
      class="h-11 w-11 !p-0 flex items-center justify-center rounded-xl border-none hover:bg-gray-50"
    >
      <IconLucideChevronLeft class="h-6 w-6" />
    </fwb-button>

    <div class="flex items-center gap-4">
      <button
        @click="$emit('today')"
        class="px-6 py-2 text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
      >
        {{ t('calendar.today') }}
      </button>
      <div class="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
      <span class="text-sm font-bold text-gray-900 dark:text-white">
        {{ label }}
      </span>
    </div>

    <fwb-button
      @click="$emit('next')"
      color="alternative"
      class="h-11 w-11 !p-0 flex items-center justify-center rounded-xl border-none hover:bg-gray-50"
    >
      <IconLucideChevronRight class="h-6 w-6" />
    </fwb-button>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { FwbButton } from 'flowbite-vue';
  import IconLucideChevronLeft from '~icons/lucide/chevron-left';
  import IconLucideChevronRight from '~icons/lucide/chevron-right';

  const { t } = useI18n();

  defineProps<{
    label: string;
  }>();

  defineEmits(['prev', 'next', 'today']);
</script>
