<template>
  <div>
    <PageHeader :title="t('favorites.title')" :subtitle="t('favorites.subtitle')">
      <template #actions>
        <fwb-badge type="indigo" class="px-3 py-1">
          {{ t('favorites.badge', favoriteProperties.length) }}
        </fwb-badge>
      </template>
    </PageHeader>

    <PageContainer class="space-y-6">
      <div v-if="loading" class="flex justify-center py-20">
        <IconLucideLoader class="animate-spin h-10 w-10 text-blue-600" />
      </div>

      <div
        v-else-if="favoriteProperties.length === 0"
        class="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
      >
        <IconLucideHeart class="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p class="text-gray-500 dark:text-gray-400 text-lg font-medium mb-4">
          {{ t('favorites.emptyTitle') }}
        </p>
        <router-link to="/properties">
          <fwb-button color="blue">{{ t('favorites.explore') }}</fwb-button>
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PropertyCard
          v-for="prop in favoriteProperties"
          :key="prop.id"
          :property="prop"
          :is-favorite="true"
          show-favorite
          @toggle-favorite="confirmRemove(prop)"
          @click="viewDetails"
        >
          <template #footer-extra>
            <div
              class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
            >
              <fwb-button
                size="sm"
                color="blue"
                @click.stop="requestVisit(prop)"
                class="inline-flex items-center justify-center"
              >
                {{ t('favorites.scheduleVisit') }}
              </fwb-button>
              <fwb-button
                size="sm"
                color="alternative"
                @click.stop="viewDetails(prop)"
                class="inline-flex items-center justify-center"
              >
                {{ t('favorites.viewDetails') }}
              </fwb-button>
            </div>
          </template>
        </PropertyCard>
      </div>
    </PageContainer>

    <PropertyDetailsModal
      v-if="showDetailsModal"
      :show="showDetailsModal"
      :property="selectedProperty"
      is-client-view
      @close="showDetailsModal = false"
      @schedule-visit="if (selectedProperty) requestVisit(selectedProperty);"
    />
    <ConfirmModal
      v-model="showRemoveModal"
      :title="t('favorites.removeConfirmTitle')"
      :message="t('favorites.removeConfirmText', { name: propertyToRemove?.title })"
      confirm-color="red"
      @confirm="doRemove"
    />

    <!-- Visit Request Modal -->
    <fwb-modal v-if="showRequestModal" @close="showRequestModal = false" size="xl">
      <template #header>
        <div class="flex items-center gap-3">
          <IconLucideCalendar class="w-5 h-5 text-blue-600" />
          <div>
            <h3 class="text-lg font-bold">
              {{ t('clientProperties.visitRequestTitle') }}
            </h3>
            <p class="text-xs text-gray-500">
              {{ requestTarget?.name }} · {{ requestTarget?.agentName }}
            </p>
          </div>
        </div>
      </template>
      <template #body>
        <VisitRequestForm
          ref="requestFormRef"
          :initial-values="initialRequestValues"
          :agent-name="requestTarget?.agentName || ''"
        />
      </template>
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <fwb-button color="alternative" @click="showRequestModal = false">
            {{ t('common.cancel') }}
          </fwb-button>
          <fwb-button color="blue" @click="submitVisitRequest" :disabled="submittingRequest">
            {{
              submittingRequest
                ? t('clientProperties.sending')
                : t('clientProperties.submitRequest')
            }}
          </fwb-button>
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton, FwbBadge, FwbModal } from 'flowbite-vue';
  import IconLucideHeart from '~icons/lucide/heart';
  import IconLucideLoader from '~icons/lucide/loader';
  import IconLucideCalendar from '~icons/lucide/calendar';

  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';

  import { useProperties } from '../composables/useProperties';
  import { useToast } from '@/shared/composables/useToast';
  import { useAuthStore } from '@/modules/auth';
  import { createVisitRequest } from '@/modules/visits/services/visitRequestService';
  import { handleApiError } from '@/core/api/errorHandler';
  import type { Property } from '../types/property';

  import PropertyCard from '../components/PropertyCard.vue';
  import PropertyDetailsModal from '../components/PropertyDetailsModal.vue';
  import ConfirmModal from '@/shared/components/ui/ConfirmModal.vue';
  import VisitRequestForm from '../components/VisitRequestForm.vue';

  const { t } = useI18n();
  const toast = useToast();
  const authStore = useAuthStore();
  const { properties, loading, load, toggleFavorite, favorites } = useProperties();

  const showDetailsModal = ref(false);
  const selectedProperty = ref<Property | null>(null);
  const showRemoveModal = ref(false);
  const propertyToRemove = ref<Property | null>(null);

  // Visit Request States
  const showRequestModal = ref(false);
  const submittingRequest = ref(false);
  const requestFormRef = ref<InstanceType<typeof VisitRequestForm> | null>(null);
  const requestTarget = ref<{
    id: string;
    name: string;
    agentId: string | null;
    agentName: string;
  } | null>(null);

  const favoriteProperties = computed(() =>
    properties.value.filter((p) => favorites.value.has(p.id))
  );

  const initialRequestValues = computed(() => ({
    propertyId: requestTarget.value?.id || '',
    clientName: authStore.user?.fullName || authStore.user?.name || '',
    clientEmail: authStore.user?.email || '',
    clientPhone: '',
    preferredDateTime: '',
    alternativeDateTime: '',
    message: '',
  }));

  const viewDetails = (p: Property) => {
    selectedProperty.value = p;
    showDetailsModal.value = true;
  };

  const requestVisit = (prop: Property) => {
    requestTarget.value = {
      id: prop.id,
      name: prop.title,
      agentId: prop.assignedAgentId || null,
      agentName: prop.agentName || t('common.advisor'),
    };
    showRequestModal.value = true;
  };

  const confirmRemove = (p: Property) => {
    propertyToRemove.value = p;
    showRemoveModal.value = true;
  };

  async function submitVisitRequest() {
    if (!requestFormRef.value || !requestTarget.value) return;
    const values = await requestFormRef.value.submit();
    if (!values) {
      toast.error(t('common.validationError'));
      return;
    }
    submittingRequest.value = true;
    try {
      await createVisitRequest({
        ...values,
        propertyId: requestTarget.value.id,
        propertyName: requestTarget.value.name,
        agentId: requestTarget.value.agentId || '',
        agentName: requestTarget.value.agentName,
        clientId: authStore.user?.sub || authStore.user?.userId || '',
        preferredDateTime: new Date(values.preferredDateTime).toISOString(),
        alternativeDateTime: values.alternativeDateTime
          ? new Date(values.alternativeDateTime).toISOString()
          : undefined,
      });
      toast.success(t('scheduleVisit.successMessage'));
      showRequestModal.value = false;
    } catch (e) {
      toast.error(handleApiError(e).message);
    } finally {
      submittingRequest.value = false;
    }
  }

  async function doRemove() {
    if (!propertyToRemove.value) return;
    try {
      await toggleFavorite(propertyToRemove.value.id);
      toast.success(t('favorites.removedSuccess'));
      showRemoveModal.value = false;
    } catch {
      toast.error(t('favorites.removeError'));
    }
  }

  onMounted(load);
</script>
