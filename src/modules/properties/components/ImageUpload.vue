<template>
  <div class="space-y-4">
    <div
      class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
      :class="[
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />
      <IconLucideImage class="w-12 h-12 mx-auto text-gray-400 mb-3" />
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('imageUpload.dragDrop') }}
      </p>
      <p class="text-xs text-gray-400 mt-1">{{ t('imageUpload.formats') }}</p>
    </div>

    <div v-if="uploadingImages.size > 0 || uploadedImages.length > 0" class="space-y-3">
      <div class="flex justify-between items-center">
        <h4 class="font-bold text-gray-900 dark:text-white">
          {{ t('imageUpload.images', { n: uploadedImages.length }) }}
        </h4>
        <button
          v-if="uploadedImages.length > 1"
          @click="toggleReorderMode"
          class="text-xs font-semibold text-blue-600 hover:underline"
        >
          {{ reorderMode ? t('imageUpload.cancelReorder') : t('imageUpload.reorder') }}
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div
          v-for="[file, progress] in uploadingImages"
          :key="file.name"
          class="aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700"
        >
          <div
            class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="text-[10px] mt-2 font-black text-blue-600">
            {{ t('common.progress', { n: progress }) }}
          </p>
        </div>

        <div
          v-for="(img, idx) in reorderMode ? reorderImages : uploadedImages"
          :key="img.id"
          class="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
          :class="{ 'cursor-move ring-2 ring-blue-500': reorderMode }"
          :draggable="reorderMode"
          @dragstart="dragStartIndex = idx"
          @dragover.prevent
          @drop="handleDropReorder(idx)"
        >
          <img
            :src="img.temporaryDownloadUrl || img.publicUrl"
            class="w-full h-full object-cover transition-transform group-hover:scale-110"
          />
          <div
            v-if="reorderMode"
            class="absolute inset-0 bg-blue-600/20 flex items-center justify-center pointer-events-none"
          >
            <IconLucideGripVertical class="text-white w-6 h-6 drop-shadow-lg" />
          </div>
          <button
            v-else
            @click="confirmDelete(img)"
            class="absolute top-1.5 right-1.5 bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <IconLucideX class="w-3 h-3" />
          </button>
          <div
            v-if="img.isPrimary && !reorderMode"
            class="absolute bottom-1.5 left-1.5 bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-lg"
          >
            {{ t('imageUpload.primary') }}
          </div>
        </div>
      </div>

      <div
        v-if="reorderMode"
        class="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700"
      >
        <fwb-button size="sm" color="alternative" @click="reorderMode = false">
          {{ t('imageUpload.cancel') }}
        </fwb-button>
        <fwb-button size="sm" gradient="blue" @click="saveOrderAction">
          {{ t('imageUpload.saveOrder') }}
        </fwb-button>
      </div>
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      :title="t('imageUpload.confirmDelete')"
      :message="t('imageUpload.confirmDelete')"
      confirm-color="red"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton } from 'flowbite-vue';
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideX from '~icons/lucide/x';
  import IconLucideGripVertical from '~icons/lucide/grip-vertical';

  import { useImageUpload } from '../composables/useImageUpload';
  import { type ImageResponse } from '../services/imageService';
  import { useToast } from '@/shared/composables/useToast';
  import ConfirmModal from '@/shared/components/ui/ConfirmModal.vue';

  const { t } = useI18n();
  const toast = useToast();
  const props = defineProps<{ propertyId: string }>();
  const emit = defineEmits(['images-updated']);

  const {
    uploadedImages,
    uploadingImages,
    reorderMode,
    reorderImages,
    load,
    uploadFiles,
    remove,
    saveOrder,
  } = useImageUpload(props.propertyId);

  const fileInput = ref<HTMLInputElement>();
  const isDragging = ref(false);
  const showDeleteModal = ref(false);
  const imageToDelete = ref<ImageResponse | null>(null);
  const dragStartIndex = ref(-1);

  watch(uploadedImages, (imgs) =>
    emit(
      'images-updated',
      imgs.map((i) => i.temporaryDownloadUrl || i.publicUrl)
    )
  );

  const triggerFileInput = () => fileInput.value?.click();
  const handleFileSelect = (e: Event) => {
    uploadFiles(Array.from((e.target as HTMLInputElement).files || []));
    if (fileInput.value) fileInput.value.value = '';
  };
  const handleDrop = (e: DragEvent) => {
    isDragging.value = false;
    uploadFiles(Array.from(e.dataTransfer?.files || []));
  };

  const toggleReorderMode = () => {
    if (!reorderMode.value) reorderImages.value = [...uploadedImages.value];
    reorderMode.value = !reorderMode.value;
  };
  const handleDropReorder = (idx: number) => {
    if (dragStartIndex.value === -1) return;
    const item = reorderImages.value.splice(dragStartIndex.value, 1)[0];
    reorderImages.value.splice(idx, 0, item);
    dragStartIndex.value = -1;
  };

  async function saveOrderAction() {
    try {
      await saveOrder(reorderImages.value.map((i) => i.id));
      toast.success(t('imageUpload.saveOrderSuccess'));
    } catch {
      toast.error(t('imageUpload.saveOrderError'));
    }
  }

  const confirmDelete = (img: ImageResponse) => {
    imageToDelete.value = img;
    showDeleteModal.value = true;
  };
  async function doDelete() {
    try {
      if (imageToDelete.value) {
        await remove(imageToDelete.value.id);
        toast.success(t('imageUpload.deleteSuccess'));
        showDeleteModal.value = false;
      }
    } catch {
      toast.error(t('imageUpload.deleteError'));
    }
  }

  onMounted(load);
</script>
