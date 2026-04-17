<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div class="max-w-2xl mx-auto flex items-center gap-4">
        <router-link
          to="/calendar"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <IconLucideArrowLeft class="h-5 w-5" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('scheduleVisit.title') }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('scheduleVisit.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-2xl border p-6 shadow-sm">
        <form @submit.prevent="onFormSubmit" class="space-y-5">
          <PropertySelector
            v-model="propertyId"
            :error="errors.propertyId"
            @change="onPropertySelect"
          />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            class="flex items-center gap-2 text-sm text-green-700 bg-green-50 border p-3 rounded-lg"
          >
            <IconLucideCircleCheck class="h-4 w-4" />
            {{ t('scheduleVisit.available') }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('scheduleVisit.notes') }}
            </label>
            <fwb-textarea
              v-model="notes"
              :rows="2"
              :placeholder="t('scheduleVisit.notesPlaceholder')"
            />
            <p v-if="errors.notes" class="mt-1 text-xs text-red-600 dark:text-red-500 font-medium">
              {{ errors.notes }}
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <router-link
              to="/calendar"
              class="flex-1 text-center py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300"
            >
              {{ t('common.cancel') }}
            </router-link>
            <fwb-button
              type="submit"
              gradient="blue"
              class="flex-1"
              :disabled="submitting || conflictResult?.hasConflict || !propertyId"
            >
              {{ submitting ? t('common.saving') : t('scheduleVisit.submit') }}
            </fwb-button>
          </div>
        </form>
      </div>

      <!-- Agenda section -->
      <div
        v-if="dayAgenda.length > 0"
        class="bg-white dark:bg-gray-800 rounded-2xl border p-6 shadow-sm"
      >
        <h2
          class="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"
        >
          <IconLucideCalendar class="w-4 h-4" />
          {{ t('scheduleVisit.dayAgenda') }}
        </h2>
        <div class="space-y-3">
          <div
            v-for="ev in dayAgenda"
            :key="ev.id"
            class="flex items-center gap-3 p-3 rounded-xl border"
            :class="{ 'bg-blue-50/50 border-blue-100': ev.ownEvent }"
          >
            <div class="text-center min-w-[50px]">
              <p class="text-xs font-bold">
                {{ formatShortTime(ev.startTime) }}
              </p>
              <p class="text-[9px] text-gray-400 uppercase">
                {{ t('scheduleVisit.start') }}
              </p>
            </div>
            <div class="h-8 w-px bg-gray-200"></div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate">
                {{ ev.propertyName }}
              </p>
              <p class="text-[10px] text-gray-500">
                {{ ev.ownEvent ? t('scheduleVisit.youAreResponsible') : ev.agentName }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton, FwbTextarea } from 'flowbite-vue';
  import IconLucideArrowLeft from '~icons/lucide/arrow-left';
  import IconLucideLoader from '~icons/lucide/loader';
  import IconLucideCircleCheck from '~icons/lucide/circle-check';
  import IconLucideCalendar from '~icons/lucide/calendar';

  import { useScheduleVisit } from '../composables/useScheduleVisit';
  import { createVisit } from '../services/calendarService';
  import { useToast } from '@/shared/composables/useToast';
  import { handleApiError } from '@/core/api/errorHandler';
  import { getLocaleString } from '@/core/locales/i18n';
  import type { Property } from '@/modules/properties/types/property';

  import PropertySelector from '../components/PropertySelector.vue';
  import FormField from '@/shared/components/common/FormField.vue';
  import ConflictAlert from '../components/ConflictAlert.vue';

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
    dayAgenda,
    errors,
    setValues,
    handleSubmit,
    loadAgenda,
    validateConflict,
  } = useScheduleVisit();

  const startTimeLocal = ref('');
  const endTimeLocal = ref('');
  const submitting = ref(false);

  watch(startTimeLocal, (v) => {
    startTime.value = v ? new Date(v).toISOString() : '';
    if (v) loadAgenda(v);
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

  const formatShortTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(getLocaleString(), {
      hour: '2-digit',
      minute: '2-digit',
    });

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
        loadAgenda(values.startTime);
        reset();
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

  function reset() {
    setValues({ propertyId: '', startTime: '', endTime: '', notes: '' });
    startTimeLocal.value = '';
    endTimeLocal.value = '';
    propertyInfo.value = null;
  }
</script>
