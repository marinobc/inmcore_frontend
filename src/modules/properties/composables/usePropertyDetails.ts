import { ref, watch, computed } from 'vue';
import { propertyService } from '../services/propertyService';
import { personService } from '@/modules/users/services/personService';
import { useAuthStore } from '@/modules/auth';
import { useToast } from '@/shared/composables/useToast';
import { useI18n } from 'vue-i18n';
import type { Property } from '../types/property';
import type { User } from '@/modules/users/types/user';

export function usePropertyDetails(property: Property | null) {
  const { t } = useI18n();
  const toast = useToast();
  const authStore = useAuthStore();

  const localStatus = ref(property?.status || '');
  const updatingStatus = ref(false);
  const owner = ref<User | null>(null);
  const loadingOwner = ref(false);

  const isAdmin = computed(
    () => authStore.user?.roles?.includes('ADMIN') || authStore.user?.userType === 'ADMIN'
  );

  async function loadOwnerInfo() {
    if (!property?.ownerId) {
      owner.value = null;
      return;
    }
    loadingOwner.value = true;
    try {
      owner.value = (await personService.getPersonByAuthUserId(
        property.ownerId
      )) as unknown as User;
    } catch (e) {
      console.error(e);
      owner.value = null;
    } finally {
      loadingOwner.value = false;
    }
  }

  async function updateStatus(newStatus: string) {
    if (!property || newStatus === property.status) return;
    updatingStatus.value = true;
    try {
      await propertyService.updateStatus(property.id, newStatus);
      toast.success(t('propertyDetails.statusUpdated'));
      return true;
    } catch (e) {
      localStatus.value = property.status;
      const errorDetail = (e as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail;
      toast.error(errorDetail || t('propertyDetails.statusUpdateError'));
      return false;
    } finally {
      updatingStatus.value = false;
    }
  }

  function contactWhatsApp() {
    if (!owner.value?.phone || !property) return;
    const msg = encodeURIComponent(
      t('propertyDetails.whatsappMessage', {
        name: owner.value.firstName || '',
        title: property.title || '',
        address: property.address || '',
      })
    );
    window.open(`https://wa.me/${owner.value.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  }

  watch(
    () => property,
    (newP) => {
      if (newP) {
        localStatus.value = newP.status;
        loadOwnerInfo();
      }
    },
    { immediate: true }
  );

  return {
    localStatus,
    updatingStatus,
    owner,
    loadingOwner,
    isAdmin,
    updateStatus,
    contactWhatsApp,
  };
}
