<template>
  <div class="space-y-4 border-t pt-4">
    <h3 class="text-md font-semibold dark:text-white">{{ t('userForm.clientPrefs') }}</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormSelect v-model="preferredContactMethod" :label="t('users.form.contactMethod')">
        <option value="EMAIL">{{ t('userForm.email') }}</option>
        <option value="PHONE">{{ t('userForm.phone') }}</option>
        <option value="WHATSAPP">{{ t('userForm.whatsApp') }}</option>
      </FormSelect>

      <FormField
        v-model="budget"
        type="number"
        :label="t('users.view.budget')"
        :error="errors.budget"
      />
      <FormField
        v-model="preferredZone"
        :label="t('users.view.preferredZone')"
        :error="errors.preferredZone"
      />

      <FormSelect v-model="preferredPropertyType" :label="t('users.form.propertyType')">
        <option value="">{{ t('userForm.noPreference') }}</option>
        <option value="APARTMENT">{{ t('propertyType.apartment') }}</option>
        <option value="HOUSE">{{ t('propertyType.house') }}</option>
        <option value="COMMERCIAL">{{ t('propertyType.commercialSpace') }}</option>
      </FormSelect>

      <FormField
        v-model="preferredRooms"
        type="number"
        :label="t('users.view.rooms')"
        :error="errors.preferredRooms"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import FormField from '@/shared/components/common/FormField.vue';
  import FormSelect from '@/shared/components/common/FormSelect.vue';

  const { t } = useI18n();

  const preferredContactMethod = defineModel<string>('preferredContactMethod');
  const budget = defineModel<string | number>('budget');
  const preferredZone = defineModel<string>('preferredZone');
  const preferredPropertyType = defineModel<string>('preferredPropertyType');
  const preferredRooms = defineModel<string | number>('preferredRooms');

  defineProps<{
    errors: Record<string, string | undefined>;
    isModified: (field: string) => boolean;
  }>();
</script>
