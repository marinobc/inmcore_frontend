<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div class="col-span-1 md:col-span-2">
        <fwb-input
          v-model="localFilters.title"
          :label="t('clientProperties.searchTitle')"
          :placeholder="t('clientProperties.titlePlaceholder')"
          size="sm"
        />
      </div>

      <div>
        <fwb-input
          v-model="localFilters.zone"
          :label="t('clientProperties.zoneLabel').replace(':', '')"
          :placeholder="t('clientProperties.zonePlaceholder')"
          size="sm"
        />
      </div>

      <div>
        <fwb-select
          v-model="localFilters.type"
          :label="t('propertyForm.propertyType')"
          :options="propertyTypeOptions"
        />
      </div>

      <div v-if="showStatus && !hideStatus">
        <fwb-select
          v-model="localFilters.status"
          :label="t('users.table.status')"
          :options="statusOptions"
        />
      </div>

      <div>
        <fwb-select
          v-model="localFilters.operationType"
          :label="t('common.type')"
          :options="operationTypeOptions"
        />
      </div>
    </div>

    <div
      class="flex flex-wrap items-center justify-end mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 gap-4"
    >
      <div class="flex items-center gap-2">
        <fwb-button color="alternative" size="sm" @click="clear">
          {{ t('common.clear') }}
        </fwb-button>
        <fwb-button color="blue" size="sm" @click="$emit('apply', localFilters)">
          {{ t('clientProperties.applyFilters') }}
        </fwb-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton, FwbInput, FwbSelect } from 'flowbite-vue';

  const { t } = useI18n();
  const props = defineProps<{
    filters: Record<string, unknown>;
    showStatus?: boolean;
    hideStatus?: boolean; // New prop to explicitly hide status
  }>();
  const emit = defineEmits(['update:filters', 'apply', 'clear']);

  const propertyTypeOptions = computed(() => [
    { value: '', name: t('propertyType.all') },
    ...['CASA', 'DEPARTAMENTO', 'TERRENO', 'LOCAL', 'OFICINA', 'INDUSTRIAL', 'OTROS'].map(
      (key) => ({
        value: key,
        name: t('propertyTypes.' + key),
      })
    ),
  ]);

  const statusOptions = computed(() => [
    { value: '', name: t('common.all') || 'Todos' },
    { value: 'DISPONIBLE', name: t('status.DISPONIBLE') },
    { value: 'VENDIDO', name: t('status.VENDIDO') },
    { value: 'RESERVADO', name: t('status.RESERVADO') },
    { value: 'EN_NEGOCIACION', name: t('status.EN_NEGOCIACION') },
  ]);

  const operationTypeOptions = computed(() => [
    { value: '', name: t('common.all') || 'Todos' },
    ...['VENTA', 'ALQUILER', 'ANTICRETICO'].map((key) => ({
      value: key,
      name: t('propertyOperations.' + key),
    })),
  ]);

  interface FilterState {
    title?: string;
    zone?: string;
    type?: string;
    status?: string;
    operationType?: string;
    page?: number;
    pageSize?: number;
    [key: string]: unknown;
  }

  const localFilters = reactive<FilterState>({ ...(props.filters as FilterState) });

  watch(
    localFilters,
    (val) => {
      emit('update:filters', val);
    },
    { deep: true }
  );

  function clear() {
    localFilters.title = undefined;
    localFilters.zone = undefined;
    localFilters.type = undefined;
    localFilters.status = undefined;
    localFilters.operationType = undefined;
    localFilters.page = 0;
    localFilters.pageSize = 10;
    emit('clear');
  }
</script>
