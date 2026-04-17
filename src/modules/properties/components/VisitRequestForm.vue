<template>
  <div class="space-y-4 p-3">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        v-model="clientName"
        :label="t('clientProperties.form.name')"
        :error="errors.clientName"
        required
      />
      <FormField
        v-model="clientEmail"
        :label="t('clientProperties.form.email')"
        :error="errors.clientEmail"
        required
      />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        v-model="clientPhone"
        :label="t('clientProperties.form.phone')"
        :error="errors.clientPhone"
      />
      <FormField
        v-model="preferredDateTime"
        type="datetime-local"
        :label="t('clientProperties.form.preferredSchedule')"
        :error="errors.preferredDateTime"
        required
      />
    </div>
    <FormField
      v-model="alternativeDateTime"
      type="datetime-local"
      :label="t('clientProperties.form.alternativeSchedule')"
      :error="errors.alternativeDateTime"
    />
    <div>
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ t('clientProperties.form.message') }}
      </label>
      <fwb-textarea
        v-model="message"
        :rows="3"
        :placeholder="t('clientProperties.placeholder.message')"
      />
      <p v-if="errors.message" class="mt-1 text-xs text-red-600 dark:text-red-500 font-medium">
        {{ errors.message }}
      </p>
    </div>
    <p class="text-[10px] text-gray-400 italic">
      {{ t('clientProperties.submitNote', { agent: agentName }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import { useI18n } from 'vue-i18n';
  import { FwbTextarea } from 'flowbite-vue';
  import FormField from '@/shared/components/common/FormField.vue';
  import {
    visitRequestSchema,
    type VisitRequestFormValues,
  } from '@/modules/visits/schemas/visitSchema';

  const { t } = useI18n();
  const props = defineProps<{
    initialValues: Partial<VisitRequestFormValues>;
    agentName: string;
  }>();

  const { defineField, handleSubmit, errors } = useForm({
    validationSchema: toTypedSchema(visitRequestSchema),
    initialValues: props.initialValues,
  });

  const [clientName] = defineField('clientName');
  const [clientEmail] = defineField('clientEmail');
  const [clientPhone] = defineField('clientPhone');
  const [preferredDateTime] = defineField('preferredDateTime');
  const [alternativeDateTime] = defineField('alternativeDateTime');
  const [message] = defineField('message');

  defineExpose({ submit: handleSubmit((vals) => vals) });
</script>
