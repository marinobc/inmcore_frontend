<template>
  <div
    class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
  >
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <IconLucideFileText class="w-8 h-8 text-red-500 shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
          {{ doc.originalFileName }}
        </p>
        <div class="flex items-center gap-2 mt-0.5">
          <span :class="statusBadge(doc.status)" class="text-xs px-2 py-0.5 rounded-full">
            {{ statusLabel(doc.status) }}
          </span>
          <span class="text-xs text-gray-500">
            {{ formatFileSize(doc.fileSize) }} ·
            {{ formatDate(doc.uploadedAt) }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <button
        @click="$emit('download', doc)"
        :disabled="isDownloadDisabled"
        :title="downloadTitle"
        :class="[
          'p-2 rounded-lg transition-colors relative',
          isDownloadDisabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30',
        ]"
      >
        <IconLucideDownload class="w-5 h-5" />
        <span
          v-if="timeRemaining"
          class="absolute -top-1 -right-1 text-[9px] bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center"
        >
          {{ t('documentUpload.timeRemaining', { n: timeRemaining }) }}
        </span>
      </button>

      <button
        v-if="isAdmin"
        @click="$emit('permissions', doc)"
        class="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
        :title="t('documentUpload.configurePermissions')"
      >
        <IconLucideSettings class="w-5 h-5" />
      </button>

      <button
        v-if="isAdmin"
        @click="$emit('delete', doc)"
        class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
      >
        <IconLucideTrash class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideDownload from '~icons/lucide/download';
  import IconLucideTrash from '~icons/lucide/trash';
  import IconLucideSettings from '~icons/lucide/settings';
  import { getLocaleString } from '@/core/locales/i18n';
  import type { DocumentResponse } from '../services/documentService';

  const { t } = useI18n();
  const props = defineProps<{
    doc: DocumentResponse;
    isAdmin: boolean;
    isDownloaded: boolean;
    timeRemaining: number | null;
  }>();
  defineEmits(['download', 'delete', 'permissions']);

  const isDownloadDisabled = computed(
    () =>
      !props.isAdmin &&
      (props.isDownloaded || (props.timeRemaining !== null && props.timeRemaining <= 0))
  );

  const downloadTitle = computed(() => {
    if (props.isAdmin) return t('documentUpload.download');
    if (props.isDownloaded) return t('documentUpload.downloadAlreadyUsed');
    if (props.timeRemaining !== null)
      return t('documentUpload.downloadExpires', { n: props.timeRemaining });
    return t('documentUpload.download');
  });

  const statusBadge = (s: string) =>
    ({
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    })[s] || 'bg-gray-100';

  const statusLabel = (s: string) => t(`documentUpload.status.${s.toLowerCase()}`) || s;
  const formatFileSize = (b?: number) =>
    !b
      ? '-'
      : b < 1024
        ? b + ' B'
        : b < 1048576
          ? (b / 1024).toFixed(1) + ' KB'
          : (b / 1048576).toFixed(1) + ' MB';
  const formatDate = (d?: string) => (!d ? '-' : new Date(d).toLocaleDateString(getLocaleString()));
</script>
