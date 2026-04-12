<template>
  <!--
    OperationReceiptsSection.vue
    Main "Reservation Receipts" section that lives inside the operation
    detail view. Composes ReceiptUploader + ReceiptList into a single
    self-contained block that an agent can drop into any existing detail page.

    USAGE in OperationDetailView.vue (or similar):
      <OperationReceiptsSection :operation-id="operation.id" />
  -->
  <section class="space-y-6">
    <!-- Section header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center"
        >
          <IconLucideClipboardList class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">Reservation Receipts</h2>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ receipts.length }} receipt{{ receipts.length !== 1 ? 's' : '' }}
            attached
          </p>
        </div>
      </div>

      <!-- Toggle uploader button -->
      <button
        @click="showUploader = !showUploader"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
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
        {{ showUploader ? 'Cancel' : 'Add Receipt' }}
      </button>
    </div>

    <!-- Error banner (list load error) -->
    <div
      v-if="error"
      class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700"
    >
      <IconLucideAlertCircle class="w-4 h-4 shrink-0" />
      {{ error }}
    </div>

    <!-- Uploader (collapsible) -->
    <Transition name="slide-down">
      <ReceiptUploader
        v-if="showUploader"
        :operation-id="operationId"
        @uploaded="onUploaded"
      />
    </Transition>

    <!-- Success toast after upload -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toastVisible"
          class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium"
        >
          <IconLucideCircleCheck class="w-5 h-5 text-green-400" />
          Receipt attached successfully!
        </div>
      </Transition>
    </Teleport>

    <!-- Receipt list -->
    <ReceiptList
      :receipts="receipts"
      :loading="loading"
      @delete="handleDelete"
    />

    <!-- Summary footer — shown only when there are receipts -->
    <div
      v-if="receipts.length > 0"
      class="bg-gray-50 rounded-2xl border border-gray-200 px-5 py-4"
    >
      <div class="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Total Attached
          </p>
          <p class="text-lg font-bold text-gray-800 mt-0.5">
            {{ receipts.length }} receipt{{ receipts.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Group totals by currency -->
        <div class="flex flex-wrap gap-4">
          <div
            v-for="(total, currency) in totalsByCurrency"
            :key="currency"
            class="text-right"
          >
            <p
              class="text-xs text-gray-500 uppercase tracking-wide font-medium"
            >
              {{ currency }}
            </p>
            <p class="text-lg font-bold text-blue-700 mt-0.5">
              {{ formatAmount(total, currency) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useReceipts } from '@/composables/useReceipts';
import ReceiptUploader from './ReceiptUploader.vue';
import ReceiptList from './ReceiptList.vue';
import IconLucideClipboardList from '~icons/lucide/clipboard-list';
import IconLucidePlus from '~icons/lucide/plus';
import IconLucideAlertCircle from '~icons/lucide/alert-circle';
import IconLucideCircleCheck from '~icons/lucide/circle-check';

// ── Props ─────────────────────────────────────────────────────────────────
const props = defineProps<{ operationId: string }>();

// ── Composable ────────────────────────────────────────────────────────────
const { receipts, loading, error, loadReceipts, deleteReceipt } = useReceipts(
  props.operationId
);

// ── Local state ───────────────────────────────────────────────────────────
const showUploader = ref(false);
const toastVisible = ref(false);

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(loadReceipts);

// ── Computed — totals grouped by currency ─────────────────────────────────
const totalsByCurrency = computed(() => {
  return receipts.value.reduce<Record<string, number>>((acc, r) => {
    acc[r.currency] = (acc[r.currency] ?? 0) + Number(r.amount);
    return acc;
  }, {});
});

// ── Methods ───────────────────────────────────────────────────────────────
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
