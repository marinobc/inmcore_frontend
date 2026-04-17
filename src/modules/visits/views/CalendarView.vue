<template>
  <div>
    <PageHeader :title="t('calendar.title')" :subtitle="t('calendar.subtitle', { weekLabel })">
      <template #actions>
        <fwb-button
          @click="showAgendaModal = true"
          color="alternative"
          class="inline-flex items-center gap-2 rounded-xl"
        >
          <IconLucideCalendar class="h-4 w-4" />
          <span>{{ t('scheduleVisit.dayAgenda') }}</span>
        </fwb-button>
        <fwb-button
          @click="showScheduleModal = true"
          color="blue"
          class="inline-flex items-center gap-2 rounded-xl"
        >
          <IconLucidePlus class="h-4 w-4" />
          <span>{{ t('calendar.scheduleVisit') }}</span>
        </fwb-button>
      </template>
    </PageHeader>

    <PageContainer class="space-y-6">
      <!-- Pending Requests -->
      <PendingRequestsAlert
        :requests="pendingRequests"
        @refresh="loadPendingRequests"
        @accept="handleAcceptRequest"
        @reject="handleRejectRequest"
      />

      <!-- Filters -->
      <CalendarFilters
        v-model:propertyId="filterPropertyId"
        v-model:agentId="filterAgentId"
        @change="loadCalendar({ propertyId: filterPropertyId, agentId: filterAgentId })"
      />

      <!-- Navigation Bar -->
      <CalendarNavigation :label="weekLabel" @prev="prevWeek" @next="nextWeek" @today="goToday" />

      <!-- Stats -->
      <CalendarStats v-if="calendarData" :stats="stats" />

      <!-- Main Grid -->
      <div v-if="loading" class="flex justify-center py-20">
        <IconLucideLoader class="animate-spin h-10 w-10 text-blue-600" />
      </div>
      <CalendarGrid
        v-else
        :days="weekDays"
        :events="calendarData?.events || []"
        @select="onSelectEvent"
      />

      <fwb-alert v-if="error" type="danger" class="rounded-xl">{{ error }}</fwb-alert>
    </PageContainer>

    <!-- Modals -->
    <ScheduleVisitModal
      v-if="showScheduleModal"
      :show="showScheduleModal"
      @close="showScheduleModal = false"
      @success="loadCalendar({ propertyId: filterPropertyId, agentId: filterAgentId })"
    />

    <AgentAgendaModal
      v-if="showAgendaModal"
      :show="showAgendaModal"
      :agenda="calendarData?.events || []"
      :agent-name="myAgentName"
      :date="new Date().toISOString()"
      @close="showAgendaModal = false"
    />

    <!-- Event Detail Modal -->
    <CalendarEventModal
      :event="selectedEvent"
      @close="selectedEvent = null"
      @cancel="onCancelRequest"
      @reassigned="loadCalendar({ propertyId: filterPropertyId, agentId: filterAgentId })"
    />

    <!-- Generic Confirm Modal for Cancellation -->
    <ConfirmModal
      v-model="showCancelConfirm"
      :title="t('calendar.confirmCancelTitle')"
      :message="t('calendar.confirmCancelText')"
      confirm-color="red"
      :confirm-text="t('calendar.yesCancel')"
      @confirm="executeCancel"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton, FwbAlert } from 'flowbite-vue';
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucideLoader from '~icons/lucide/loader';
  import IconLucideCalendar from '~icons/lucide/calendar';

  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';

  import { useCalendar } from '../composables/useCalendar';
  import { cancelVisit } from '../services/calendarService';
  import { acceptVisitRequest, rejectVisitRequest } from '../services/visitRequestService';
  import { getLocaleString } from '@/core/locales/i18n';
  import { useToast } from '@/shared/composables/useToast';
  import type { CalendarEventResponse } from '@/modules/visits/types/visitCalendar';

  import PendingRequestsAlert from '../components/PendingRequestsAlert.vue';
  import CalendarFilters from '../components/CalendarFilters.vue';
  import CalendarNavigation from '../components/CalendarNavigation.vue';
  import CalendarStats from '../components/CalendarStats.vue';
  import CalendarGrid from '../components/CalendarGrid.vue';
  import CalendarEventModal from '../components/CalendarEventModal.vue';
  import ConfirmModal from '@/shared/components/ui/ConfirmModal.vue';
  import ScheduleVisitModal from '../components/ScheduleVisitModal.vue';
  import AgentAgendaModal from '../components/AgentAgendaModal.vue';

  const { t } = useI18n();
  const toast = useToast();
  const {
    myAgentId,
    myAgentName,
    loading,
    error,
    calendarData,
    pendingRequests,
    weekDays,
    loadCalendar,
    loadPendingRequests,
    teamEvents,
    uniqueProperties,
    goToday,
    prevWeek,
    nextWeek,
  } = useCalendar();

  const filterPropertyId = ref('');
  const filterAgentId = ref('');
  const selectedEvent = ref<CalendarEventResponse | null>(null);
  const showCancelConfirm = ref(false);
  const showScheduleModal = ref(false);
  const showAgendaModal = ref(false);
  const eventToCancel = ref<CalendarEventResponse | null>(null);

  const weekLabel = computed(() => {
    const from = weekDays.value[0],
      to = weekDays.value[6];
    const separator = t('calendar.to');
    return `${from.getDate()} ${from.toLocaleString(getLocaleString(), { month: 'short' })} ${separator} ${to.getDate()} ${to.toLocaleString(getLocaleString(), { month: 'short', year: 'numeric' })}`;
  });

  const stats = computed(() => [
    {
      label: 'calendar.totalAppointments',
      value: calendarData.value?.totalEvents || 0,
      class: 'text-gray-900 dark:text-white',
    },
    {
      label: 'calendar.myVisits',
      value: calendarData.value?.myEvents || 0,
      class: 'text-blue-700 dark:text-blue-400',
    },
    {
      label: 'calendar.team',
      value: teamEvents.value,
      class: 'text-gray-900 dark:text-white',
    },
    {
      label: 'calendar.properties',
      value: uniqueProperties.value,
      class: 'text-gray-900 dark:text-white',
    },
  ]);

  const onSelectEvent = (ev: CalendarEventResponse) => (selectedEvent.value = ev);
  const onCancelRequest = (ev: CalendarEventResponse) => {
    eventToCancel.value = ev;
    showCancelConfirm.value = true;
  };

  async function executeCancel() {
    try {
      if (eventToCancel.value) {
        await cancelVisit(eventToCancel.value.id, myAgentId.value);
        toast.success(t('agentDashboard.propertyUpdated'));
        showCancelConfirm.value = false;
        selectedEvent.value = null;
        loadCalendar({
          propertyId: filterPropertyId.value,
          agentId: filterAgentId.value,
        });
      }
    } catch {
      toast.error(t('calendar.loadError'));
    }
  }

  async function handleAcceptRequest(id: string) {
    try {
      await acceptVisitRequest(id, myAgentId.value);
      toast.success(t('status.accepted'));
      loadPendingRequests();
      loadCalendar({
        propertyId: filterPropertyId.value,
        agentId: filterAgentId.value,
      });
    } catch {
      toast.error(t('calendar.loadError'));
    }
  }

  async function handleRejectRequest(id: string) {
    try {
      await rejectVisitRequest(id, myAgentId.value);
      toast.success(t('status.rejected'));
      loadPendingRequests();
    } catch {
      toast.error(t('calendar.loadError'));
    }
  }

  let interval: ReturnType<typeof setInterval>;
  onMounted(() => {
    loadCalendar();
    loadPendingRequests();
    interval = setInterval(loadPendingRequests, 30000);
  });
  onUnmounted(() => clearInterval(interval));
</script>
