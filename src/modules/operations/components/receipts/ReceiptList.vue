<template>
  <div>
    <DataTable :columns="columns" :items="receipts" :loading="loading" has-actions>
      <template #col-file="{ item }">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm"
            :class="isPdf(item) ? 'bg-red-500' : 'bg-emerald-500'"
          >
            <IconLucideFileText v-if="isPdf(item)" class="w-4 h-4" />
            <IconLucideImage v-else class="w-4 h-4" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold truncate max-w-[150px]" :title="item.originalFileName">
              {{ item.originalFileName }}
            </span>
            <span class="text-[10px] text-gray-400">{{ formatSize(item.fileSizeBytes) }}</span>
          </div>
        </div>
      </template>
      <template #col-concept="{ value }">
        <span class="text-xs text-gray-600 dark:text-gray-400">{{ value }}</span>
      </template>
      <template #col-paymentDate="{ value }">
        <span class="text-xs">{{ formatDate(value) }}</span>
      </template>
      <template #col-amount="{ item }">
        <span class="font-black text-blue-600">{{ formatAmount(item.amount, item.currency) }}</span>
      </template>
      <template #actions="{ item }">
        <div class="flex justify-end gap-1">
          <fwb-button
            v-if="item.downloadUrl"
            :href="item.downloadUrl"
            target="_blank"
            color="alternative"
            size="xs"
            class="text-blue-600"
          >
            <IconLucideDownload class="w-4 h-4" />
          </fwb-button>
          <button
            @click="confirmDelete(item)"
            class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <IconLucideTrash class="w-4 h-4" />
          </button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal
      v-model="showDeleteModal"
      :title="t('receipts.deleteTitle')"
      :message="t('receipts.deleteConfirm', { name: receiptToDelete?.originalFileName })"
      confirm-color="red"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton } from 'flowbite-vue';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideDownload from '~icons/lucide/download';
  import IconLucideTrash from '~icons/lucide/trash';

  import DataTable, { type TableColumn } from '@/shared/components/ui/DataTable.vue';
  import ConfirmModal from '@/shared/components/ui/ConfirmModal.vue';
  import { getLocaleString } from '@/core/locales/i18n';
  import type { Receipt } from '../../types/receipt';

  const { t } = useI18n();
  defineProps<{ receipts: Receipt[]; loading: boolean }>();
  const emit = defineEmits(['delete']);

  const columns: TableColumn[] = [
    { key: 'file', label: t('receipts.file') },
    { key: 'concept', label: t('receipts.concept') },
    { key: 'paymentDate', label: t('receipts.paymentDate') },
    { key: 'amount', label: t('receipts.amount') },
  ];

  const showDeleteModal = ref(false);
  const receiptToDelete = ref<Receipt | null>(null);

  const confirmDelete = (r: Receipt) => {
    receiptToDelete.value = r;
    showDeleteModal.value = true;
  };
  const doDelete = () => {
    if (receiptToDelete.value) {
      emit('delete', receiptToDelete.value.id);
      showDeleteModal.value = false;
    }
  };

  const isPdf = (r: Receipt) => r.contentType === 'application/pdf';
  const formatDate = (iso: string) =>
    !iso
      ? ''
      : new Date(iso).toLocaleDateString(getLocaleString(), {
          day: '2-digit',
          month: 'short',
        });
  const formatAmount = (a: number, c: string) =>
    new Intl.NumberFormat(getLocaleString(), {
      style: 'currency',
      currency: c,
    }).format(a);
  const formatSize = (b: number) =>
    b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
</script>
