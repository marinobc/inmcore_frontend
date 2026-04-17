<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { CalendarEventResponse } from '@/modules/visits/types/visitCalendar';
  import { getLocaleString } from '@/core/locales/i18n';

  const props = defineProps<{
    days: Date[];
    events: CalendarEventResponse[];
  }>();

  const emit = defineEmits<{
    (e: 'select', event: CalendarEventResponse): void;
  }>();

  const gridDays = computed(() => {
    const days = [...props.days];
    // Fill with empty days to start on correct weekday if needed
    // (Simplified for this example)
    return days;
  });

  const { t } = useI18n();

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString(getLocaleString(), {
      hour: '2-digit',
      minute: '2-digit',
    });

  const eventsForDay = (day: Date) =>
    props.events.filter((ev) => new Date(ev.startTime).toDateString() === day.toDateString());

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
  const dayName = (d: Date) => d.toLocaleString(getLocaleString(), { weekday: 'short' });

  function eventCardClass(ev: CalendarEventResponse) {
    if (ev.status === 'CANCELLED')
      return 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 line-through';
    return ev.ownEvent
      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 border-blue-500'
      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200';
  }
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm transition-colors"
  >
    <!-- Header -->
    <div class="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
      <div
        v-for="(day, idx) in gridDays"
        :key="idx"
        class="p-4 text-center border-r border-gray-50 dark:border-gray-700 last:border-r-0"
        :class="{ 'bg-blue-50/20 dark:bg-blue-900/10': isToday(day) }"
      >
        <p class="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500">
          {{ dayName(day) }}
        </p>
        <p
          class="text-lg font-bold mt-0.5"
          :class="
            isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
          "
        >
          {{ day.getDate() }}
        </p>
      </div>
    </div>

    <!-- Body -->
    <div class="grid grid-cols-7 min-h-[450px]">
      <div
        v-for="(day, idx) in gridDays"
        :key="idx"
        class="border-r border-gray-50 dark:border-gray-700 last:border-r-0 p-2 space-y-2"
        :class="{ 'bg-blue-50/20 dark:bg-blue-900/5': isToday(day) }"
      >
        <button
          v-for="ev in eventsForDay(day)"
          :key="ev.id"
          @click="emit('select', ev)"
          class="w-full text-left p-2 text-[11px] leading-tight rounded-lg border-l-4 transition-all hover:scale-[1.02] shadow-sm truncate"
          :class="eventCardClass(ev)"
          :title="ev.propertyName"
        >
          <div class="font-bold truncate">{{ ev.propertyName }}</div>
          <div class="opacity-80 mt-1">{{ formatTime(ev.startTime) }}</div>
        </button>

        <p
          v-if="eventsForDay(day).length === 0"
          class="text-[10px] text-gray-300 dark:text-gray-600 text-center mt-10 italic"
        >
          {{ t('calendar.freeDay') }}
        </p>
      </div>
    </div>
  </div>
</template>
