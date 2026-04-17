<template>
  <fwb-modal v-if="property" @close="$emit('close')">
    <template #header>
      <div class="text-lg font-bold">
        {{ t('adminProperties.assignOwner') }}
      </div>
    </template>
    <template #body>
      <select
        v-model="ownerId"
        class="w-full border border-gray-300 rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
      >
        <option value="">{{ t('adminProperties.selectOwner') }}</option>
        <option v-for="o in owners" :key="o.id" :value="o.id">
          {{ o.fullName }} ({{ o.email }})
        </option>
      </select>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <fwb-button color="alternative" @click="$emit('close')">
          {{ t('common.cancel') }}
        </fwb-button>
        <fwb-button @click="save" gradient="blue" :disabled="loading">
          {{ t('adminProperties.assign') }}
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
  import type { Property } from '../types/property';
  import type { User } from '@/modules/users/types/user';

  const { t } = useI18n();
  const toast = useToast();
  const props = defineProps<{ property: Property | null; owners: User[] }>();
  const emit = defineEmits(['close', 'updated']);

  const ownerId = ref('');
  const loading = ref(false);

  watch(
    () => props.property,
    (p) => {
      if (p) ownerId.value = p.ownerId || '';
    },
    { immediate: true }
  );

  async function save() {
    if (!ownerId.value || !props.property) return;
    loading.value = true;
    try {
      await propertyService.assignOwner(props.property.id, {
        ownerId: ownerId.value,
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
