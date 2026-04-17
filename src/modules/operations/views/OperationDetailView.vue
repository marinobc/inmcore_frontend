<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-300">
    <div class="max-w-4xl mx-auto space-y-8">
      <FwbButton
        tag="router-link"
        to="/operations"
        color="light"
        size="sm"
        class="!px-3 !py-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
      >
        <div class="inline-flex items-center gap-2">
          <IconLucideArrowLeft class="w-4 h-4" />
          {{ t('operations.backToList') }}
        </div>
      </FwbButton>

      <div v-if="loadingOperation" class="space-y-4 animate-pulse">
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>

      <FwbAlert v-else-if="operationError" type="danger">
        {{ operationError }}
      </FwbAlert>

      <template v-else>
        <FwbCard class="dark:bg-gray-800 dark:border-gray-700">
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <FwbBadge type="default" size="sm" class="mb-2">
                  {{ t('operations.operationBadge') }}
                </FwbBadge>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ operation?.propertyName ?? t('operations.operationFallback') + operationId }}
                </h1>
                <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {{ t('common.id', { n: operationId }) }}
                </p>
              </div>
              <FwbBadge :type="statusBadgeType" size="sm">
                {{ operation?.status ?? t('operations.notSpecified') }}
              </FwbBadge>
            </div>

            <div
              class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div>
                <p class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {{ t('operations.property') }}
                </p>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                  {{ operation?.propertyName ?? t('operations.notSpecified') }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {{ t('operations.client') }}
                </p>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                  {{ operation?.clientName ?? t('operations.notSpecified') }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {{ t('operations.agent') }}
                </p>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                  {{ operation?.agentName ?? t('operations.notSpecified') }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {{ t('operations.date') }}
                </p>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                  {{ formatDate(operation?.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </FwbCard>

        <FwbCard class="dark:bg-gray-800 dark:border-gray-700">
          <OperationReceiptsSection :operation-id="operationId" />
        </FwbCard>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  import IconLucideArrowLeft from '~icons/lucide/arrow-left';
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { FwbCard, FwbBadge, FwbAlert, FwbButton } from 'flowbite-vue';
  import OperationReceiptsSection from '@/modules/operations/components/receipts/OperationReceiptsSection.vue';
  import { apiClient as api } from '@/core/api';

  const { t } = useI18n();

  const route = useRoute();
  const operationId = route.params.id as string;

  const operation = ref<Record<string, unknown> | null>(null);
  const loadingOperation = ref(false);
  const operationError = ref<string | null>(null);

  onMounted(async () => {
    loadingOperation.value = true;
    try {
      const response = await api.get(`/operations/${operationId}`);
      operation.value = response.data.data;
    } catch {
      operationError.value = t('operations.loadDetailError');
    } finally {
      loadingOperation.value = false;
    }
  });

  const statusBadgeType = computed(() => {
    const status = (operation.value?.status ?? '') as string;
    const map: Record<string, 'green' | 'dark' | 'yellow' | 'red'> = {
      ACTIVE: 'green',
      CLOSED: 'dark',
      CANCELLED: 'red',
      PENDING: 'yellow',
    };
    return map[status] ?? 'dark';
  });

  function formatDate(iso?: unknown): string {
    if (!iso || typeof iso !== 'string') return t('operations.notSpecified');
    return new Date(iso).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
</script>
