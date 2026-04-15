<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors"
    >
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('clientProperties.title') }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {{ t('clientProperties.subtitle') }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <ThemeToggle />
          <router-link
            to="/favorites"
            class="flex items-center gap-2 px-4 py-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-xl text-sm font-semibold hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
          >
            ❤️ {{ t('nav.favorites') }}
          </router-link>
        </div>
      </div>
    </div>

    <main class="max-w-7xl mx-auto p-6 space-y-8 pb-20">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="col-span-1 md:col-span-2">
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('clientProperties.searchTitle') }}
            </label>
            <input
              v-model="filters.title"
              type="text"
              :placeholder="t('clientProperties.titlePlaceholder')"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('clientProperties.zoneLabel').replace(':', '') }}
            </label>
            <input
              v-model="filters.zone"
              type="text"
              placeholder="Ej: Equipetrol..."
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('common.type') }}
            </label>
            <select
              v-model="filters.type"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{{ t('clientProperties.allTypeOption') }}</option>
              <option value="CASA">{{ t('propertyForm.house') }}</option>
              <option value="APARTAMENTO">{{ t('propertyForm.apartment') }}</option>
              <option value="LOCAL">{{ t('propertyForm.commercialSpace') }}</option>
            </select>
          </div>
        </div>

        <div
          class="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 gap-4"
        >
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <input
                v-model.number="filters.minPrice"
                type="number"
                :placeholder="t('clientProperties.minPrice')"
                class="w-32 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-gray-400">-</span>
              <input
                v-model.number="filters.maxPrice"
                type="number"
                :placeholder="t('clientProperties.maxPrice')"
                class="w-32 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <fwb-button color="alternative" size="sm" @click="clearFilters">
              {{ t('common.clear') }}
            </fwb-button>
            <fwb-button color="blue" size="sm" @click="applyFilters">
              {{ t('clientProperties.applyFilters') }}
            </fwb-button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"
        ></div>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-center"
      >
        {{ error }}
      </div>

      <div v-else class="space-y-8">
        <div
          v-if="properties.length === 0"
          class="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700"
        >
          <p class="text-gray-500 dark:text-gray-400">{{ t('clientProperties.emptyText') }}</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <fwb-card
            v-for="prop in properties"
            :key="prop.id"
            @click="openPropertyModal(prop)"
            class="flex flex-col h-full overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border-gray-200 dark:border-gray-700 relative dark:bg-gray-800"
          >
            <div class="absolute top-3 left-3 z-10">
              <fwb-badge :type="getOpTypeBadge(prop.operationType)">
                {{ prop.operationType ? t('propertyOperations.' + prop.operationType) : '' }}
              </fwb-badge>
            </div>

            <div
              class="h-56 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400"
            >
              <img
                v-if="prop.imageUrls?.length"
                :src="prop.imageUrls[0]"
                class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span v-else>{{ t('common.noImage') }}</span>
            </div>

            <div class="p-6 flex-1 flex flex-col">
              <div class="flex justify-between items-start mb-2">
                <h5 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {{ prop.title }}
                </h5>
                <button
                  @click.stop="toggleFavorite(prop.id)"
                  class="text-2xl transition-transform active:scale-125"
                >
                  <span v-if="isFavorite(prop.id)" class="text-red-500">❤️</span>
                  <span v-else class="text-gray-300 dark:text-gray-600 hover:text-red-400">🤍</span>
                </button>
              </div>

              <div class="mb-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <span class="text-lg">📍</span>
                  {{ prop.address }}
                </p>
                <p
                  class="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-1 flex items-center gap-1.5"
                >
                  <span class="font-bold text-blue-500/80">
                    {{ t('clientProperties.zoneLabel') }}
                  </span>
                  {{ prop.zone || t('common.notSpecified') }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2 mb-6">
                <fwb-badge type="default" size="sm" class="flex items-center gap-1">
                  🏠 {{ t('propertyTypes.' + prop.type) }}
                </fwb-badge>
                <fwb-badge type="default" size="sm" class="flex items-center gap-1">
                  📐 {{ prop.m2 }} {{ t('common.m2') }}
                </fwb-badge>
                <fwb-badge type="default" size="sm" class="flex items-center gap-1">
                  🛏️ {{ prop.rooms }} {{ t('propertyForm.rooms') }}
                </fwb-badge>
              </div>

              <div class="mt-auto flex items-center justify-between">
                <div>
                  <p
                    class="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-tighter mb-0.5"
                  >
                    {{ t('common.price') }}
                  </p>
                  <p class="text-3xl font-black text-blue-600 dark:text-blue-500">
                    ${{ prop.price.toLocaleString() }}
                  </p>
                </div>
                <fwb-button
                  v-if="prop.status === 'DISPONIBLE'"
                  @click.stop="openRequestModal(prop)"
                  class="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  {{ t('clientProperties.scheduleVisit') }}
                </fwb-button>
              </div>
            </div>
          </fwb-card>
        </div>

        <Pagination
          v-if="!loading && totalPages > 1"
          v-model:current-page="filters.page"
          v-model:page-size="filters.pageSize"
          :total-pages="totalPages"
          :total="totalElements"
          @change="loadProperties"
        />
      </div>
    </main>

    <!-- Modals -->
    <property-details-modal
      v-if="selectedProperty"
      :show="!!selectedProperty"
      :property="selectedProperty"
      :is-client-view="true"
      @close="selectedProperty = null"
      @schedule-visit="handleScheduleVisit"
    />

    <fwb-modal v-if="showRequestModal" @close="closeRequestModal" size="xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
            <IconLucideCalendar class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="text-lg font-bold dark:text-white">
              {{ t('clientProperties.visitRequestTitle') }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ requestTarget?.name }} · {{ requestTarget?.agentName }}
            </p>
          </div>
        </div>
      </template>
      <template #body>
        <form @submit.prevent="submitVisitRequest" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <fwb-input
              v-model="clientName"
              :label="t('clientProperties.form.name')"
              :placeholder="t('clientProperties.placeholder.name')"
              required
            />
            <fwb-input
              v-model="clientEmail"
              :label="t('clientProperties.form.email')"
              :placeholder="t('clientProperties.placeholder.email')"
              required
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <fwb-input
              v-model="clientPhone"
              :label="t('clientProperties.form.phone')"
              :placeholder="t('clientProperties.placeholder.phone')"
            />
            <fwb-input
              v-model="preferredDateTime"
              type="datetime-local"
              :label="t('clientProperties.form.preferredSchedule')"
              required
            />
          </div>
          <fwb-input
            v-model="alternativeDateTime"
            type="datetime-local"
            :label="t('clientProperties.form.alternativeSchedule')"
          />
          <fwb-textarea
            v-model="message"
            :label="t('clientProperties.form.message')"
            :placeholder="t('clientProperties.placeholder.message')"
            :rows="3"
          />
          <p class="text-[10px] text-gray-400 italic">
            {{ t('clientProperties.submitNote', { agent: requestTarget?.agentName }) }}
          </p>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <fwb-button color="alternative" @click="closeRequestModal">
            {{ t('common.cancel') }}
          </fwb-button>
          <fwb-button color="blue" @click="submitVisitRequest" :disabled="requestSubmitting">
            {{
              requestSubmitting
                ? t('clientProperties.sending')
                : t('clientProperties.submitRequest')
            }}
          </fwb-button>
        </div>
      </template>
    </fwb-modal>

    <!-- Alerts/Toasts -->
    <div v-if="showSuccessAlert" class="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <fwb-alert type="success" @close="showSuccessAlert = false" closable>
        {{ successMessage }}
      </fwb-alert>
    </div>

    <div v-if="showErrorAlert" class="fixed bottom-6 right-6 z-50">
      <fwb-alert type="danger" @close="showErrorAlert = false" closable>
        {{ errorMessage }}
      </fwb-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import {
    FwbCard,
    FwbBadge,
    FwbButton,
    FwbModal,
    FwbInput,
    FwbTextarea,
    FwbAlert,
  } from 'flowbite-vue';

  import IconLucideCalendar from '~icons/lucide/calendar';
  import { propertyService } from '@/modules/properties';
  import { favoriteService } from '@/services/favoriteService';
  import { createVisitRequest as apiCreateVisitRequest } from '@/services/visitRequestService';
  import { userService } from '@/services/userService';
  import { useAuthStore } from '@/modules/auth';
  import { handleApiError } from '@/api/errorHandler';
  import {
    visitRequestSchema,
    type VisitRequestFormValues,
  } from '@/modules/properties/schemas/visitSchema';
  import type { Property } from '@/types/property';
  import type { ClientVisitRequestDTO } from '@/types/visitCalendar';

  import PropertyDetailsModal from '@/components/properties/PropertyDetailsModal.vue';
  import ThemeToggle from '@/components/ThemeToggle.vue';
  import Pagination from '@/components/ui/Pagination.vue';

  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const properties = ref<Property[]>([]);
  const loading = ref(true);
  const error = ref('');
  const totalElements = ref(0);
  const totalPages = ref(0);
  const agentNames = ref<Record<string, string>>({});

  const filters = ref({
    title: (route.query.title as string) || '',
    type: (route.query.type as string) || '',
    zone: (route.query.zone as string) || '',
    operationType: (route.query.operationType as string) || '',
    minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
    maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
    sortBy: (route.query.sortBy as string) || 'price',
    sortOrder: (route.query.sortOrder as 'ASC' | 'DESC') || 'ASC',
    page: route.query.page ? Number(route.query.page) : 0,
    pageSize: route.query.pageSize ? Number(route.query.pageSize) : 10,
  });

  const selectedProperty = ref<Property | null>(null);
  const showRequestModal = ref(false);
  const requestTarget = ref<{
    id: string;
    name: string;
    agentId: string;
    agentName: string;
  } | null>(null);
  const requestSubmitting = ref(false);
  const showSuccessAlert = ref(false);
  const showErrorAlert = ref(false);
  const successMessage = ref('');
  const errorMessage = ref('');
  let successTimer: ReturnType<typeof setTimeout> | null = null;

  const myClientId = computed(() => authStore.user?.sub || authStore.user?.userId);
  const myClientName = computed(() => authStore.user?.fullName || authStore.user?.name);
  const myClientEmail = computed(() => authStore.user?.email);

  const {
    defineField,
    handleSubmit: onRequestSubmit,
    resetForm,
  } = useForm({
    validationSchema: toTypedSchema(visitRequestSchema),
  });

  const [clientName] = defineField('clientName');
  const [clientEmail] = defineField('clientEmail');
  const [clientPhone] = defineField('clientPhone');
  const [preferredDateTime] = defineField('preferredDateTime');
  const [alternativeDateTime] = defineField('alternativeDateTime');
  const [message] = defineField('message');

  const favorites = ref<Set<string>>(new Set());

  const getAvailableProperties = async (params: Record<string, unknown>) => {
    const res = await propertyService.getProperties(params);
    return {
      data: res.data || [],
      totalElements: res.meta?.total || 0,
      totalPages: Math.ceil((res.meta?.total || 0) / (res.meta?.limit || 9)),
    };
  };

  const createVisitRequest = async (dto: ClientVisitRequestDTO) => {
    return await apiCreateVisitRequest(dto);
  };

  async function loadProperties() {
    loading.value = true;
    error.value = '';
    try {
      const result = await getAvailableProperties({
        title: filters.value.title || undefined,
        type: filters.value.type || undefined,
        zone: filters.value.zone || undefined,
        operationType: filters.value.operationType || undefined,
        minPrice: filters.value.minPrice,
        maxPrice: filters.value.maxPrice,
        sortBy: filters.value.sortBy,
        sortOrder: filters.value.sortOrder,
        page: filters.value.page,
        pageSize: filters.value.pageSize,
        status: 'DISPONIBLE',
      });

      properties.value = result.data;
      totalElements.value = result.totalElements;
      totalPages.value = result.totalPages;

      loadAgentNames(properties.value);

      router.replace({
        query: {
          status: 'DISPONIBLE',
          ...(filters.value.title && { title: filters.value.title }),
          ...(filters.value.type && { type: filters.value.type }),
          ...(filters.value.zone && { zone: filters.value.zone }),
          ...(filters.value.operationType && { operationType: filters.value.operationType }),
          sortBy: filters.value.sortBy,
          sortOrder: filters.value.sortOrder,
          page: String(filters.value.page),
          pageSize: String(filters.value.pageSize),
        },
      });
    } catch (e: unknown) {
      error.value = handleApiError(e).message;
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => filters.value.pageSize,
    () => {
      filters.value.page = 0;
      loadProperties();
    }
  );

  async function loadAgentNames(props: Property[]) {
    const ids = [...new Set(props.map((p) => p.assignedAgentId).filter(Boolean))];
    for (const id of ids) {
      if (id && !agentNames.value[id]) {
        try {
          const u = await userService.getUserById(id as string);
          agentNames.value[id] = u.data.fullName || u.data.firstName;
        } catch {
          agentNames.value[id as string] = t('common.advisor');
        }
      }
    }
  }

  function applyFilters() {
    filters.value.page = 0;
    loadProperties();
  }

  function clearFilters() {
    filters.value = {
      title: '',
      type: '',
      zone: '',
      operationType: '',
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'price',
      sortOrder: 'ASC',
      page: 0,
      pageSize: 10,
    };
    loadProperties();
  }

  const toggleFavorite = async (propertyId: string) => {
    try {
      if (favorites.value.has(propertyId)) {
        favorites.value.delete(propertyId);
        await favoriteService.removeFavorite(propertyId);
      } else {
        favorites.value.add(propertyId);
        await favoriteService.addFavorite(propertyId);
      }
    } catch (error: unknown) {
      if (favorites.value.has(propertyId)) favorites.value.delete(propertyId);
      else favorites.value.add(propertyId);
      errorMessage.value = handleApiError(error).message;
      showErrorAlert.value = true;
    }
  };

  const loadFavorites = async () => {
    try {
      const ids = await favoriteService.getFavorites();
      favorites.value = new Set(ids);
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  };

  const isFavorite = (id: string) => favorites.value.has(id);

  function openPropertyModal(prop: Property) {
    selectedProperty.value = prop;
  }

  function handleScheduleVisit() {
    if (selectedProperty.value) {
      openRequestModal(selectedProperty.value);
    }
  }

  function openRequestModal(prop: Property) {
    const agentId = prop.assignedAgentId || '';
    requestTarget.value = {
      id: prop.id,
      name: prop.title,
      agentId: agentId,
      agentName: agentNames.value[agentId] || prop.agentName || t('common.advisor'),
    };
    showRequestModal.value = true;
    selectedProperty.value = null;

    resetForm({
      values: {
        propertyId: prop.id,
        clientName: myClientName.value as string,
        clientEmail: myClientEmail.value as string,
        clientPhone: '',
        preferredDateTime: '',
        alternativeDateTime: '',
        message: '',
      },
    });
  }

  function closeRequestModal() {
    showRequestModal.value = false;
    requestTarget.value = null;
  }

  const submitVisitRequest = onRequestSubmit(async (values: VisitRequestFormValues) => {
    if (!requestTarget.value) return;
    requestSubmitting.value = true;
    try {
      const dto: ClientVisitRequestDTO = {
        propertyId: requestTarget.value.id,
        propertyName: requestTarget.value.name,
        agentId: requestTarget.value.agentId,
        agentName: requestTarget.value.agentName,
        clientId: myClientId.value as string,
        clientName: values.clientName,
        clientEmail: values.clientEmail,
        clientPhone: values.clientPhone || undefined,
        preferredDateTime: new Date(values.preferredDateTime).toISOString(),
        alternativeDateTime: values.alternativeDateTime
          ? new Date(values.alternativeDateTime).toISOString()
          : undefined,
        message: values.message || undefined,
      };
      await createVisitRequest(dto);
      closeRequestModal();
      successMessage.value = t('scheduleVisit.successMessage');
      showSuccessAlert.value = true;
      if (successTimer) clearTimeout(successTimer);
      successTimer = setTimeout(() => (showSuccessAlert.value = false), 3000);
    } catch (e: unknown) {
      errorMessage.value = handleApiError(e).message;
      showErrorAlert.value = true;
    } finally {
      requestSubmitting.value = false;
    }
  });

  const getOpTypeBadge = (type?: string) => {
    if (type === 'VENTA') return 'indigo';
    if (type === 'ALQUILER') return 'green';
    if (type === 'ANTICRETICO') return 'yellow';
    return 'default';
  };

  onMounted(() => {
    loadProperties();
    loadFavorites();
  });
</script>

<style scoped>
  .animate-bounce-in {
    animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  @keyframes bounce-in {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
      opacity: 1;
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
