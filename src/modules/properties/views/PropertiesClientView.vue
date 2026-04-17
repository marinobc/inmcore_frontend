<template>
  <div>
    <PageHeader
      :title="t('clientProperties.title')"
      :subtitle="t('clientProperties.subtitle')"
    ></PageHeader>

    <PageContainer class="space-y-8 pb-20">
      <PropertyFilters v-model:filters="filters" @apply="load" @clear="load" />

      <div v-if="loading" class="flex justify-center py-20">
        <IconLucideLoader class="animate-spin h-12 w-12 text-blue-600" />
      </div>
      <fwb-alert v-else-if="error" type="danger" class="rounded-xl">{{ error }}</fwb-alert>

      <div v-else class="space-y-8">
        <div
          v-if="properties.length === 0"
          class="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700"
        >
          <p class="text-gray-500">{{ t('clientProperties.emptyText') }}</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PropertyCard
            v-for="prop in properties"
            :key="prop.id"
            :property="prop"
            :is-favorite="isFavorite(prop.id)"
            show-favorite
            @click="selectedProperty = prop"
            @toggle-favorite="toggleFavorite"
          >
            <template #action>
              <fwb-button
                v-if="prop.status === 'DISPONIBLE'"
                @click.stop="openRequestModal(prop)"
                color="blue"
                size="xs"
                class="inline-flex items-center"
              >
                {{ t('clientProperties.scheduleVisit') }}
              </fwb-button>
            </template>
          </PropertyCard>
        </div>

        <Pagination
          v-if="totalPages > 1"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total-pages="totalPages"
          :total="totalElements"
          @change="loadPage"
        />
      </div>
    </PageContainer>

    <!-- Modals -->
    <PropertyDetailsModal
      v-if="selectedProperty"
      :show="!!selectedProperty"
      :property="selectedProperty"
      :is-client-view="true"
      @close="selectedProperty = null"
      @schedule-visit="if (selectedProperty) openRequestModal(selectedProperty);"
    />

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
  import { FwbButton, FwbAlert, FwbModal } from 'flowbite-vue';
  import IconLucideCalendar from '~icons/lucide/calendar';
  import IconLucideLoader from '~icons/lucide/loader';

  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';

  import { useProperties } from '../composables/useProperties';
  import { useAuthStore } from '@/modules/auth';
  import { useToast } from '@/shared/composables/useToast';
  import { createVisitRequest } from '@/modules/visits/services/visitRequestService';
  import { handleApiError } from '@/core/api/errorHandler';
  import type { Property } from '../types/property';

  import PropertyCard from '../components/PropertyCard.vue';
  import PropertyFilters from '../components/PropertyFilters.vue';
  import PropertyDetailsModal from '../components/PropertyDetailsModal.vue';
  import VisitRequestForm from '../components/VisitRequestForm.vue';
  import Pagination from '@/shared/components/ui/Pagination.vue';

  const { t } = useI18n();
  const toast = useToast();
  const authStore = useAuthStore();
  const {
    properties,
    loading,
    error,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    filters,
    load,
    loadPage,
    loadFavorites,
    toggleFavorite,
    isFavorite,
  } = useProperties('DISPONIBLE');

  const selectedProperty = ref<Property | null>(null);
  const showRequestModal = ref(false);

  interface RequestTarget {
    id: string;
    name: string;
    agentId: string | null;
    agentName: string;
  }

  const requestTarget = ref<RequestTarget | null>(null);
  const submittingRequest = ref(false);
  const requestFormRef = ref<InstanceType<typeof VisitRequestForm> | null>(null);

  const initialRequestValues = computed(() => ({
    propertyId: requestTarget.value?.id || '',
    clientName: authStore.user?.fullName || authStore.user?.name || '',
    clientEmail: authStore.user?.email || '',
    clientPhone: '',
    preferredDateTime: '',
    alternativeDateTime: '',
    message: '',
  }));

  function openRequestModal(prop: Property) {
    requestTarget.value = {
      id: prop.id,
      name: prop.title,
      agentId: prop.assignedAgentId || null,
      agentName: prop.agentName || t('common.advisor'),
    };
    showRequestModal.value = true;
    selectedProperty.value = null;
  }

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

  onMounted(() => {
    load();
    loadFavorites();
  });
</script>
