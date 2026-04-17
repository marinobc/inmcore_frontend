<template>
  <div class="space-y-4 border-t pt-4">
    <h3 class="text-md font-semibold dark:text-white">{{ t('userForm.fiscalInfo') }}</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        v-model="taxId"
        :label="t('users.table.ciNit')"
        :error="errors.taxId"
        :modified="isModified('taxId')"
        required
      >
        <template #footer>
          <p class="text-[10px] text-gray-400 mt-1">{{ t('userForm.fiscalHelp') }}</p>
        </template>
      </FormField>
      <FormField
        v-model="address"
        :label="t('users.form.address')"
        :error="errors.address"
        :modified="isModified('address')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import FormField from '@/shared/components/common/FormField.vue';

  const { t } = useI18n();

  const taxId = defineModel<string>('taxId');
  const address = defineModel<string>('address');

  defineProps<{
    errors: Record<string, string | undefined>;
    isModified: (field: string) => boolean;
  }>();
</script>
