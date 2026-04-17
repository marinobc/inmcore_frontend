import { ref, computed } from 'vue';
import { getCalendar } from '../services/calendarService';
import { getPendingRequestsForAgent } from '../services/visitRequestService';
import type { CalendarResponse, VisitRequestResponse } from '../types/visitCalendar';
import { useAuthStore } from '@/modules/auth';
import { handleApiError } from '@/core/api/errorHandler';

export function useCalendar() {
  const authStore = useAuthStore();
  const myAgentId = computed(() => (authStore.user?.sub || authStore.user?.userId || '') as string);
  const myAgentName = computed(
    () => (authStore.user?.fullName || authStore.user?.name || '') as string
  );

  const loading = ref(false);
  const error = ref('');
  const calendarData = ref<CalendarResponse | null>(null);
  const pendingRequests = ref<VisitRequestResponse[]>([]);
  const currentWeekStart = ref(getMonday(new Date()));

  function getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const m = new Date(d);
    m.setDate(d.getDate() + diff);
    m.setHours(0, 0, 0, 0);
    return m;
  }

  const weekDays = computed(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart.value);
      d.setDate(currentWeekStart.value.getDate() + i);
      return d;
    })
  );

  async function loadCalendar(filters: { agentId?: string; propertyId?: string } = {}) {
    loading.value = true;
    error.value = '';
    try {
      const from = weekDays.value[0].toISOString();
      const to = new Date(weekDays.value[6]).toISOString().split('T')[0] + 'T23:59:59.999Z';
      calendarData.value = await getCalendar(
        from,
        to,
        myAgentId.value,
        filters.agentId,
        filters.propertyId
      );
    } catch (e) {
      error.value = handleApiError(e).message;
    } finally {
      loading.value = false;
    }
  }

  async function loadPendingRequests() {
    if (!myAgentId.value) return;
    try {
      const requests = await getPendingRequestsForAgent(myAgentId.value);
      pendingRequests.value = requests.filter((r) => r.status === 'PENDING');
    } catch (e) {
      console.error(handleApiError(e).message);
    }
  }

  const teamEvents = computed(
    () => (calendarData.value?.totalEvents ?? 0) - (calendarData.value?.myEvents ?? 0)
  );
  const uniqueProperties = computed(
    () => new Set(calendarData.value?.events.map((e) => e.propertyId)).size
  );

  return {
    myAgentId,
    loading,
    error,
    calendarData,
    pendingRequests,
    currentWeekStart,
    weekDays,
    loadCalendar,
    loadPendingRequests,
    teamEvents,
    uniqueProperties,
    myAgentName,
    goToday: () => {
      currentWeekStart.value = getMonday(new Date());
    },
    prevWeek: () => {
      currentWeekStart.value = new Date(
        currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7)
      );
    },
    nextWeek: () => {
      currentWeekStart.value = new Date(
        currentWeekStart.value.setDate(currentWeekStart.value.getDate() + 7)
      );
    },
  };
}
