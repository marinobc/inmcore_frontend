<template>
  <div>
    <div v-if="loading" class="space-y-3">
      <FwbCard v-for="i in 3" :key="i" class="flex items-center gap-4 animate-pulse">
        <div class="w-10 h-10 bg-gray-200 rounded-lg shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-200 rounded w-1/2" />
          <div class="h-3 bg-gray-200 rounded w-1/3" />
        </div>
        <div class="h-8 w-20 bg-gray-200 rounded-lg" />
      </FwbCard>
    </div>

    <FwbCard
      v-else-if="receipts.length === 0"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <IconLucideClipboardList class="w-7 h-7 text-gray-400" />
      </div>
      <p class="text-sm font-medium text-gray-600">{{ t('receipts.emptyTitle') }}</p>
      <p class="text-xs text-gray-400 mt-1">{{ t('receipts.emptySubtext') }}</p>
    </FwbCard>

    <div v-else class="space-y-3">
      <FwbCard
        v-for="receipt in receipts"
        :key="receipt.id"
        class="flex items-center gap-4 hover:shadow-md transition-shadow"
      >
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
          :class="isPdf(receipt) ? 'bg-red-500' : 'bg-emerald-500'"
        >
          <IconLucideFileText v-if="isPdf(receipt)" class="w-5 h-5" />
          <IconLucideImage v-else class="w-5 h-5" />
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate" :title="receipt.originalFileName">
            {{ receipt.originalFileName }}
          </p>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            <span class="text-xs text-gray-500">{{ receipt.concept }}</span>
            <span class="text-gray-300 text-xs">·</span>
            <span class="text-xs text-gray-500">{{ formatDate(receipt.paymentDate) }}</span>
            <span class="text-gray-300 text-xs">·</span>
            <span class="text-xs text-gray-400">{{ formatSize(receipt.fileSizeBytes) }}</span>
          </div>
        </div>

        <div class="text-right shrink-0 hidden sm:block">
          <p class="text-sm font-bold text-gray-800">
            {{ formatAmount(receipt.amount, receipt.currency) }}
          </p>
          <p class="text-xs text-gray-400">
            {{ formatDate(receipt.uploadedAt) }}
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <FwbButton
            v-if="receipt.downloadUrl"
            :href="receipt.downloadUrl"
            target="_blank"
            rel="noopener noreferrer"
            color="alternative"
            size="xs"
            class="text-blue-700 bg-blue-50 hover:bg-blue-100 border-0"
          >
            <IconLucideDownload class="w-3.5 h-3.5 mr-1.5" />
            {{ t('receipts.download') }}
          </FwbButton>

          <FwbButton
            @click="confirmDelete(receipt)"
            :disabled="deletingId === receipt.id"
            color="alternative"
            size="xs"
            class="text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
          >
            <IconLucideLoader
              v-if="deletingId === receipt.id"
              class="animate-spin w-3.5 h-3.5 mr-1.5"
            />
            <IconLucideTrash v-else class="w-3.5 h-3.5 mr-1.5" />
            {{ t('receipts.delete') }}
          </FwbButton>
        </div>
      </FwbCard>
    </div>

    <FwbModal v-if="showDeleteModal" @close="showDeleteModal = false" size="md">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="bg-red-100 rounded-full p-2">
            <IconLucideTrash class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 class="font-semibold text-lg">{{ t('receipts.deleteTitle') }}</h3>
            <p class="text-red-500 text-sm">{{ t('receipts.deleteWarning') }}</p>
          </div>
        </div>
      </template>

      <template #body>
        <p class="text-sm text-gray-700">
          {{ t('receipts.deleteConfirm', { name: receiptToDelete?.originalFileName }) }}
        </p>
      </template>

      <template #footer>
        <div class="flex gap-3 justify-end w-full">
          <FwbButton @click="showDeleteModal = false" color="alternative">
            {{ t('receipts.cancel') }}
          </FwbButton>
          <FwbButton @click="handleDelete" color="red" :disabled="!receiptToDelete">
            {{ t('receipts.delete') }}
          </FwbButton>
        </div>
      </template>
    </FwbModal>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  import IconLucideClipboardList from '~icons/lucide/clipboard-list';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideDownload from '~icons/lucide/download';
  import IconLucideTrash from '~icons/lucide/trash';
  import IconLucideLoader from '~icons/lucide/loader';
  import { ref } from 'vue';
  import { FwbCard, FwbButton, FwbModal } from 'flowbite-vue';
  import type { Receipt } from '@/types/receipt';
  import { getLocaleString } from '@/locales/i18n';

  const { t } = useI18n();

  defineProps<{
    receipts: Receipt[];
    loading: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'delete', receiptId: string): void;
  }>();

  const receiptToDelete = ref<Receipt | null>(null);
  const deletingId = ref<string | null>(null);
  const showDeleteModal = ref(false);

  function confirmDelete(receipt: Receipt) {
    receiptToDelete.value = receipt;
    showDeleteModal.value = true;
  }

  function handleDelete() {
    if (!receiptToDelete.value) return;
    deletingId.value = receiptToDelete.value.id;
    emit('delete', receiptToDelete.value.id);
    showDeleteModal.value = false;
    receiptToDelete.value = null;
    setTimeout(() => {
      deletingId.value = null;
    }, 1500);
  }

  function isPdf(receipt: Receipt): boolean {
    return receipt.contentType === 'application/pdf';
  }

  function formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString(getLocaleString(), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat(getLocaleString(), {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' ' + t('common.units.bytes');
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' ' + t('common.units.kb');
    return (bytes / (1024 * 1024)).toFixed(1) + ' ' + t('common.units.mb');
  }
</script>
