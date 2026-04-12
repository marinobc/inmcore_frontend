<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">{{ t('auditLogs.title') }}</h1>
        <p class="text-gray-500 text-sm">
          {{ t('auditLogs.subtitle') }}
        </p>
      </div>
      <fwb-badge type="indigo">{{ t('auditLogs.adminMode') }}</fwb-badge>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4"
    >
      <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <IconLucideSearch class="w-5 h-5 text-gray-500" />
          </div>
          <input
            v-model="search"
            type="text"
            class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            :placeholder="t('auditLogs.searchPlaceholder')"
          />
        </div>
        <select
          v-model="filterAction"
          class="text-sm border border-gray-300 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="">{{ t('auditLogs.actions.all') }}</option>
          <option value="CREATED">{{ t('auditLogs.actions.creations') }}</option>
          <option value="UPDATED">{{ t('auditLogs.actions.edits') }}</option>
          <option value="DEACTIVATE">{{ t('auditLogs.actions.deactivations') }}</option>
          <option value="REACTIVATE">{{ t('auditLogs.actions.reactivations') }}</option>
          <option value="DELETE">{{ t('auditLogs.actions.deletions') }}</option>
          <option value="BAJA">{{ t('auditLogs.actions.removals') }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20 dark:text-white">{{ t('auditLogs.loading') }}</div>

    <div v-else class="space-y-3">
      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span
              :class="[
                'px-2 py-1 text-xs font-semibold rounded-full',
                log.action === 'CREATED'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : log.action === 'UPDATED'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : log.action === 'DEACTIVATE' || log.action === 'BAJA'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                      : log.action === 'REACTIVATE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
              ]"
            >
              {{ actionLabel(log.action) }}
            </span>
            <span
              class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {{ personTypeLabel(log.personType) }}
            </span>
          </div>
          <span class="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {{ formatDate(log.timestamp) }}
          </span>
        </div>

        <div class="mt-2">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ log.personName }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('auditLogs.by') }}
            <span class="font-mono text-gray-700 dark:text-gray-300">
              {{ getChangedByLabel(log) }}
            </span>
          </p>
          <p
            v-if="log.action === 'DEACTIVATE' || log.action === 'BAJA'"
            class="text-xs text-gray-500 dark:text-gray-400 mt-1"
          >
            {{ t('auditLogs.reason') }}
            <span class="font-mono text-gray-700 dark:text-gray-300">
              {{ getBajaReason(log) || log.details || t('auditLogs.notSpecified') }}
            </span>
          </p>
        </div>

        <div v-if="log.action === 'UPDATED' && log.changes?.length" class="mt-3 space-y-1">
          <div
            v-for="change in log.changes"
            :key="change.field"
            class="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-900/50 rounded p-2"
          >
            <span class="font-medium text-gray-600 dark:text-gray-400 w-32 shrink-0">
              {{ change.field }}
            </span>
            <span class="text-red-500 line-through">
              {{ change.oldValue || t('common.notSpecified') }}
            </span>
            <span class="text-gray-400">{{ t('auditLogs.arrow') }}</span>
            <span class="text-green-600 dark:text-green-400">
              {{ change.newValue || t('common.notSpecified') }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="filteredLogs.length === 0"
        class="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        {{ t('auditLogs.noRecords') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';
  import { FwbBadge } from 'flowbite-vue';
  import { auditService } from '@/services/auditService';
  import IconLucideSearch from '~icons/lucide/search';

  const { t } = useI18n();

  interface AuditLog {
    id: string;
    action: string;
    personType: string;
    personName: string;
    changedBy: string;
    timestamp: string;
    details?: string;
    changes?: Array<{ field: string; oldValue?: string; newValue?: string }>;
  }

  const logs = ref<AuditLog[]>([]);
  const loading = ref(false);
  const search = ref('');
  const filterAction = ref('');

  const filteredLogs = computed(() => {
    return logs.value.filter((log) => {
      const matchesSearch =
        !search.value.trim() ||
        log.personName?.toLowerCase().includes(search.value.toLowerCase()) ||
        log.changedBy?.toLowerCase().includes(search.value.toLowerCase());
      const matchesAction = !filterAction.value || log.action === filterAction.value;
      return matchesSearch && matchesAction;
    });
  });

  const formatDate = (ts: string) => {
    if (!ts) return t('common.notSpecified');
    return new Date(ts).toLocaleString(getLocaleString(), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const personTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      ADMIN: t('auditLogs.personTypes.admin'),
      EMPLOYEE: t('auditLogs.personTypes.employee'),
      OWNER: t('auditLogs.personTypes.owner'),
      INTERESTED_CLIENT: t('auditLogs.personTypes.client'),
      USER: t('auditLogs.personTypes.user'),
    };
    return map[type] || type;
  };

  const actionLabel = (action: string) => {
    const map: Record<string, string> = {
      CREATED: t('auditLogs.actions.creation'),
      UPDATED: t('auditLogs.actions.edit'),
      DEACTIVATE: t('auditLogs.actions.deactivation'),
      REACTIVATE: t('auditLogs.actions.reactivation'),
      DELETE: t('auditLogs.actions.deletion'),
      BAJA: t('auditLogs.actions.removal'),
      ROLE_ASSIGN: t('auditLogs.actions.roleAssignment'),
    };
    return map[action] || action;
  };

  const getChangedByLabel = (log: AuditLog) => {
    const value = (log?.changedBy || '').toString().trim();
    return value || t('auditLogs.unidentifiedUser');
  };

  const getBajaReason = (log: AuditLog) => {
    return log.changes?.find((change) => change.field === 'motivoBaja')?.newValue;
  };

  onMounted(async () => {
    loading.value = true;
    try {
      const fetchedLogs = await auditService.getLogs();
      logs.value = fetchedLogs as AuditLog[];
    } catch (e) {
      console.error('Error loading audit logs:', e);
    } finally {
      loading.value = false;
    }
  });
</script>
