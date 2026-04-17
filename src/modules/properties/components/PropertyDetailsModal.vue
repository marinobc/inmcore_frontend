<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="4xl">
    <template #header>
      <div class="flex items-center space-x-4">
        <h3 class="text-2xl font-bold dark:text-white">
          {{ property?.title }}
        </h3>
        <fwb-badge :color="getStatusColor(property?.status || '')">
          {{ property?.status ? t('status.' + property.status) : '' }}
        </fwb-badge>
      </div>
    </template>

    <template #body>
      <div class="grid grid-cols-1 gap-8" :class="{ 'lg:grid-cols-2': !isClientView }">
        <div class="space-y-4">
          <PropertySummary :property="property">
            <template #extra>
              <span class="text-gray-500 font-medium">
                {{ t('propertyDetails.currentStatus') }}
              </span>
              <div class="flex justify-end">
                <select
                  v-if="!isClientView"
                  v-model="localStatus"
                  @change="onStatusChange"
                  :disabled="updatingStatus || (property?.status === 'VENDIDO' && !isAdmin)"
                  class="text-xs font-bold rounded-lg border-gray-300 py-1 px-2 dark:bg-gray-700"
                >
                  <option
                    v-for="s in ['DISPONIBLE', 'RESERVADO', 'EN_NEGOCIACION', 'VENDIDO']"
                    :key="s"
                    :value="s"
                  >
                    {{ t('status.' + s) }}
                  </option>
                </select>
                <span v-else :class="statusTextClass(property?.status)">
                  {{ property?.status ? t('status.' + property.status) : '' }}
                </span>
              </div>
            </template>
          </PropertySummary>

          <div
            class="rounded-xl overflow-hidden bg-gray-200 h-64 flex items-center justify-center border-2 border-dashed"
          >
            <img
              v-if="property?.imageUrls?.length"
              :src="property.imageUrls[0]"
              class="w-full h-full object-cover"
            />
            <IconLucideImage v-else class="w-12 h-12 text-gray-400" />
          </div>
          <PropertyOwnerCard :owner="owner" :loading="loadingOwner" @whatsapp="contactWhatsApp" />
        </div>

        <div v-if="!isClientView" class="space-y-6">
          <PropertyHistoryTimeline :timeline-sections="timelineSections">
            <template #price="{ item }">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400 line-through">
                  {{ item.oldPrice.toLocaleString() }}
                </span>
                <IconLucideArrowRight class="w-3 h-3 mx-2" />
                <span class="text-sm font-bold text-green-600">
                  {{ item.newPrice.toLocaleString() }}
                </span>
                <span class="text-[10px] ml-auto font-mono opacity-60">
                  {{ formatDate(item.changedAt) }}
                </span>
              </div>
            </template>
            <template #assignment="{ item }">
              <p class="text-xs">
                {{ t('propertyDetails.previousAgent') }}
                <span class="font-bold text-blue-600">{{ item.agentId }}</span>
              </p>
              <div class="flex justify-between mt-2 pt-2 border-t text-[10px] opacity-60">
                <span>{{ t('propertyDetails.assignedBy') }} {{ item.assignedBy }}</span>
                <span>{{ formatDate(item.assignedAt) }}</span>
              </div>
            </template>
            <template #status="{ item }">
              <div class="flex justify-between items-center text-[10px]">
                <span class="font-bold opacity-50">{{ t('status.' + item.oldStatus) }}</span>
                <IconLucideArrowRight class="w-2 h-2 mx-1" />
                <span class="font-bold" :class="statusTextClass(item.newStatus)">
                  {{ t('status.' + item.newStatus) }}
                </span>
                <span class="ml-auto opacity-60">{{ formatDate(item.changedAt) }}</span>
              </div>
            </template>
          </PropertyHistoryTimeline>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <fwb-button
          v-if="isClientView && property?.status === 'DISPONIBLE'"
          color="blue"
          @click="$emit('schedule-visit')"
          class="inline-flex items-center gap-2"
        >
          <IconLucideCalendar class="w-4 h-4" />
          <span>{{ t('clientProperties.scheduleVisit') }}</span>
        </fwb-button>
        <fwb-button color="alternative" @click="$emit('close')">
          {{ t('propertyDetails.close') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbModal, FwbBadge, FwbButton } from 'flowbite-vue';
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideArrowRight from '~icons/lucide/arrow-right';
  import IconLucideCalendar from '~icons/lucide/calendar';

  import { usePropertyDetails } from '../composables/usePropertyDetails';
  import PropertyOwnerCard from './PropertyOwnerCard.vue';
  import PropertyHistoryTimeline from './PropertyHistoryTimeline.vue';
  import PropertySummary from './PropertySummary.vue';
  import { getLocaleString } from '@/core/locales/i18n';
  import type { Property } from '../types/property';

  const { t } = useI18n();
  const props = defineProps<{
    show: boolean;
    property: Property | null;
    isClientView?: boolean;
  }>();
  const emit = defineEmits(['close', 'status-updated', 'schedule-visit']);

  const {
    localStatus,
    updatingStatus,
    owner,
    loadingOwner,
    isAdmin,
    updateStatus,
    contactWhatsApp,
  } = usePropertyDetails(props.property);

  const timelineSections = computed(() => [
    {
      title: 'propertyDetails.priceEvolution',
      emptyText: 'propertyDetails.noPriceChanges',
      data: props.property?.priceHistory || [],
      borderColor: 'border-yellow-400',
      dotColor: 'bg-yellow-400',
      slotName: 'price',
    },
    {
      title: 'propertyDetails.assignmentHistory',
      emptyText: 'propertyDetails.noAssignmentChanges',
      data: props.property?.assignmentHistory || [],
      borderColor: 'border-blue-500',
      dotColor: 'bg-blue-500',
      slotName: 'assignment',
    },
    {
      title: 'propertyDetails.statusHistory',
      emptyText: 'propertyDetails.noStatusChanges',
      data: [...(props.property?.statusHistory || [])].reverse(),
      borderColor: 'border-red-500',
      dotColor: 'bg-red-500',
      slotName: 'status',
    },
  ]);

  const onStatusChange = async () => {
    if (await updateStatus(localStatus.value)) emit('status-updated');
  };
  const getStatusColor = (s: string): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
    const map: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray'> = {
      DISPONIBLE: 'green',
      RESERVADO: 'yellow',
      VENDIDO: 'red',
      EN_NEGOCIACION: 'blue',
    };
    return map[s] || 'gray';
  };
  const statusTextClass = (s?: string) =>
    ({
      DISPONIBLE: 'text-green-600',
      RESERVADO: 'text-yellow-600',
      VENDIDO: 'text-red-600',
      EN_NEGOCIACION: 'text-blue-600',
    })[s || ''] || '';
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(getLocaleString(), {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
</script>
