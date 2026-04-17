<template>
  <fwb-card
    class="flex flex-col h-full overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border-gray-200 dark:border-gray-700 relative dark:bg-gray-800"
    @click="$emit('click', property)"
  >
    <div class="absolute top-3 left-3 z-10 flex flex-col gap-2">
      <fwb-badge :type="getOpTypeBadge(property.operationType)">
        {{ property.operationType ? t('propertyOperations.' + property.operationType) : '' }}
      </fwb-badge>
    </div>

    <div class="absolute top-3 right-3 z-10">
      <fwb-badge :type="getStatusBadgeType(property.status)" class="shadow-sm">
        {{ property.status ? t('propertyStatus.' + property.status.toLowerCase()) : '' }}
      </fwb-badge>
    </div>

    <div
      class="h-56 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 overflow-hidden"
    >
      <img
        v-if="property.imageUrls?.length"
        :src="property.imageUrls[0]"
        class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div v-else class="flex flex-col items-center gap-2">
        <span class="text-4xl">🏢</span>
        <span class="text-xs uppercase font-bold tracking-widest text-gray-400">
          {{ t('common.noImage') }}
        </span>
      </div>
    </div>

    <div class="p-5 flex-1 flex flex-col">
      <div class="flex justify-between items-start mb-2 gap-2">
        <h5 class="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
          {{ property.title }}
        </h5>
        <fwb-button
          v-if="showFavorite"
          @click.stop="$emit('toggle-favorite', property.id)"
          color="alternative"
          pill
          square
          size="sm"
          class="transition-transform active:scale-125 shrink-0 border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span v-if="isFavorite" class="text-xl">❤️</span>
          <span v-else class="text-xl">🤍</span>
        </fwb-button>
      </div>

      <div class="mb-4 space-y-1">
        <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 truncate">
          <span class="text-xs">📍</span>
          {{ property.address }}
        </p>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black uppercase text-blue-500/80">
            {{ t('clientProperties.zoneLabel') }}
          </span>
          <span class="text-xs text-gray-400 dark:text-gray-500">
            {{ property.zone || t('common.notSpecified') }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap gap-1.5 mb-5">
        <fwb-badge
          type="default"
          size="sm"
          class="bg-gray-50 dark:bg-gray-700/50 border-none text-[10px]"
        >
          {{ t('propertyTypes.' + property.type) }}
        </fwb-badge>
        <fwb-badge
          type="default"
          size="sm"
          class="bg-gray-50 dark:bg-gray-700/50 border-none text-[10px]"
        >
          {{ property.m2 }}{{ t('common.m2') }}
        </fwb-badge>
        <fwb-badge
          type="default"
          size="sm"
          class="bg-gray-50 dark:bg-gray-700/50 border-none text-[10px]"
        >
          {{ property.rooms }} {{ t('propertyForm.rooms') }}
        </fwb-badge>
      </div>

      <!-- Agent Info Row -->
      <div
        class="flex items-center gap-3 mb-6 p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50"
      >
        <div
          class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-xs shadow-sm border border-gray-100 dark:border-gray-700"
        >
          👤
        </div>
        <div class="flex-1 min-w-0">
          <p
            class="text-[10px] uppercase font-black text-gray-400 tracking-wider leading-none mb-1"
          >
            {{ t('adminProperties.agent') }}
          </p>
          <p class="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
            {{ property.agentName || property.assignedAgentId || t('common.unassigned') }}
          </p>
        </div>
      </div>

      <div class="mt-auto flex items-end justify-between">
        <div>
          <p
            class="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5"
          >
            {{ t('common.price') }}
          </p>
          <p class="text-2xl font-black text-blue-600 dark:text-blue-500">
            {{ property.price.toLocaleString() }}
            <span class="text-xs font-bold ml-1 opacity-60">USD</span>
          </p>
        </div>
        <div class="flex gap-2">
          <slot name="action"></slot>
        </div>
      </div>
      <div
        v-if="showDocumentUpload"
        class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700"
      >
        <DocumentUpload
          :property-id="property.id"
          :agent-id="property.assignedAgentId || undefined"
        />
      </div>
      <slot name="footer-extra"></slot>
    </div>
  </fwb-card>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { FwbCard, FwbBadge, FwbButton } from 'flowbite-vue';
  import type { Property, OperationType } from '../types/property';
  import DocumentUpload from './DocumentUpload.vue';

  const { t } = useI18n();

  defineProps<{
    property: Property;
    isFavorite?: boolean;
    showFavorite?: boolean;
    showDocumentUpload?: boolean;
  }>();

  defineEmits(['click', 'toggle-favorite']);

  type BadgeColor = 'default' | 'indigo' | 'green' | 'yellow' | 'red' | 'purple' | 'pink';

  const getOpTypeBadge = (type?: OperationType): BadgeColor => {
    const map: Record<string, BadgeColor> = {
      VENTA: 'indigo',
      ALQUILER: 'green',
      ANTICRETICO: 'yellow',
    };
    return map[type as string] || 'default';
  };

  const getStatusBadgeType = (status?: string): BadgeColor => {
    const s = status?.toUpperCase();
    if (s === 'AVAILABLE' || s === 'DISPONIBLE') return 'green';
    if (s === 'RESERVED' || s === 'RESERVADO') return 'yellow';
    if (s === 'SOLD' || s === 'VENDIDO') return 'red';
    return 'default';
  };
</script>
