<template>
  <fwb-modal v-if="event" @close="$emit('close')">
    <template #header>
      <div>
        <span class="text-xl font-bold">{{ event.propertyName }}</span>
        <p class="text-sm text-gray-500 mt-1">{{ event.propertyAddress }}</p>
      </div>
    </template>
    <template #body>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">{{ t('calendar.agent') }}</span>
          <span class="font-bold dark:text-white">{{ event.agentName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">{{ t('calendar.schedule') }}</span>
          <span class="font-bold dark:text-white">
            {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">{{ t('calendar.statusLabel') }}</span>
          <fwb-badge
            :type="statusType(event.status)"
            size="sm"
            class="text-[10px] font-black uppercase"
          >
            {{ statusLabel(event.status) }}
          </fwb-badge>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex gap-3 flex-wrap w-full">
        <fwb-button @click="$emit('close')" color="alternative" class="flex-1">
          {{ t('common.close') }}
        </fwb-button>
        <template v-if="event.ownEvent && event.status !== 'CANCELLED'">
          <fwb-button @click="$emit('cancel', event)" color="red" class="flex-1">
            {{ t('common.cancel') }}
          </fwb-button>
          <ReassignButton
            class="flex-1"
            :visit-id="event.id"
            :visit-info="`${formatTime(event.startTime)} - ${event.propertyName}`"
            @request-sent="$emit('reassigned')"
          />
        </template>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { FwbModal, FwbButton, FwbBadge } from 'flowbite-vue';
  import type { CalendarEventResponse } from '../types/visitCalendar';
  import { getLocaleString } from '@/core/locales/i18n';
  import ReassignButton from './reassignment/ReassignButton.vue';

  const { t } = useI18n();
  defineProps<{ event: CalendarEventResponse | null }>();
  defineEmits(['close', 'cancel', 'reassigned']);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(getLocaleString(), {
      hour: '2-digit',
      minute: '2-digit',
    });

  const statusType = (s: string): 'yellow' | 'green' | 'red' | 'default' => {
    const map: Record<string, 'yellow' | 'green' | 'red'> = {
      SCHEDULED: 'yellow',
      CONFIRMED: 'green',
      CANCELLED: 'red',
    };
    return map[s] || 'default';
  };
  const statusLabel = (s: string) =>
    ({
      SCHEDULED: t('status.scheduled'),
      CONFIRMED: t('status.confirmed'),
      CANCELLED: t('status.cancelled'),
    })[s] || s;
</script>
