<template>
  <div class="space-y-4 border-t pt-4">
    <h3 class="text-md font-semibold dark:text-white">{{ t('userForm.workInfo') }}</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        v-model="department"
        :label="t('users.form.department')"
        :error="errors.department"
        :modified="isModified('department')"
        required
      />
      <FormField
        v-model="position"
        :label="t('users.form.position')"
        :error="errors.position"
        :modified="isModified('position')"
        required
      />
      <FormField
        v-model="hireDate"
        type="date"
        :label="t('users.form.hireDate')"
        :modified="isModified('hireDate')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import FormField from '@/shared/components/common/FormField.vue';

  const { t } = useI18n();

  const department = defineModel<string>('department');
  const position = defineModel<string>('position');
  const hireDate = defineModel<string>('hireDate');

  defineProps<{
    errors: Record<string, string | undefined>;
    isModified: (field: string) => boolean;
  }>();
</script>
