<template>
  <div class="relative" id="property-select-container">
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {{ t('scheduleVisit.property') }}
      <span class="text-red-500">*</span>
    </label>

    <div class="relative">
      <fwb-input
        v-model="searchTerm"
        :placeholder="
          loading ? t('scheduleVisit.loadingProperties') : t('scheduleVisit.searchProperty')
        "
        size="md"
        class="rounded-xl"
        :validation-status="error ? 'error' : undefined"
        :validation-message="error"
        @focus="showDropdown = true"
        autocomplete="off"
      >
        <template #prefix>
          <IconLucideLoader v-if="loading" class="animate-spin h-4 w-4 text-blue-500" />
          <IconLucideSearch v-else class="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </template>
        <template #suffix>
          <button type="button" @click="showDropdown = !showDropdown" class="p-1">
            <IconLucideChevronDown class="h-5 w-5 text-gray-400" />
          </button>
        </template>
      </fwb-input>
    </div>

    <div
      v-if="showDropdown"
      class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-72 overflow-y-auto"
    >
      <ul class="py-1 text-sm">
        <li
          v-if="filteredProperties.length === 0"
          class="px-4 py-3 text-gray-500 italic text-center"
        >
          {{ t('scheduleVisit.noPropertiesFound') }}
        </li>
        <li
          v-for="p in filteredProperties"
          :key="p.id"
          @click="select(p)"
          class="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer flex justify-between items-center border-b last:border-b-0 border-gray-100 dark:border-gray-700"
        >
          <div class="min-w-0">
            <p class="font-bold truncate">{{ p.title }}</p>
            <p class="text-xs text-gray-500 truncate">{{ p.address }}</p>
          </div>
          <fwb-badge :type="p.status === 'DISPONIBLE' ? 'green' : 'red'" size="sm">
            {{ t('status.' + p.status.toLowerCase()) }}
          </fwb-badge>
        </li>
      </ul>
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-500 font-medium">{{ error }}</p>

    <!-- Property Summary Card -->
    <div
      v-if="selectedProperty"
      class="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 space-y-2"
    >
      <div class="flex justify-between items-start">
        <h3 class="font-bold text-blue-900 dark:text-blue-200">
          {{ selectedProperty.title }}
        </h3>
        <fwb-badge type="green" size="sm">{{ t('status.disponible') }}</fwb-badge>
      </div>
      <p class="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
        {{ selectedProperty.address }}
      </p>
      <div
        class="flex gap-4 pt-1 border-t border-blue-100 dark:border-blue-800/30 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400"
      >
        <span>{{ t('scheduleVisit.areaLabel') }}: {{ selectedProperty.m2 }}</span>
        <span>{{ t('scheduleVisit.roomsLabel') }}: {{ selectedProperty.rooms }}</span>
        <span>
          {{ t('scheduleVisit.priceLabel') }}: ${{ selectedProperty.price.toLocaleString() }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbBadge, FwbInput } from 'flowbite-vue';
  import IconLucideSearch from '~icons/lucide/search';
  import IconLucideChevronDown from '~icons/lucide/chevron-down';
  import IconLucideLoader from '~icons/lucide/loader';
  import { propertyService } from '@/modules/properties';
  import type { Property } from '@/modules/properties/types/property';

  const { t } = useI18n();
  defineProps<{ modelValue?: string; error?: string }>();
  const emit = defineEmits(['update:modelValue', 'change']);

  const loading = ref(false);
  const showDropdown = ref(false);
  const searchTerm = ref('');
  const allProperties = ref<Property[]>([]);
  const selectedProperty = ref<Property | null>(null);

  const filteredProperties = computed(() => {
    const s = searchTerm.value.toLowerCase();
    return allProperties.value
      .filter((p) => !s || p.title.toLowerCase().includes(s) || p.address.toLowerCase().includes(s))
      .slice(0, 20);
  });

  async function load() {
    loading.value = true;
    try {
      const res = await propertyService.getProperties({ status: 'DISPONIBLE' });
      allProperties.value = res.data || [];
    } finally {
      loading.value = false;
    }
  }

  function select(p: Property) {
    selectedProperty.value = p;
    searchTerm.value = p.title;
    showDropdown.value = false;
    emit('update:modelValue', p.id);
    emit('change', p);
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest('#property-select-container'))
      showDropdown.value = false;
  };

  onMounted(() => {
    load();
    window.addEventListener('click', handleClickOutside);
  });
  onUnmounted(() => window.removeEventListener('click', handleClickOutside));
</script>
