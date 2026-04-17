<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="2xl">
    <template #header>
      <div class="flex items-center space-x-4">
        <h3 class="text-2xl font-bold dark:text-white">
          {{ property?.title }}
        </h3>
        <fwb-badge :type="property?.status === 'DISPONIBLE' ? 'green' : 'red'">
          {{
            property?.status === 'DISPONIBLE'
              ? t('clientPropertyDetails.available')
              : t('clientPropertyDetails.occupied')
          }}
        </fwb-badge>
      </div>
    </template>

    <template #body>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <div class="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-video">
            <img
              v-if="property?.imageUrls && property.imageUrls.length > 0"
              :src="property.imageUrls[0]"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <IconLucideImage class="w-16 h-16" />
            </div>
          </div>

          <div
            v-if="property?.imageUrls && property.imageUrls.length > 1"
            class="flex gap-2 overflow-x-auto"
          >
            <div
              v-for="(img, idx) in property.imageUrls.slice(1, 5)"
              :key="idx"
              class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
              @click="currentImage = img"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h4 class="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">
              {{ t('clientPropertyDetails.technicalSheet') }}
            </h4>
            <div class="grid grid-cols-2 gap-y-3 text-sm">
              <span class="text-gray-500 font-medium">
                {{ t('clientPropertyDetails.location') }}
              </span>
              <span class="dark:text-white text-right">{{ property?.address }}</span>

              <span class="text-gray-500 font-medium">{{ t('clientPropertyDetails.area') }}</span>
              <span class="dark:text-white text-right">
                {{ property?.m2 || property?.area || '—' }}
                {{ t('common.units.m2') }}
              </span>

              <span class="text-gray-500 font-medium">{{ t('clientPropertyDetails.rooms') }}</span>
              <span class="dark:text-white text-right">
                {{ property?.rooms || property?.bedrooms || '—' }}
              </span>

              <span class="text-gray-500 font-medium">{{ t('clientPropertyDetails.type') }}</span>
              <span class="dark:text-white text-right">{{ property?.type || '—' }}</span>

              <span class="text-gray-500 font-medium">
                {{ t('clientPropertyDetails.operation') }}
              </span>
              <span class="dark:text-white text-right font-semibold">
                <span :class="operationTypeColor(property?.operationType)">
                  {{ formatOperationType(property?.operationType) }}
                </span>
              </span>
            </div>
          </div>

          <div
            class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl"
          >
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('clientPropertyDetails.price') }}
            </p>
            <p class="text-3xl font-black text-blue-600 dark:text-blue-400">
              {{ t('common.currency.symbol') }}{{ (property?.price || 0).toLocaleString() }}
            </p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h4 class="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
              {{ t('clientPropertyDetails.responsibleAgent') }}
            </h4>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
              >
                <span class="text-blue-600 dark:text-blue-300 font-bold text-lg">
                  {{ getAgentInitial() }}
                </span>
              </div>
              <div>
                <p class="font-semibold dark:text-white">
                  {{ property?.agentName || t('clientPropertyDetails.agentAssigned') }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ t('clientPropertyDetails.portalContact') }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="property?.description" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h4 class="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
              {{ t('clientPropertyDetails.description') }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ property?.description }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <fwb-button color="alternative" @click="$emit('close')">
          {{ t('clientPropertyDetails.close') }}
        </fwb-button>

        <div class="group relative">
          <fwb-button
            :gradient="property?.status === 'DISPONIBLE' ? 'blue' : null"
            @click="handleScheduleVisit"
            :disabled="property?.status !== 'DISPONIBLE'"
          >
            <IconLucideCalendar class="w-4 h-4 mr-2" />
            {{
              property?.status === 'DISPONIBLE'
                ? t('clientPropertyDetails.scheduleVisit')
                : t('clientPropertyDetails.notAvailable')
            }}
          </fwb-button>

          <span
            v-if="property?.status !== 'DISPONIBLE'"
            class="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg"
          >
            <template v-if="property?.status === 'VENDIDO'">
              {{ t('clientPropertyDetails.soldStatusTooltip') }}
            </template>
            <template v-else-if="property?.status === 'RESERVADO'">
              {{ t('clientPropertyDetails.reservedStatusTooltip') }}
            </template>
            <template v-else>
              {{
                t('clientPropertyDetails.unavailableStatusTooltip', { status: property?.status })
              }}
            </template>
          </span>
        </div>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { FwbModal, FwbBadge, FwbButton } from 'flowbite-vue';
  import type { Property } from '@/modules/properties/types/property';
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideCalendar from '~icons/lucide/calendar';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps<{
    show: boolean;
    property: Property | null;
  }>();

  const emit = defineEmits<{
    close: [];
    'schedule-visit': [propertyId: string | undefined];
  }>();

  const currentImage = ref('');

  const formatOperationType = (type: string | undefined) => {
    if (!type) return t('propertyOperations.VENTA');
    return t(`propertyOperations.${type}`);
  };

  const operationTypeColor = (type: string | undefined) => {
    if (!type) return 'text-gray-600';
    const map: Record<string, string> = {
      VENTA: 'text-indigo-600 dark:text-indigo-400',
      ALQUILER: 'text-green-600 dark:text-green-400',
      ANTICRETICO: 'text-yellow-600 dark:text-yellow-400',
    };
    return map[type] || 'text-gray-600';
  };

  const getAgentInitial = () => {
    const agentName = props.property?.agentName || t('common.advisor');
    return agentName.charAt(0).toUpperCase();
  };

  const handleScheduleVisit = () => {
    emit('schedule-visit', props.property?.id);
    emit('close');
  };
</script>
