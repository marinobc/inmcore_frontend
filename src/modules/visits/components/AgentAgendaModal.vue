<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="xl">
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg"
        >
          <IconLucideCalendar class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-xl font-bold dark:text-white">{{ t('scheduleVisit.dayAgenda') }}</h3>
          <p class="text-xs text-gray-500">{{ agentName }} · {{ formattedDate }}</p>
        </div>
      </div>
    </template>
    <template #body>
      <div v-if="loading" class="flex justify-center py-10">
        <IconLucideLoader class="animate-spin h-8 w-8 text-blue-600" />
      </div>
      <div
        v-else-if="agenda.length === 0"
        class="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed"
      >
        <p class="text-gray-500">{{ t('common.noResults') }}</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="ev in sortedAgenda"
          :key="ev.id"
          class="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm"
          :class="
            ev.ownEvent
              ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800'
              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
          "
        >
          <div class="text-center min-w-[60px]">
            <p class="text-sm font-bold text-gray-900 dark:text-white">
              {{ formatShortTime(ev.startTime) }}
            </p>
            <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              {{ t('scheduleVisit.start') }}
            </p>
          </div>
          <div class="h-10 w-px bg-gray-100 dark:bg-gray-700"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-gray-900 dark:text-white truncate">
              {{ ev.propertyName }}
            </p>
            <p class="text-xs text-gray-500 flex items-center gap-1">
              <IconLucideUser class="w-3 h-3" />
              {{ ev.ownEvent ? t('scheduleVisit.youAreResponsible') : ev.agentName }}
            </p>
          </div>
          <div v-if="ev.ownEvent" class="shrink-0">
            <span
              class="px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg"
            >
              {{ t('common.mine') || 'Mía' }}
            </span>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <fwb-button color="alternative" @click="$emit('close')" class="rounded-xl">
          {{ t('common.close') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton, FwbModal } from 'flowbite-vue';
  import IconLucideCalendar from '~icons/lucide/calendar';
  import IconLucideLoader from '~icons/lucide/loader';
  import IconLucideUser from '~icons/lucide/user';
  import { getLocaleString } from '@/core/locales/i18n';
  import type { CalendarEventResponse } from '../types/visitCalendar';

  const props = defineProps<{
    show: boolean;
    loading?: boolean;
    agenda: CalendarEventResponse[];
    agentName: string;
    date?: string;
  }>();

  defineEmits(['close']);

  const { t } = useI18n();

  const sortedAgenda = computed(() => {
    return [...props.agenda].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  });

  const formattedDate = computed(() => {
    if (!props.date) return '';
    return new Date(props.date).toLocaleDateString(getLocaleString(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  });

  const formatShortTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(getLocaleString(), {
      hour: '2-digit',
      minute: '2-digit',
    });
</script>
