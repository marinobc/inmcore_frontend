<template>
  <fwb-modal v-if="log" @close="$emit('close')" size="lg">
    <template #header>
      <div class="text-lg font-bold">{{ t('audit.detailsTitle') }}</div>
    </template>
    <template #body>
      <div class="space-y-6">
        <!-- Metadata -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500 block text-xs uppercase font-black">
              {{ t('audit.table.dateTime') }}
            </span>
            <p class="font-semibold dark:text-white">
              {{ formatDate(log.timestamp) }}
            </p>
          </div>
          <div>
            <span class="text-gray-500 block text-xs uppercase font-black">
              {{ t('audit.table.action') }}
            </span>
            <p class="font-semibold dark:text-white">{{ log.action }}</p>
          </div>
          <div v-if="log.userId || (log as any).userEmail">
            <span class="text-gray-500 block text-xs uppercase font-black">
              {{ t('audit.table.user') }}
            </span>
            <p class="font-semibold dark:text-white">
              {{ (log as any).userEmail || log.userId }}
            </p>
          </div>
          <div v-if="(log as any).propertyId">
            <span class="text-gray-500 block text-xs uppercase font-black">
              {{ t('propertyAudit.propiedad') }}
            </span>
            <p class="font-semibold dark:text-white">
              {{ (log as any).propertyId }}
            </p>
          </div>
        </div>

        <!-- Details String (Fallback) -->
        <div
          v-if="log.details"
          class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800"
        >
          <span class="text-[10px] font-bold text-blue-600 uppercase">
            {{ t('audit.table.details') }}
          </span>
          <p class="text-sm mt-1 dark:text-gray-200">{{ log.details }}</p>
        </div>

        <!-- Changes List -->
        <div v-if="log.changes && log.changes.length > 0" class="border-t pt-4">
          <h4 class="text-xs font-bold text-gray-500 uppercase mb-3">
            {{ t('propertyAudit.modifiedFields') }}
          </h4>
          <div class="space-y-3">
            <div
              v-for="change in log.changes"
              :key="change.field"
              class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600"
            >
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-black text-blue-600 uppercase tracking-tighter">
                  {{ change.field }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] text-gray-400 uppercase font-medium mb-0.5">
                    {{ t('audit.oldValue') || 'Anterior' }}
                  </p>
                  <p
                    class="text-sm text-red-500 line-through truncate font-mono bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded"
                  >
                    {{ change.oldValue || '--' }}
                  </p>
                </div>
                <IconLucideArrowRight class="w-4 h-4 text-gray-300 mt-4" />
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] text-gray-400 uppercase font-medium mb-0.5">
                    {{ t('audit.newValue') || 'Nuevo' }}
                  </p>
                  <p
                    class="text-sm text-green-600 font-bold truncate font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded"
                  >
                    {{ change.newValue || '--' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <fwb-button color="alternative" @click="$emit('close')">
          {{ t('common.close') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { FwbModal, FwbButton } from 'flowbite-vue';
  import IconLucideArrowRight from '~icons/lucide/arrow-right';
  import { getLocaleString } from '@/core/locales/i18n';
  import type { BaseAuditLog } from '../services/auditService';

  const { t } = useI18n();

  defineProps<{
    log: BaseAuditLog | null;
  }>();

  defineEmits(['close']);

  const formatDate = (ts: string) => new Date(ts).toLocaleString(getLocaleString());
</script>
