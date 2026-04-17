import { ref } from 'vue';
import { imageService, type ImageResponse } from '../services/imageService';

export function useImageUpload(propertyId: string) {
  const uploadedImages = ref<ImageResponse[]>([]);
  const uploadingImages = ref<Map<File, number>>(new Map());
  const loading = ref(false);
  const reorderMode = ref(false);
  const reorderImages = ref<ImageResponse[]>([]);

  async function load() {
    loading.value = true;
    try {
      uploadedImages.value = await imageService.getPropertyImages(propertyId);
    } finally {
      loading.value = false;
    }
  }

  async function uploadFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith('image/'));
    for (const file of images) {
      uploadingImages.value.set(file, 0);
      try {
        const { uploadUrl, objectKey } = await imageService.generateImageUploadUrl(
          propertyId,
          file
        );
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        await imageService.confirmImageUpload(propertyId, {
          objectKey,
          originalFileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
        await load();
      } catch (e) {
        console.error(e);
      } finally {
        uploadingImages.value.delete(file);
      }
    }
  }

  async function remove(imageId: string) {
    await imageService.deleteImage(propertyId, imageId);
    await load();
  }

  async function saveOrder(ids: string[]) {
    const updated = await imageService.reorderImages(propertyId, ids);
    uploadedImages.value = updated;
    reorderMode.value = false;
  }

  return {
    uploadedImages,
    uploadingImages,
    loading,
    reorderMode,
    reorderImages,
    load,
    uploadFiles,
    remove,
    saveOrder,
  };
}
