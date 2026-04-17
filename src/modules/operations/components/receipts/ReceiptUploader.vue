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
          <p class="text-xs text-gray-400 mt-1">
            {{ t('receiptUploader.formats') }}
          </p>
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
            {{ formatSize(selectedFile.size) }}
          </p>
        </div>
        <button
          @click.stop="clearFile"
          class="p-1 text-red-600 hover:bg-red-50 rounded pointer-events-auto"
        >
          <IconLucideX class="w-5 h-5" />
        </button>
      </div>
    </div>

    <FwbAlert v-if="fileError" type="danger">{{ fileError }}</FwbAlert>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField
        v-model.number="form.amount"
        type="number"
        :label="t('receiptUploader.amount')"
        :error="formErrors.amount"
        required
      />
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          {{ t('receiptUploader.currency') }}
          <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.currency"
          class="w-full rounded-xl border-gray-300 border px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="BOB">BOB</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      <FormField
        v-model="form.paymentDate"
        type="datetime-local"
        :label="t('receiptUploader.paymentDate')"
        :error="formErrors.paymentDate"
        required
      />
      <FormField
        v-model="form.concept"
        type="text"
        :label="t('receiptUploader.concept')"
        :error="formErrors.concept"
        required
      />
    </div>

    <FwbAlert v-if="uploadError" type="danger">{{ uploadError }}</FwbAlert>

    <div v-if="uploading" class="space-y-1">
      <div class="flex justify-between text-xs text-gray-500">
        <span>{{ t('receiptUploader.uploading') }}</span>
        <span>{{ t('receiptUploader.uploadProgress', { n: uploadProgress }) }}</span>
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
          <IconLucideLoader v-if="uploading" class="animate-spin w-4 h-4 mr-2" />
          <IconLucideUpload v-else class="w-4 h-4 mr-2" />
          {{ uploading ? t('receiptUploader.uploading') : t('receiptUploader.attachReceipt') }}
        </FwbButton>
      </div>
    </template>
  </FwbCard>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbCard, FwbButton, FwbAlert } from 'flowbite-vue';
  import IconLucideUpload from '~icons/lucide/upload';
  import IconLucideUploadCloud from '~icons/lucide/upload-cloud';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideX from '~icons/lucide/x';
  import IconLucideLoader from '~icons/lucide/loader';

  import { useReceipts } from '../../composables/useReceipts';
  import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../../types/receipt';
  import FormField from '@/shared/components/common/FormField.vue';

  const { t } = useI18n();
  const props = defineProps<{ operationId: string }>();
  const emit = defineEmits(['uploaded']);
  const { attachReceipt, uploading, uploadProgress, uploadError } = useReceipts(props.operationId);

  const fileInputRef = ref<HTMLInputElement>();
  const selectedFile = ref<File | null>(null);
  const isDragging = ref(false);
  const fileError = ref<string | null>(null);
  const form = reactive({
    amount: '',
    currency: 'BOB',
    paymentDate: '',
    concept: '',
  });
  const formErrors = reactive({ amount: '', paymentDate: '', concept: '' });

  const isPdf = computed(() => selectedFile.value?.type === 'application/pdf');
  const triggerFilePicker = () => fileInputRef.value?.click();
  const onFileChange = (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) applyFile(f);
  };
  const onDrop = (e: DragEvent) => {
    isDragging.value = false;
    const f = e.dataTransfer?.files?.[0];
    if (f) applyFile(f);
  };

  function applyFile(f: File) {
    fileError.value = null;
    if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(f.type)) {
      fileError.value = t('receiptUploader.invalidFileFormat');
      return;
    }
    if (f.size > MAX_FILE_SIZE_BYTES) {
      fileError.value = t('receiptUploader.fileTooLarge');
      return;
    }
    selectedFile.value = f;
  }
  const clearFile = () => {
    selectedFile.value = null;
    if (fileInputRef.value) fileInputRef.value.value = '';
  };

  async function handleSubmit() {
    if (!selectedFile.value) {
      fileError.value = t('receiptUploader.selectFile');
      return;
    }
    formErrors.amount = !form.amount ? t('receiptUploader.validationAmount') : '';
    formErrors.paymentDate = !form.paymentDate ? t('receiptUploader.validationDate') : '';
    formErrors.concept = !form.concept.trim() ? t('receiptUploader.validationConcept') : '';
    if (Object.values(formErrors).some((v) => v)) return;

    const success = await attachReceipt(selectedFile.value, {
      amount: Number(form.amount),
      currency: form.currency,
      paymentDate: new Date(form.paymentDate).toISOString(),
      concept: form.concept.trim(),
    });
    if (success) {
      clearFile();
      Object.assign(form, {
        amount: '',
        currency: 'BOB',
        paymentDate: '',
        concept: '',
      });
      emit('uploaded');
    }
  }
  const formatSize = (b: number) =>
    b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
</script>
