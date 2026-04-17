<template>
  <div
    class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
  >
    <h4 class="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
      {{ t('propertyDetails.technicalSheet') }}
    </h4>
    <div class="grid grid-cols-2 gap-y-4 text-sm">
      <div v-for="field in fields" :key="field.label" class="contents">
        <span class="text-gray-500 dark:text-gray-400 font-medium">{{ t(field.label) }}</span>
        <span class="text-right font-bold text-gray-900 dark:text-white">{{ field.value }}</span>
      </div>
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { Property } from '../types/property';

  const { t } = useI18n();
  const props = defineProps<{ property: Property | null }>();

  const fields = computed(() => {
    if (!props.property) return [];
    return [
      { label: 'propertyDetails.location', value: props.property.address },
      {
        label: 'clientProperties.zoneLabel',
        value: props.property.zone || t('common.notSpecified'),
      },
      { label: 'propertyDetails.area', value: `${props.property.m2} m²` },
      { label: 'propertyDetails.bedrooms', value: props.property.rooms },
      { label: 'propertyForm.propertyType', value: t('propertyTypes.' + props.property.type) },
      {
        label: 'adminProperties.agent',
        value: props.property.agentName || props.property.assignedAgentId || t('common.unassigned'),
      },
    ];
  });
</script>
