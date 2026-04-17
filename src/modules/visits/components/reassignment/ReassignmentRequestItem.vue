<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
  >
    <div
      class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-3"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0"
        >
          <IconLucideUser class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p class="font-semibold text-gray-800 dark:text-white text-sm">
            {{ t('reassignmentInbox.agentId') }} {{ request.requestingAgentId }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('reassignmentInbox.requestedLabel') }} ·
            {{ formatDate(request.requestedAt) }}
          </p>
        </div>
      </div>
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 shrink-0"
      >
        {{ t('reassignmentInbox.pending') }}
      </span>
    </div>

    <div class="px-5 py-4 space-y-3">
      <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <IconLucideCalendar class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
        <span class="text-gray-500 dark:text-gray-400">
          {{ t('reassignmentInbox.visitIdLabel') }}
        </span>
        <span class="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
          {{ request.visitId }}
        </span>
      </div>
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
        <p
          class="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1 uppercase tracking-wide"
        >
          {{ t('reassignmentInbox.reason') }}
        </p>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          {{ request.reason }}
        </p>
      </div>
    </div>

    <div class="px-5 pb-5 flex gap-3">
      <button
        @click="$emit('respond', 'ACCEPTED')"
        :disabled="processing"
        class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
      >
        <IconLucideCheck class="w-4 h-4" />
        {{ t('reassignmentInbox.accept') }}
      </button>
      <button
        @click="$emit('respond', 'REJECTED')"
        :disabled="processing"
        class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 transition"
      >
        <IconLucideX class="w-4 h-4" />
        {{ t('reassignmentInbox.reject') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import IconLucideUser from '~icons/lucide/user';
  import IconLucideCalendar from '~icons/lucide/calendar';
  import IconLucideCheck from '~icons/lucide/check';
  import IconLucideX from '~icons/lucide/x';
  import { getLocaleString } from '@/core/locales/i18n';
  import type { ReassignmentSolicitation } from '@/modules/visits/types/reassignment';

  const { t } = useI18n();
  defineProps<{ request: ReassignmentSolicitation; processing?: boolean }>();
  defineEmits(['respond']);

  const formatDate = (iso: string) =>
    !iso
      ? ''
      : new Date(iso).toLocaleString(getLocaleString(), {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
</script>
