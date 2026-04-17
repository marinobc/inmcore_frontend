<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="2xl">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
          <IconLucidePlus class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-xl font-bold dark:text-white">{{ t('scheduleVisit.title') }}</h3>
          <p class="text-xs text-gray-500">{{ t('scheduleVisit.subtitle') }}</p>
        </div>
      </div>
    </template>
    <template #body>
      <form @submit.prevent="onFormSubmit" class="space-y-6">
        <PropertySelector
          v-model="propertyId"
          :error="errors.propertyId"
          @change="onPropertySelect"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            v-model="startTimeLocal"
            type="datetime-local"
            :label="t('scheduleVisit.startTime')"
            :error="errors.startTime"
            @change="validateConflict"
            required
          />
          <FormField
            v-model="endTimeLocal"
            type="datetime-local"
            :label="t('scheduleVisit.endTime')"
            :error="errors.endTime"
            @change="validateConflict"
            required
          />
        </div>

        <div v-if="checkingConflict" class="flex items-center gap-2 text-sm text-gray-500">
          <IconLucideLoader class="animate-spin h-4 w-4 text-blue-500" />
          {{ t('scheduleVisit.checkingAvailability') }}
        </div>

        <ConflictAlert
          v-if="conflictResult"
          :conflict="conflictResult"
          show-use-suggestion
          @use-suggestion="applySuggestion"
        />

        <div
          v-if="conflictResult && !conflictResult.hasConflict"
          class="flex items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-3 rounded-xl"
        >
          <IconLucideCircleCheck class="h-4 w-4" />
          {{ t('scheduleVisit.available') }}
        </div>

        <div>
          <label class="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
            {{ t('scheduleVisit.notes') }}
          </label>
          <fwb-textarea
            v-model="notes"
            :rows="3"
            class="rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
            :placeholder="t('scheduleVisit.notesPlaceholder')"
          />
          <p v-if="errors.notes" class="mt-1 text-xs text-red-600 dark:text-red-500 font-medium">
            {{ errors.notes }}
          </p>
        </div>
      </form>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <fwb-button color="alternative" @click="$emit('close')" class="rounded-xl">
          {{ t('common.cancel') }}
        </fwb-button>
        <fwb-button
          @click="onFormSubmit"
          color="blue"
          class="rounded-xl px-8"
          :disabled="submitting || conflictResult?.hasConflict || !propertyId"
        >
          {{ submitting ? t('common.saving') : t('scheduleVisit.submit') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton, FwbModal, FwbTextarea } from 'flowbite-vue';
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucideLoader from '~icons/lucide/loader';
  import IconLucideCircleCheck from '~icons/lucide/circle-check';

  import { useScheduleVisit } from '../composables/useScheduleVisit';
  import { createVisit } from '../services/calendarService';
  import { useToast } from '@/shared/composables/useToast';
  import { handleApiError } from '@/core/api/errorHandler';
  import type { Property } from '@/modules/properties/types/property';

  import PropertySelector from './PropertySelector.vue';
  import FormField from '@/shared/components/common/FormField.vue';
  import ConflictAlert from './ConflictAlert.vue';

  defineProps<{
    show: boolean;
  }>();

  const emit = defineEmits(['close', 'success']);

  const { t } = useI18n();
  const toast = useToast();
  const {
    myAgentId,
    myAgentName,
    propertyId,
    startTime,
    endTime,
    notes,
    propertyInfo,
    conflictResult,
    checkingConflict,
    errors,
    handleSubmit,
    validateConflict,
  } = useScheduleVisit();

  const startTimeLocal = ref('');
  const endTimeLocal = ref('');
  const submitting = ref(false);

  watch(startTimeLocal, (v) => {
    startTime.value = v ? new Date(v).toISOString() : '';
  });
  watch(endTimeLocal, (v) => (endTime.value = v ? new Date(v).toISOString() : ''));

  const onPropertySelect = (p: Property) => {
    propertyInfo.value = p;
    validateConflict();
  };

  const applySuggestion = (start?: string, end?: string) => {
    if (start) startTimeLocal.value = new Date(start).toISOString().slice(0, 16);
    if (end) endTimeLocal.value = new Date(end).toISOString().slice(0, 16);
    validateConflict();
  };

  const onFormSubmit = handleSubmit(
    async (values) => {
      submitting.value = true;
      try {
        await createVisit(
          {
            ...values,
            agentId: myAgentId.value,
            agentName: myAgentName.value,
            propertyName: propertyInfo.value?.title || '',
            propertyAddress: propertyInfo.value?.address || '',
          },
          myAgentId.value
        );
        toast.success(t('scheduleVisit.successMessage'));
        emit('success');
        emit('close');
      } catch (e: unknown) {
        toast.error(handleApiError(e).message);
      } finally {
        submitting.value = false;
      }
    },
    (ctx) => {
      console.log('Validation errors:', ctx.errors);
      toast.error(t('common.validationError'));
    }
  );
</script>
