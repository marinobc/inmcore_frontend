<template>
  <fwb-alert v-if="requests.length > 0" type="warning" class="rounded-xl shadow-sm">
    <div class="flex items-center justify-between gap-3 mb-2">
      <div>
        <span class="text-sm font-bold">{{ t('calendar.pendingRequestsTitle') }}</span>
        <p class="text-xs mt-1">
          {{ t('calendar.pendingRequestsText', { n: requests.length }) }}
        </p>
      </div>
      <fwb-button @click="$emit('refresh')" color="alternative" size="xs">
        {{ t('calendar.update') }}
      </fwb-button>
    </div>

    <div class="space-y-3">
      <fwb-card
        v-for="req in requests.slice(0, 5)"
        :key="req.id"
        class="border-amber-100 dark:border-gray-700"
      >
        <div class="flex items-start justify-between gap-3 p-3">
          <div class="min-w-0">
            <p class="text-sm font-semibold truncate">{{ req.propertyName }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-300">
              {{ t('calendar.client') }} {{ req.clientName }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatDateTime(req.preferredDateTime) }}
            </p>
          </div>
          <fwb-badge type="yellow" size="sm" class="text-[10px] font-bold">
            {{ t('status.pending') }}
          </fwb-badge>
        </div>
        <div class="flex gap-2 p-3 pt-0">
          <fwb-button @click="$emit('accept', req.id)" color="green" size="xs">
            {{ t('common.accept') }}
          </fwb-button>
          <fwb-button @click="$emit('reject', req.id)" color="red" size="xs">
            {{ t('common.reject') }}
          </fwb-button>
        </div>
      </fwb-card>
    </div>
  </fwb-alert>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { FwbAlert, FwbCard, FwbBadge, FwbButton } from 'flowbite-vue';
  import type { VisitRequestResponse } from '../types/visitCalendar';
  import { getLocaleString } from '@/core/locales/i18n';

  const { t } = useI18n();
  defineProps<{ requests: VisitRequestResponse[] }>();
  defineEmits(['refresh', 'accept', 'reject']);

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(getLocaleString(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
</script>
