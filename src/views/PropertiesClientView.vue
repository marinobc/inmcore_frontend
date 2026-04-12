<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors"
    >
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center gap-3">
          <router-link
            to="/dashboard"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <IconLucideArrowLeft class="h-5 w-5" />
          </router-link>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('clientProperties.title') }}
          </h1>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ t('clientProperties.subtitle') }}
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('clientProperties.searchTitle') }}
            </label>
            <input
              v-model="filters.title"
              :placeholder="t('clientProperties.titlePlaceholder')"
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

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('clientProperties.minPrice') }}
            </label>
            <input
              v-model.number="filters.minPrice"
              type="number"
              min="0"
              placeholder="0"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('clientProperties.maxPrice') }}
            </label>
            <input
              v-model.number="filters.maxPrice"
              type="number"
              min="0"
              :placeholder="t('clientProperties.noLimit')"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('clientProperties.sortBy') }}
            </label>
            <select
              v-model="filters.sortBy"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">{{ t('clientProperties.sort.price') }}</option>
              <option value="title">{{ t('clientProperties.sort.title') }}</option>
              <option value="m2">{{ t('clientProperties.sort.area') }}</option>
              <option value="rooms">{{ t('clientProperties.sort.rooms') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('clientProperties.sortOrder') }}
            </label>
            <select
              v-model="filters.sortOrder"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ASC">{{ t('clientProperties.order.ascending') }}</option>
              <option value="DESC">{{ t('clientProperties.order.descending') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('clientProperties.pageSizeLabel') }}
            </label>
            <select
              v-model="filters.pageSize"
              @change="applyFilters"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="opt in PAGE_SIZE_OPTIONS" :key="opt" :value="opt">
                {{ opt }} {{ t('clientProperties.perPage') }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 mt-3">
          <button
            @click="applyFilters"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {{ t('clientProperties.applyFilters') }}
          </button>
          <button
            @click="clearFilters"
            class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {{ t('common.clear') }}
          </button>
        </div>

        <p class="text-xs text-green-700 dark:text-green-400 mt-2 flex items-center gap-1">
          <IconLucideCircleCheck class="h-3.5 w-3.5" />
          {{ t('clientProperties.availableOnly') }}
        </p>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400">
        <span class="font-semibold text-gray-900 dark:text-white">{{ properties.length }}</span>
        {{ properties.length }} {{ t('clientProperties.resultsCount') }}
      </p>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-64 animate-pulse transition-colors"
        >
          <div class="h-36 bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
          <div class="p-4 space-y-2">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm transition-colors"
      >
        {{ error }}
        <button
          @click="loadProperties"
          class="ml-2 underline hover:text-red-800 dark:hover:text-red-300"
        >
          {{ t('common.retry') }}
        </button>
      </div>

      <div
        v-else-if="properties.length === 0"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors"
      >
        <IconLucideHome class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400 font-medium">
          {{ t('clientProperties.emptyText') }}
        </p>
        <button
          @click="clearFilters"
          class="mt-2 text-sm text-blue-600 dark:text-blue-400 underline"
        >
          {{ t('clientProperties.viewAll') }}
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="prop in properties"
          :key="prop.id"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
          @click="openPropertyModal(prop)"
        >
          <div
            class="relative h-44 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center transition-colors"
          >
            <img
              v-if="prop.imageUrl"
              :src="prop.imageUrl"
              :alt="prop.title"
              class="w-full h-full object-cover"
            />
            <IconLucideHome v-else class="h-16 w-16 text-blue-300 dark:text-gray-500" />
            <span
              class="absolute top-3 left-3 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm"
              :class="{
                'bg-green-500 dark:bg-green-600': prop.status === 'DISPONIBLE',
                'bg-yellow-500 dark:bg-yellow-600': prop.status === 'RESERVADO',
                'bg-red-500 dark:bg-red-600': prop.status === 'VENDIDO',
                'bg-orange-500 dark:bg-orange-600': prop.status === 'EN_NEGOCIACION',
                'bg-gray-500 dark:bg-gray-600': ![
                  'DISPONIBLE',
                  'RESERVADO',
                  'VENDIDO',
                  'EN_NEGOCIACION',
                ].includes(prop.status),
              }"
            >
              {{ t('status.' + prop.status) }}
            </span>
            <span
              class="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm"
            >
              {{ t('propertyTypes.' + prop.type) }}
            </span>

            <button
              @click.stop="toggleFavorite(prop.id)"
              class="absolute top-3 right-12 p-2 rounded-full backdrop-blur-md transition-all"
              :class="
                isFavorite(prop.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-400 hover:text-red-500'
              "
            >
              <IconLucideHeart
                class="w-5 h-5"
                :fill="isFavorite(prop.id) ? 'currentColor' : 'none'"
              />
            </button>
          </div>

          <div class="p-4">
            <h3 class="font-semibold text-gray-900 dark:text-white truncate">
              {{ prop.title }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              📍 {{ prop.address }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ t('clientProperties.zoneLabel') }} {{ prop.zone }}
            </p>

            <div class="flex items-center justify-between mt-3">
              <span class="text-lg font-bold text-blue-700 dark:text-blue-400">
                ${{ prop.price.toLocaleString(getLocaleString()) }}
              </span>
            </div>
            <button
              v-if="prop.status === 'DISPONIBLE'"
              @click.stop="openRequestModal(prop)"
              class="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {{ t('clientProperties.scheduleVisit') }}
            </button>
            <button
              v-else
              disabled
              class="px-3 py-1.5 text-xs font-semibold text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-not-allowed"
            >
              {{ t('status.' + prop.status) || t('clientProperties.notAvailable') }}
            </button>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {{ t('common.agent') }} {{ prop.agentName }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-6 pb-10">
        <button
          @click="goToPage(filters.page - 1)"
          :disabled="filters.page === 0"
          class="px-3 py-2 rounded-lg border dark:border-gray-600 disabled:opacity-30 dark:text-white bg-white dark:bg-gray-800"
        >
          {{ t('clientProperties.previous') }}
        </button>

        <template v-for="page in totalPages" :key="page">
          <button
            @click="goToPage(page - 1)"
            :class="[
              'px-4 py-2 rounded-lg border transition-colors',
              filters.page === page - 1
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:bg-gray-100',
            ]"
          >
            {{ page }}
          </button>
        </template>

        <button
          @click="goToPage(filters.page + 1)"
          :disabled="filters.page >= totalPages - 1"
          class="px-3 py-2 rounded-lg border dark:border-gray-600 disabled:opacity-30 dark:text-white bg-white dark:bg-gray-800"
        >
          {{ t('clientProperties.next') }}
        </button>
      </div>
    </div>

    <client-property-details-modal
      v-if="selectedProperty && !showRequestModal"
      :show="!!selectedProperty"
      :property="selectedProperty as unknown as PropertyType"
      @close="selectedProperty = null"
      @schedule-visit="handleScheduleVisit"
    />

    <Transition name="fade">
      <div
        v-if="showRequestModal && requestTarget"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60"
        @click.self="closeRequestModal"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh] transition-colors"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ t('clientProperties.visitRequestTitle') }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ requestTarget.name }}
              </p>
            </div>
            <button
              @click="closeRequestModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <IconLucideX class="h-5 w-5" />
            </button>
          </div>

          <form @submit.prevent="submitVisitRequest" class="space-y-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('clientProperties.requiredNote') }}
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {{ t('clientProperties.form.name') }}
                  <strong class="text-red-500">*</strong>
                </label>
                <input
                  v-model="clientName"
                  :placeholder="t('clientProperties.placeholder.name')"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  :class="{
                    'border-red-400 dark:border-red-500': fieldErrors.clientName,
                  }"
                />
                <p v-if="fieldErrors.clientName" class="text-xs text-red-500 mt-0.5">
                  {{ fieldErrors.clientName }}
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {{ t('clientProperties.form.email') }}
                  <strong class="text-red-500">*</strong>
                </label>
                <input
                  v-model="clientEmail"
                  type="email"
                  :placeholder="t('clientProperties.placeholder.email')"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  :class="{
                    'border-red-400 dark:border-red-500': fieldErrors.clientEmail,
                  }"
                />
                <p v-if="fieldErrors.clientEmail" class="text-xs text-red-500 mt-0.5">
                  {{ fieldErrors.clientEmail }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                {{ t('clientProperties.form.phone') }}
              </label>
              <input
                v-model="clientPhone"
                :placeholder="t('clientProperties.placeholder.phone')"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                {{ t('clientProperties.form.preferredSchedule') }}
                <strong class="text-red-500">*</strong>
              </label>
              <input
                v-model="preferredDateTime"
                type="datetime-local"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:[color-scheme:dark]"
                :class="{
                  'border-red-400 dark:border-red-500': fieldErrors.preferredDateTime,
                }"
                :min="minDatetime"
              />
              <p v-if="fieldErrors.preferredDateTime" class="text-xs text-red-500 mt-0.5">
                {{ fieldErrors.preferredDateTime }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                {{ t('clientProperties.form.alternativeSchedule') }}
              </label>
              <input
                v-model="alternativeDateTime"
                type="datetime-local"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:[color-scheme:dark]"
                :min="preferredDateTime || minDatetime"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                {{ t('clientProperties.form.message') }}
              </label>
              <textarea
                v-model="message"
                rows="3"
                :placeholder="t('clientProperties.placeholder.message')"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
              />
            </div>

            <p
              class="text-xs text-gray-500 dark:text-gray-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2"
            >
              {{ t('clientProperties.submitNote', { agent: requestTarget.agentName }) }}
            </p>

            <div class="flex gap-3 pt-1">
              <button
                type="button"
                @click="closeRequestModal"
                class="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="requestSubmitting"
                class="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {{
                  requestSubmitting
                    ? t('clientProperties.sending')
                    : t('clientProperties.submitRequest')
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showSuccessAlert" class="fixed top-4 right-4 z-[60] w-full max-w-sm">
        <FwbAlert type="success">
          <template #default>
            {{ successMessage }}
          </template>
        </FwbAlert>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showErrorAlert" class="fixed top-4 right-4 z-[60] w-full max-w-sm">
        <FwbAlert type="danger">
          <template #default>
            <div class="flex items-center justify-between gap-2">
              <span>{{ errorMessage }}</span>
              <button
                @click="showErrorAlert = false"
                class="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
              >
                &times;
              </button>
            </div>
          </template>
        </FwbAlert>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import IconLucideArrowLeft from '~icons/lucide/arrow-left';
  import IconLucideCircleCheck from '~icons/lucide/circle-check';
  import IconLucideHome from '~icons/lucide/home';
  import IconLucideHeart from '~icons/lucide/heart';
  import IconLucideX from '~icons/lucide/x';
  import { ref, computed, onMounted } from 'vue';
  import { FwbAlert } from 'flowbite-vue';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import { visitRequestSchema } from '@/modules/properties/schemas/visitSchema';
  import type { VisitRequestFormValues } from '@/modules/properties/schemas/visitSchema';
  import { getAvailableProperties, createVisitRequest } from '@/services/visitRequestService';
  import type { Property, ClientVisitRequestDTO } from '@/types/visitCalendar';
  import type { Property as PropertyType } from '@/types/property';
  import ClientPropertyDetailsModal from '@/components/properties/ClientPropertyDetailsModal.vue';

  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';
  const { t } = useI18n();

  const authStore = useAuthStore();
  const myClientId = computed(() => {
    const u = authStore.user as UserClaims | null;
    return (u?.sub || '') as string;
  });
  const myClientEmail = computed(() => {
    const u = authStore.user as UserClaims | null;
    return (u?.email || '') as string;
  });
  const myClientName = computed(() => {
    const u = authStore.user as UserClaims | null;
    if (u?.name) return u.name;
    if (u?.email) return ((u?.email as string) || '').split('@')[0];
    return '';
  });

  import { useRouter, useRoute } from 'vue-router';
  import { favoriteService } from '@/services/favoriteService';
  const router = useRouter();
  const route = useRoute();

  const totalElements = ref(0);
  const totalPages = ref(0);
  const PAGE_SIZE_OPTIONS = [9, 18, 27, 45];

  const properties = ref<Property[]>([]);
  const loading = ref(false);
  const error = ref('');

  const filters = ref({
    title: '',
    type: '',
    operationType: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    sortBy: 'price',
    sortOrder: 'ASC',
    page: 0,
    pageSize: 9,
  });

  const selectedProperty = ref<Property | null>(null);
  const showRequestModal = ref(false);
  const requestTarget = ref<Property | null>(null);
  const requestSuccess = ref(false);
  const requestSubmitting = ref(false);
  const showSuccessAlert = ref(false);
  const showErrorAlert = ref(false);
  const successMessage = ref('');
  const errorMessage = ref('');
  let successTimer: ReturnType<typeof setTimeout> | null = null;

  const {
    defineField,
    handleSubmit: onRequestSubmit,
    resetForm,
    errors: fieldErrors,
  } = useForm({
    validationSchema: toTypedSchema(visitRequestSchema),
  });

  const [clientName] = defineField('clientName');
  const [clientEmail] = defineField('clientEmail');
  const [clientPhone] = defineField('clientPhone');
  const [preferredDateTime] = defineField('preferredDateTime');
  const [alternativeDateTime] = defineField('alternativeDateTime');
  const [message] = defineField('message');

  const minDatetime = computed(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });

  const agentNames = ref<Record<string, string>>({});

  function loadAgentNames(propList: Property[]) {
    propList.forEach((p: Property) => {
      if (p.assignedAgentId && p.agentName) {
        agentNames.value[p.assignedAgentId] = p.agentName;
      }
    });
  }

  const favorites = ref<Set<string>>(new Set());

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
      if (favorites.value.has(propertyId)) {
        favorites.value.delete(propertyId);
      } else {
        favorites.value.add(propertyId);
      }
      const err = error as {
        response?: { data?: { message?: string; detail?: string } };
      };
      const msg = err.response?.data?.message || err.response?.data?.detail || t('common.error');
      errorMessage.value = msg;
      showErrorAlert.value = true;
    }
  };

  const loadFavorites = async () => {
    try {
      const ids = await favoriteService.getFavorites();
      favorites.value = new Set(ids);
    } catch (e) {
      console.error('Error loading favorites:', e);
      favorites.value = new Set();
    }
  };

  const isFavorite = (id: string) => favorites.value.has(id);

  async function loadProperties() {
    loading.value = true;
    error.value = '';
    try {
      const result = await getAvailableProperties({
        title: filters.value.title || undefined,
        type: filters.value.type || undefined,
        operationType: filters.value.operationType || undefined,
        minPrice: filters.value.minPrice,
        maxPrice: filters.value.maxPrice,
        sortBy: filters.value.sortBy,
        sortOrder: filters.value.sortOrder,
        page: filters.value.page,
        pageSize: filters.value.pageSize,
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
          ...(filters.value.operationType && {
            operationType: filters.value.operationType,
          }),
          ...(filters.value.minPrice !== undefined && {
            minPrice: String(filters.value.minPrice),
          }),
          ...(filters.value.maxPrice !== undefined && {
            maxPrice: String(filters.value.maxPrice),
          }),
          sortBy: filters.value.sortBy,
          sortOrder: filters.value.sortOrder,
          page: String(filters.value.page),
          pageSize: String(filters.value.pageSize),
        },
      });
    } catch (e: unknown) {
      const err = e as { message?: string };
      error.value = err.message || t('clientProperties.emptyText');
    } finally {
      loading.value = false;
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
      operationType: '',
      minPrice: undefined as number | undefined,
      maxPrice: undefined as number | undefined,
      sortBy: 'price',
      sortOrder: 'ASC',
      page: 0,
      pageSize: 9,
    };
    loadProperties();
  }

  function goToPage(p: number) {
    filters.value.page = p;
    loadProperties();
  }

  function openPropertyModal(prop: Property) {
    selectedProperty.value = prop;
    showRequestModal.value = false;
  }

  function handleScheduleVisit(_propertyId: string | undefined) {
    if (selectedProperty.value) {
      openRequestModal(selectedProperty.value);
    }
  }

  function openRequestModal(prop: Property) {
    const agentId = prop.assignedAgentId || prop.agentId || '';
    requestTarget.value = {
      ...prop,
      id: prop.id,
      name: prop.title || prop.name || '',
      agentId: agentId,
      agentName:
        (agentId ? agentNames.value[agentId] : undefined) ||
        prop.agentName ||
        t('common.agent').replace(':', ''),
    };
    showRequestModal.value = true;
    selectedProperty.value = null;
    requestSuccess.value = false;

    resetForm({
      values: {
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
        propertyId: requestTarget.value.id || '',
        propertyName: requestTarget.value.name || '',
        agentId: requestTarget.value.agentId || '',
        agentName: requestTarget.value.agentName || '',
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
      successMessage.value = t('clientProperties.submitNote', {
        agent: requestTarget.value?.agentName || '',
      });
      showSuccessAlert.value = true;
      if (successTimer) clearTimeout(successTimer);
      successTimer = setTimeout(() => {
        showSuccessAlert.value = false;
        successMessage.value = '';
      }, 3000);
    } catch (e: unknown) {
      const err = e as { message?: string };
      errorMessage.value = t('common.error') + ': ' + (err.message || t('common.error'));
      showErrorAlert.value = true;
    } finally {
      requestSubmitting.value = false;
    }
  });

  onMounted(async () => {
    await loadProperties();
    loadFavorites();

    const openVisitId = route.query.openVisitPropertyId as string | undefined;
    if (openVisitId) {
      const prop = properties.value.find((p) => p.id === openVisitId);
      if (prop) {
        setTimeout(() => openRequestModal(prop), 500);
      }
    }
  });
</script>
