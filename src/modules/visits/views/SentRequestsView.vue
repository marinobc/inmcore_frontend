<template>
  <div>
    <PageHeader
      :title="t('sentRequests.title')"
      :subtitle="t('sentRequests.subtitle')"
      back-to="/dashboard"
    >
      <template #actions>
        <fwb-button
          @click="load"
          :disabled="loading"
          color="alternative"
          class="inline-flex items-center gap-2 rounded-xl shadow-sm"
        >
          <IconLucideRefreshCw class="w-4 h-4" :class="loading ? 'animate-spin' : ''" />
          <span>{{ t('common.refresh') }}</span>
        </fwb-button>
      </template>
    </PageHeader>

    <PageContainer class="space-y-8">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="s in statCards"
          :key="s.label"
          class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 text-center shadow-sm"
          :class="s.bg"
        >
          <p class="text-3xl font-extrabold" :class="s.text">{{ s.value }}</p>
          <p
            class="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mt-2"
          >
            {{ t(s.label) }}
          </p>
        </div>
      </div>

      <!-- Table Section -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <DataTable :columns="columns" :items="sentRequests" :loading="loading" has-actions>
          <template #col-status="{ value }">
            <fwb-badge :type="statusBadgeType(value as any)">
              {{ t('status.' + String(value).toLowerCase()) }}
            </fwb-badge>
          </template>
          <template #col-requestedAt="{ value }">{{ formatDate(String(value)) }}</template>
          <template #actions="{ item }">
            <fwb-button
              v-if="item.status === 'PENDING'"
              @click="prepCancel(item)"
              color="red"
              size="xs"
              class="rounded-lg"
            >
              {{ t('sentRequests.cancelRequest') }}
            </fwb-button>
          </template>
        </DataTable>
      </div>
    </PageContainer>

    <ConfirmModal
      v-model="showCancelModal"
      :title="t('sentRequests.cancelModalTitle')"
      :message="t('sentRequests.cancelModalText')"
      confirm-color="red"
      @confirm="doCancel"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton, FwbBadge } from 'flowbite-vue';
  import IconLucideRefreshCw from '~icons/lucide/refresh-cw';

  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';
  import { reassignmentService } from '../services/reassignmentService';
  import { useToast } from '@/shared/composables/useToast';
  import { getLocaleString } from '@/core/locales/i18n';
  import DataTable, { type TableColumn } from '@/shared/components/ui/DataTable.vue';
  import ConfirmModal from '@/shared/components/ui/ConfirmModal.vue';
  import type { ReassignmentSolicitation } from '../types/reassignment';

  const { t } = useI18n();
  const toast = useToast();

  const sentRequests = ref<ReassignmentSolicitation[]>([]);
  const loading = ref(false);
  const showCancelModal = ref(false);
  const requestToCancel = ref<ReassignmentSolicitation | null>(null);

  const columns: TableColumn[] = [
    { key: 'destinationAgentId', label: t('sentRequests.to') },
    { key: 'visitId', label: t('reassignment.visitIdLabel') },
    { key: 'reason', label: t('sentRequests.reasonTitle') },
    { key: 'status', label: t('users.table.status') },
    { key: 'requestedAt', label: t('sentRequests.sentOn') },
  ];

  const stats = computed(() => ({
    total: sentRequests.value.length,
    pending: sentRequests.value.filter((r) => r.status === 'PENDING').length,
    accepted: sentRequests.value.filter((r) => r.status === 'ACCEPTED').length,
  }));

  const statCards = computed(() => [
    {
      label: 'sentRequests.totalSent',
      value: stats.value.total,
      text: 'text-gray-900 dark:text-white',
      bg: 'bg-white',
    },
    {
      label: 'sentRequests.pending',
      value: stats.value.pending,
      text: 'text-yellow-700',
      bg: 'bg-yellow-50',
    },
    {
      label: 'sentRequests.accepted',
      value: stats.value.accepted,
      text: 'text-green-700',
      bg: 'bg-green-50',
    },
  ]);

  async function load() {
    loading.value = true;
    try {
      sentRequests.value = await reassignmentService.getSentRequests();
    } catch {
      toast.error(t('sentRequests.loadError'));
    } finally {
      loading.value = false;
    }
  }

  const prepCancel = (r: ReassignmentSolicitation) => {
    requestToCancel.value = r;
    showCancelModal.value = true;
  };
  async function doCancel() {
    if (!requestToCancel.value) return;
    try {
      await reassignmentService.cancelRequest(requestToCancel.value.id);
      toast.success(t('sentRequests.cancelledSuccess'));
      showCancelModal.value = false;
      load();
    } catch {
      toast.error(t('sentRequests.cancelledError'));
    }
  }

  const statusBadgeType = (
    s: ReassignmentSolicitation['status']
  ): 'yellow' | 'green' | 'red' | 'default' => {
    const map: Record<string, 'yellow' | 'green' | 'red'> = {
      PENDING: 'yellow',
      ACCEPTED: 'green',
      REJECTED: 'red',
    };
    return map[s] || 'default';
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString(getLocaleString(), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  let interval: ReturnType<typeof setInterval> | undefined;
  onMounted(() => {
    load();
    interval = setInterval(load, 30000);
  });
  onUnmounted(() => {
    if (interval) clearInterval(interval);
  });
</script>
