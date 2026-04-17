<template>
  <div>
    <PageHeader :title="t('reassignmentInbox.title')" :subtitle="t('reassignmentInbox.subtitle')">
      <template #actions>
        <fwb-button
          @click="load"
          :disabled="loading"
          color="alternative"
          class="inline-flex items-center gap-2 rounded-xl"
        >
          <IconLucideRefreshCw class="w-4 h-4" :class="loading ? 'animate-spin' : ''" />
          <span>{{ t('reassignmentInbox.refresh') }}</span>
        </fwb-button>
      </template>
    </PageHeader>

    <PageContainer class="max-w-3xl mx-auto">
      <div v-if="loading" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-2xl p-5 animate-pulse border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-center gap-3 text-red-700 dark:text-red-400 shadow-sm"
      >
        <IconLucideAlertCircle class="w-5 h-5 shrink-0" />
        <p class="text-sm font-medium">{{ error }}</p>
      </div>

      <div
        v-else-if="requests.length === 0"
        class="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div
          class="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
        >
          <IconLucideCheckCircle class="w-10 h-10 text-green-500" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('reassignmentInbox.emptyTitle') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ t('reassignmentInbox.emptyText') }}
        </p>
      </div>

      <TransitionGroup name="list" tag="div" class="space-y-4" v-else>
        <ReassignmentRequestItem
          v-for="r in requests"
          :key="r.id"
          :request="r"
          :processing="processingId === r.id"
          @respond="openResponseModal(r, $event)"
        />
      </TransitionGroup>
    </PageContainer>

    <ConfirmResponseModal
      v-model="responseModalVisible"
      :request="selectedRequest"
      :decision="selectedDecision"
      @confirmed="handleConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton } from 'flowbite-vue';
  import IconLucideRefreshCw from '~icons/lucide/refresh-cw';
  import IconLucideAlertCircle from '~icons/lucide/alert-circle';
  import IconLucideCheckCircle from '~icons/lucide/check-circle';

  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';
  import { useReassignment } from '@/modules/visits/composables/useReassignment';
  import { useToast } from '@/shared/composables/useToast';
  import ConfirmResponseModal from '@/modules/visits/components/reassignment/ConfirmResponseModal.vue';
  import ReassignmentRequestItem from '@/modules/visits/components/reassignment/ReassignmentRequestItem.vue';
  import type { ReassignmentSolicitation } from '@/modules/visits/types/reassignment';

  const { t } = useI18n();
  const toast = useToast();
  const {
    receivedRequests: requests,
    loading,
    error,
    loadReceivedRequests,
    respondToRequest,
  } = useReassignment();

  const responseModalVisible = ref(false);
  const selectedRequest = ref<ReassignmentSolicitation | null>(null);
  const selectedDecision = ref<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
  const processingId = ref<string | null>(null);

  onMounted(load);
  async function load() {
    await loadReceivedRequests();
  }

  function openResponseModal(r: ReassignmentSolicitation, decision: 'ACCEPTED' | 'REJECTED') {
    selectedRequest.value = r;
    selectedDecision.value = decision;
    responseModalVisible.value = true;
  }

  async function handleConfirmed(payload: { comment?: string }) {
    if (!selectedRequest.value) return;
    processingId.value = selectedRequest.value.id;
    try {
      const success = await respondToRequest(selectedRequest.value.id, {
        decision: selectedDecision.value,
        comment: payload.comment,
      });
      if (success) {
        toast.success(
          selectedDecision.value === 'ACCEPTED'
            ? t('reassignmentInbox.toastAccepted')
            : t('reassignmentInbox.toastRejected')
        );
      }
    } finally {
      processingId.value = null;
    }
  }
</script>

<style scoped>
  .list-enter-active,
  .list-leave-active {
    transition: all 0.3s ease;
  }
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }
</style>
