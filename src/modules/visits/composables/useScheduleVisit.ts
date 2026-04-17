import { ref, computed } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { visitSchema, type VisitFormValues } from '../schemas/visitSchema';
import { checkConflict, getDayAgenda } from '../services/calendarService';
import { useAuthStore } from '@/modules/auth';
import { useToast } from '@/shared/composables/useToast';
import { handleApiError } from '@/core/api/errorHandler';
import type { ConflictResponse, CalendarEventResponse } from '../types/visitCalendar';
import type { Property } from '@/modules/properties/types/property';

import i18n from '@/core/locales/i18n';

export function useScheduleVisit() {
  const authStore = useAuthStore();
  const toast = useToast();
  const { t } = i18n.global;
  const myAgentId = computed(() => (authStore.user?.sub || authStore.user?.userId || '') as string);
  const myAgentName = computed(
    () => authStore.user?.fullName || authStore.user?.name || t('common.agent')
  );

  const { defineField, handleSubmit, errors, setValues, values } = useForm<VisitFormValues>({
    validationSchema: toTypedSchema(visitSchema),
  });

  const [propertyId] = defineField('propertyId');
  const [startTime] = defineField('startTime');
  const [endTime] = defineField('endTime');
  const [notes] = defineField('notes');

  const propertyInfo = ref<Property | null>(null);
  const conflictResult = ref<ConflictResponse | null>(null);
  const checkingConflict = ref(false);
  const dayAgenda = ref<CalendarEventResponse[]>([]);

  async function loadAgenda(date: string) {
    if (!myAgentId.value) return;
    dayAgenda.value = await getDayAgenda(myAgentId.value, date);
  }

  async function validateConflict() {
    if (!propertyId.value || !startTime.value || !endTime.value) return;

    // Local validation check: Start must be before end
    if (new Date(startTime.value) >= new Date(endTime.value)) {
      conflictResult.value = null;
      return;
    }

    checkingConflict.value = true;
    try {
      conflictResult.value = await checkConflict(propertyId.value, startTime.value, endTime.value);
    } catch (e: unknown) {
      // If it's a validation error (like start > end), we clear the previous result
      conflictResult.value = null;
      toast.error(handleApiError(e).message);
    } finally {
      checkingConflict.value = false;
    }
  }

  return {
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
    values,
    handleSubmit,
    loadAgenda,
    validateConflict,
  };
}
