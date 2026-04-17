<template>
  <div class="space-y-6">
    <div
      v-for="section in timelineSections"
      :key="section.title"
      class="relative pl-6 border-l-2"
      :class="section.borderColor"
    >
      <div
        class="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900"
        :class="section.dotColor"
      ></div>
      <h4 class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4">
        {{ t(section.title) }}
      </h4>

      <div
        v-if="section.data?.length"
        class="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar"
      >
        <div
          v-for="(item, i) in section.data"
          :key="i"
          class="p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm"
        >
          <slot :name="section.slotName" :item="item">
            <!-- Default rendering if no slot provided -->
            <p class="text-xs">{{ item }}</p>
          </slot>
        </div>
      </div>
      <div
        v-else
        class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic"
      >
        {{ t(section.emptyText) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  defineProps<{
    timelineSections: Array<{
      title: string;
      emptyText: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any[];
      borderColor: string;
      dotColor: string;
      slotName: string;
    }>;
  }>();
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 10px;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #4b5563;
  }
</style>
