<template>
  <section class="space-y-6">
    <FwbCard>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
            <IconLucideClipboardList class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">{{ t('receiptsSection.title') }}</h2>
            <p class="text-xs text-gray-500 mt-0.5">
              <FwbBadge>
                {{ t('receiptsSection.badge', { n: receipts.length }) }}
              </FwbBadge>
            </p>
          </div>
        </div>

        <FwbButton
          @click="showUploader = !showUploader"
          :class="
            showUploader
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          "
        >
          <IconLucidePlus
            class="w-4 h-4 transition-transform duration-200"
            :class="showUploader ? 'rotate-45' : ''"
          />
          {{ showUploader ? t('receiptsSection.cancelButton') : t('receiptsSection.addButton') }}
        </FwbButton>
      </div>
    </FwbCard>

    <FwbAlert v-if="error" type="danger" class="flex items-center gap-3">
      <IconLucideAlertCircle class="w-4 h-4 shrink-0" />
      {{ error }}
    </FwbAlert>

    <Transition name="slide-down">
      <ReceiptUploader v-if="showUploader" :operation-id="operationId" @uploaded="onUploaded" />
    </Transition>

    <FwbAlert v-if="toastVisible" type="success" class="fixed bottom-6 right-6 z-50 max-w-sm">
      <IconLucideCircleCheck class="w-5 h-5 text-green-400" />
      {{ t('receiptsSection.toastSuccess') }}
    </FwbAlert>

    <FwbCard>
      <ReceiptList :receipts="receipts" :loading="loading" @delete="handleDelete" />
    </FwbCard>

    <FwbCard v-if="receipts.length > 0">
      <div class="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {{ t('receiptsSection.totalLabel') }}
          </p>
          <p class="text-lg font-bold text-gray-800 mt-0.5">
            <FwbBadge>{{ t('receiptsSection.badge', { n: receipts.length }) }}</FwbBadge>
          </p>
        </div>

        <div class="flex flex-wrap gap-4">
          <div v-for="(total, currency) in totalsByCurrency" :key="currency" class="text-right">
            <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
              {{ currency }}
            </p>
            <p class="text-lg font-bold text-blue-700 mt-0.5">
              {{ formatAmount(total, currency) }}
            </p>
          </div>
        </div>
      </div>
    </FwbCard>
  </section>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { FwbCard, FwbButton, FwbAlert, FwbBadge } from 'flowbite-vue';
  import { useReceipts } from '@/composables/useReceipts';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';

  import ReceiptUploader from './ReceiptUploader.vue';
  import ReceiptList from './ReceiptList.vue';
  import IconLucideClipboardList from '~icons/lucide/clipboard-list';
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucideAlertCircle from '~icons/lucide/alert-circle';
  import IconLucideCircleCheck from '~icons/lucide/circle-check';

  const { t } = useI18n();

  const props = defineProps<{ operationId: string }>();

  const { receipts, loading, error, loadReceipts, deleteReceipt } = useReceipts(props.operationId);

  const showUploader = ref(false);
  const toastVisible = ref(false);

  onMounted(loadReceipts);

  const totalsByCurrency = computed(() => {
    return receipts.value.reduce<Record<string, number>>((acc, r) => {
      acc[r.currency] = (acc[r.currency] ?? 0) + Number(r.amount);
      return acc;
    }, {});
  });

  function onUploaded() {
    showUploader.value = false;
    showToast();
  }

  async function handleDelete(receiptId: string) {
    await deleteReceipt(receiptId);
  }

  function showToast() {
    toastVisible.value = true;
    setTimeout(() => (toastVisible.value = false), 4000);
  }

  function formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat(getLocaleString(), {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }
</script>
