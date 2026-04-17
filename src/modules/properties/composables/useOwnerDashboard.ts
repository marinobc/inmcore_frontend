import { ref } from 'vue';
import { useAuthStore, type UserClaims } from '@/modules/auth';
import { propertyService } from '@/modules/properties';
import type { Property } from '@/modules/properties/types/property';
import { getVisitCountForProperty } from '@/modules/visits/services/visitRequestService';
import i18n from '@/core/locales/i18n';

export function useOwnerDashboard() {
  const { t } = i18n.global;
  const authStore = useAuthStore();
  const properties = ref<Property[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const u = authStore.user as UserClaims | null;
      const ownerId = u?.sub || u?.userId || u?.id || '';
      if (!ownerId) throw new Error(t('ownerDashboard.loadError'));

      const props = await propertyService.getPropertiesByOwner(ownerId);
      properties.value = await Promise.all(
        props.map(async (p: Property) => ({
          ...p,
          visitCount: await getVisitCountForProperty(p.id).catch(() => 0),
        }))
      );
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  return { properties, loading, error, load };
}
