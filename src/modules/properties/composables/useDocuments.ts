import { ref, computed } from 'vue';
import { documentService, type DocumentResponse } from '../services/documentService';
import { useAuthStore, type UserClaims } from '@/modules/auth';

export function useDocuments(propertyId: string) {
  const authStore = useAuthStore();
  const documents = ref<DocumentResponse[]>([]);
  const loading = ref(false);
  const uploading = ref(false);
  const downloadTimers = ref<Record<string, { expiresAt: number; timerId: number | null }>>({});

  const isAdmin = computed(() => {
    const u = authStore.user as UserClaims | null;
    return u?.roles?.includes('ADMIN') || u?.userType === 'ADMIN';
  });

  async function load() {
    loading.value = true;
    try {
      documents.value = await documentService.getPropertyDocuments(propertyId);
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function upload(file: File) {
    uploading.value = true;
    try {
      await documentService.uploadExclusivityContract(propertyId, file);
      await load();
      return true;
    } catch (e) {
      throw e;
    } finally {
      uploading.value = false;
    }
  }

  async function remove(docId: string) {
    try {
      await documentService.deleteDocument(docId);
      await load();
      return true;
    } catch (e) {
      throw e;
    }
  }

  const isDocumentDownloaded = (docId: string): boolean => {
    if (isAdmin.value) return false;
    const u = authStore.user as UserClaims | null;
    return !!u?.sub && localStorage.getItem(`downloaded_${u.sub}_${docId}`) === 'true';
  };

  const getDownloadTimeRemaining = (docId: string): number | null => {
    if (isAdmin.value) return null;
    const timer = downloadTimers.value[docId];
    if (!timer) return null;
    const remaining = Math.ceil((timer.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : null;
  };

  async function download(doc: DocumentResponse) {
    let url = doc.temporaryDownloadUrl;
    if (!url || doc.expiresInSeconds === 0) {
      const res = await documentService.refreshDownloadUrl(doc.id);
      url = res.temporaryDownloadUrl;
    }
    if (!isAdmin.value) startTimer(doc.id);
    window.open(url, '_blank');
  }

  function startTimer(docId: string) {
    const expiresAt = Date.now() + 10000;
    const timerId = window.setInterval(() => {
      if (downloadTimers.value[docId]) downloadTimers.value[docId].expiresAt = expiresAt;
    }, 100);
    downloadTimers.value[docId] = { expiresAt, timerId };
    setTimeout(() => {
      const u = authStore.user as UserClaims | null;
      if (u?.sub) localStorage.setItem(`downloaded_${u.sub}_${docId}`, 'true');
      clearInterval(timerId);
    }, 10000);
  }

  return {
    documents,
    loading,
    uploading,
    isAdmin,
    load,
    upload,
    remove,
    download,
    isDocumentDownloaded,
    getDownloadTimeRemaining,
  };
}
