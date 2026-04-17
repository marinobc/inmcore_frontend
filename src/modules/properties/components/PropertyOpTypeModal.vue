<template>
  <fwb-modal v-if="property" @close="$emit('close')">
    <template #header>
      <div class="text-lg font-bold">
        {{ t('adminProperties.changeOperation') }}
      </div>
    </template>
    <template #body>
      <select
        v-model="opType"
        class="w-full border border-gray-300 rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
      >
        <option value="VENTA">{{ t('propertyOperations.VENTA') }}</option>
        <option value="ALQUILER">{{ t('propertyOperations.ALQUILER') }}</option>
        <option value="ANTICRETICO">
          {{ t('propertyOperations.ANTICRETICO') }}
        </option>
      </select>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <fwb-button color="alternative" @click="$emit('close')">
          {{ t('common.cancel') }}
        </fwb-button>
        <fwb-button @click="save" gradient="blue" :disabled="loading">
          {{ t('common.save') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbModal, FwbButton } from 'flowbite-vue';
  import { propertyService } from '../services/propertyService';
  import { useToast } from '@/shared/composables/useToast';
  import type { Property, OperationType } from '../types/property';

  const { t } = useI18n();
  const toast = useToast();
  const props = defineProps<{ property: Property | null }>();
  const emit = defineEmits(['close', 'updated']);

  const opType = ref<OperationType>('VENTA');
  const loading = ref(false);

  watch(
    () => props.property,
    (p) => {
      if (p) opType.value = p.operationType;
    },
    { immediate: true }
  );

  async function save() {
    if (!props.property) return;
    loading.value = true;
    try {
      await propertyService.updateProperty(props.property.id, {
        operationType: opType.value,
      });
      toast.success(t('adminProperties.propertyUpdated'));
      emit('updated');
      emit('close');
    } catch {
      toast.error(t('common.error'));
    } finally {
      loading.value = false;
    }
  }
</script>
