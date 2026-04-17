<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
        {{ t('documentUpload.title') }}
      </h4>
      <fwb-button
        v-if="canUpload"
        size="xs"
        gradient="blue"
        @click="triggerFileInput"
        :disabled="uploading"
      >
        <div class="flex items-center gap-1">
          <IconLucidePlus v-if="!uploading" class="w-4 h-4" />
          <div
            v-else
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></div>
          {{ uploading ? t('documentUpload.uploading') : t('documentUpload.uploadContract') }}
        </div>
      </fwb-button>
    </div>

    <div v-if="documents.length > 0" class="space-y-2">
      <DocumentItem
        v-for="doc in documents"
        :key="doc.id"
        :doc="doc"
        :is-admin="isAdmin"
        :is-downloaded="isDocumentDownloaded(doc.id)"
        :time-remaining="getDownloadTimeRemaining(doc.id)"
        @download="download"
        @delete="confirmDelete"
        @permissions="selectedDoc = $event"
      />
    </div>

    <div
      v-else
      class="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed"
    >
      <p class="text-sm text-gray-500">{{ t('documentUpload.noDocuments') }}</p>
      <p v-if="canUpload" class="text-xs text-gray-400 mt-1">
        {{ t('documentUpload.emptyText') }}
      </p>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".pdf,.doc,.docx"
      class="hidden"
      @change="handleFileSelect"
    />

    <DocumentPermissionsModal
      v-if="selectedDoc"
      :doc="selectedDoc"
      @close="selectedDoc = null"
      @updated="load"
    />
    <ConfirmModal
      v-model="showDeleteModal"
      :title="t('documentUpload.confirmDelete')"
      :message="t('documentUpload.confirmDelete')"
      confirm-color="red"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton } from 'flowbite-vue';
  import IconLucidePlus from '~icons/lucide/plus';

  import { useDocuments } from '../composables/useDocuments';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { useToast } from '@/shared/composables/useToast';
  import type { DocumentResponse } from '../services/documentService';

  import DocumentItem from './DocumentItem.vue';
  import DocumentPermissionsModal from './DocumentPermissionsModal.vue';
  import ConfirmModal from '@/shared/components/ui/ConfirmModal.vue';

  const { t } = useI18n();
  const toast = useToast();
  const authStore = useAuthStore();
  const props = defineProps<{ propertyId: string; agentId?: string }>();

  const {
    documents,
    uploading,
    isAdmin,
    load,
    upload,
    remove,
    download,
    isDocumentDownloaded,
    getDownloadTimeRemaining,
  } = useDocuments(props.propertyId);

  const fileInput = ref<HTMLInputElement>();
  const selectedDoc = ref<DocumentResponse | null>(null);
  const showDeleteModal = ref(false);
  const docToDelete = ref<DocumentResponse | null>(null);

  const canUpload = computed(
    () => isAdmin.value || props.agentId === (authStore.user as UserClaims | null)?.sub
  );

  const triggerFileInput = () => fileInput.value?.click();

  const handleFileSelect = async (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files?.length) return;
    try {
      await upload(files[0]);
      toast.success(t('documentUpload.uploadSuccessMessage'));
    } catch (err: unknown) {
      const errorDetail = (err as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail;
      toast.error(errorDetail || t('documentUpload.uploadError'));
    } finally {
      if (fileInput.value) fileInput.value.value = '';
    }
  };

  const confirmDelete = (doc: DocumentResponse) => {
    docToDelete.value = doc;
    showDeleteModal.value = true;
  };
  const doDelete = async () => {
    try {
      if (docToDelete.value) {
        await remove(docToDelete.value.id);
        toast.success(t('documentUpload.deleteSuccess'));
        showDeleteModal.value = false;
      }
    } catch {
      toast.error(t('documentUpload.deleteError'));
    }
  };
  onMounted(load);
</script>
