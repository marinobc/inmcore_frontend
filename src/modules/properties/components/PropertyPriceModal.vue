<template>
  <fwb-modal v-if="property" @close="$emit('close')">
    <template #header>
      <div class="text-lg font-bold">
        {{ t('adminProperties.modifyPrice') }}
      </div>
    </template>
    <template #body>
      <FormField
        v-model.number="price"
        type="number"
        :label="t('adminProperties.price') + ' ($)'"
        required
      />
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <fwb-button color="alternative" @click="$emit('close')">
          {{ t('common.cancel') }}
        </fwb-button>
        <fwb-button @click="save" gradient="blue" :disabled="loading">
          {{ t('adminProperties.confirm') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbModal, FwbButton } from 'flowbite-vue';
  import FormField from '@/shared/components/common/FormField.vue';
  import { propertyService } from '../services/propertyService';
  import { useToast } from '@/shared/composables/useToast';
  import type { Property } from '../types/property';

  const { t } = useI18n();
  const toast = useToast();
  const props = defineProps<{ property: Property | null }>();
  const emit = defineEmits(['close', 'updated']);

  const price = ref(0);
  const loading = ref(false);

  watch(
    () => props.property,
    (p) => {
      if (p) price.value = p.price;
    },
    { immediate: true }
  );

  async function save() {
    if (!props.property) return;
    loading.value = true;
    try {
      await propertyService.updatePrice(props.property.id, price.value);
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
