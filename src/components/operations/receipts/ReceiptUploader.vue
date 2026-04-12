<template>
  <FwbCard class="space-y-5">
    <template #header>
      <h3 class="text-base font-semibold flex items-center gap-2">
        <IconLucideUpload class="w-5 h-5 text-blue-500" />
        {{ t('receiptUploader.title') }}
      </h3>
    </template>

    <div
      class="relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer"
      :class="[
        isDragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50',
        selectedFile ? 'py-4 px-5' : 'py-10 px-5',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="triggerFilePicker"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        class="sr-only"
        @change="onFileChange"
      />

      <div
        v-if="!selectedFile"
        class="flex flex-col items-center gap-3 text-center pointer-events-none"
      >
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <IconLucideUploadCloud class="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-700">
            {{ t('receiptUploader.dragDrop') }}
            <span class="text-blue-600 underline">{{ t('receiptUploader.browse') }}</span>
          </p>
          <p class="text-xs text-gray-400 mt-1">{{ t('receiptUploader.formats') }}</p>
        </div>
      </div>

      <div v-else class="flex items-center gap-4 pointer-events-none">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          :class="isPdf ? 'bg-red-100' : 'bg-green-100'"
        >
          <IconLucideFileText v-if="isPdf" class="w-5 h-5 text-red-500" />
          <IconLucideImage v-else class="w-5 h-5 text-green-500" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">
            {{ selectedFile.name }}
          </p>
          <p class="text-xs text-gray-400">
            {{ formatSize(selectedFile.size) }} · {{ selectedFile.type }}
          </p>
        </div>
        <FwbButton
          @click.stop="clearFile"
          size="xs"
          color="red"
          class="pointer-events-auto"
          :title="t('receiptUploader.removeFile')"
        >
          <IconLucideX class="w-4 h-4" />
        </FwbButton>
      </div>
    </div>

    <FwbAlert v-if="fileError" type="danger">
      {{ fileError }}
    </FwbAlert>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <FwbInput
          v-model="form.amount"
          :label="t('receiptUploader.amount')"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          :error="formErrors.amount"
          required
        />
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          {{ t('receiptUploader.currency') }}
          <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.currency"
          class="w-full rounded-xl border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          :class="formErrors.currency ? 'border-red-400' : 'border-gray-300'"
        >
          <option value="" disabled>{{ t('receiptUploader.selectCurrency') }}</option>
          <option value="BOB">{{ t('receiptUploader.currencyBOB') }}</option>
          <option value="USD">{{ t('receiptUploader.currencyUSD') }}</option>
          <option value="EUR">{{ t('receiptUploader.currencyEUR') }}</option>
        </select>
        <p v-if="formErrors.currency" class="text-red-500 text-xs mt-1">
          {{ formErrors.currency }}
        </p>
      </div>

      <div>
        <FwbInput
          v-model="form.paymentDate"
          :label="t('receiptUploader.paymentDate')"
          type="datetime-local"
          :error="formErrors.paymentDate"
          required
        />
      </div>

      <div>
        <FwbInput
          v-model="form.concept"
          :label="t('receiptUploader.concept')"
          type="text"
          maxlength="255"
          :placeholder="t('receiptUploader.conceptPlaceholder')"
          :error="formErrors.concept"
          required
        />
      </div>
    </div>

    <FwbAlert v-if="uploadError" type="danger">
      {{ uploadError }}
    </FwbAlert>

    <div v-if="uploading" class="space-y-1">
      <div class="flex justify-between text-xs text-gray-500">
        <span>{{ t('receiptUploader.uploading') }}</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end w-full">
        <FwbButton @click="handleSubmit" :disabled="uploading" gradient="blue">
          <IconLucideLoader v-if="uploading" class="animate-spin w-4 h-4" />
          <IconLucideUpload v-else class="w-4 h-4" />
          {{ uploading ? t('receiptUploader.uploading') : t('receiptUploader.attachReceipt') }}
        </FwbButton>
      </div>
    </template>
  </FwbCard>
</template>

<script setup lang="ts">
  import IconLucideUpload from '~icons/lucide/upload';
  import IconLucideUploadCloud from '~icons/lucide/upload-cloud';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideX from '~icons/lucide/x';
  import IconLucideLoader from '~icons/lucide/loader';
  import { ref, reactive, computed } from 'vue';
  import { FwbCard, FwbInput, FwbButton, FwbAlert } from 'flowbite-vue';
  import { useReceipts } from '@/composables/useReceipts';
  import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, ALLOWED_TYPE_LABELS } from '@/types/receipt';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps<{ operationId: string }>();

  const emit = defineEmits<{
    (e: 'uploaded'): void;
  }>();

  const { attachReceipt, uploading, uploadProgress, uploadError } = useReceipts(props.operationId);

  const fileInputRef = ref<HTMLInputElement | null>(null);
  const selectedFile = ref<File | null>(null);
  const isDragging = ref(false);
  const fileError = ref<string | null>(null);

  const form = reactive({
    amount: '',
    currency: 'BOB',
    paymentDate: '',
    concept: '',
  });

  const formErrors = reactive({
    amount: '',
    currency: '',
    paymentDate: '',
    concept: '',
  });

  const isPdf = computed(() => selectedFile.value?.type === 'application/pdf');

  function triggerFilePicker() {
    fileInputRef.value?.click();
  }

  function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) applyFile(input.files[0]);
  }

  function onDrop(event: DragEvent) {
    isDragging.value = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) applyFile(file);
  }

  function applyFile(file: File) {
    fileError.value = null;
    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      fileError.value = t('receiptUploader.invalidFileFormat', { formats: ALLOWED_TYPE_LABELS });
      selectedFile.value = null;
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      fileError.value = t('receiptUploader.fileTooLarge', { size: mb });
      selectedFile.value = null;
      return;
    }
    selectedFile.value = file;
  }

  function clearFile() {
    selectedFile.value = null;
    fileError.value = null;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }

  function validateForm(): boolean {
    formErrors.amount = '';
    formErrors.currency = '';
    formErrors.paymentDate = '';
    formErrors.concept = '';
    let valid = true;

    if (!form.amount || Number(form.amount) <= 0) {
      formErrors.amount = t('receiptUploader.validationAmount');
      valid = false;
    }
    if (!form.currency) {
      formErrors.currency = t('receiptUploader.validationCurrency');
      valid = false;
    }
    if (!form.paymentDate) {
      formErrors.paymentDate = t('receiptUploader.validationDate');
      valid = false;
    }
    if (!form.concept.trim()) {
      formErrors.concept = t('receiptUploader.validationConcept');
      valid = false;
    }
    return valid;
  }

  async function handleSubmit() {
    if (!selectedFile.value) {
      fileError.value = t('receiptUploader.selectFile');
      return;
    }
    if (!validateForm()) return;

    const success = await attachReceipt(selectedFile.value, {
      amount: Number(form.amount),
      currency: form.currency,
      paymentDate: new Date(form.paymentDate).toISOString(),
      concept: form.concept.trim(),
    });

    if (success) {
      clearFile();
      form.amount = '';
      form.currency = 'BOB';
      form.paymentDate = '';
      form.concept = '';
      emit('uploaded');
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
</script>
