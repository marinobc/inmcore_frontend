<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="4xl">
    <template #header>
      <div class="flex items-center space-x-4">
        <h3 class="text-2xl font-bold dark:text-white">
          {{ owner?.fullName }}
        </h3>
        <fwb-badge type="purple">{{ t('users.roles.owner') }}</fwb-badge>
        <StatusBadge v-if="owner?.status" :status="String(owner.status)" />
      </div>
    </template>

    <template #body>
      <div v-if="owner" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-4">
          <!-- Fiscal & Location Info -->
          <div
            class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            <h4 class="text-xs font-black text-purple-600 uppercase tracking-widest mb-3">
              {{ t('users.view.ownerInfo') }}
            </h4>
            <div class="grid grid-cols-2 gap-y-3 text-sm">
              <span class="text-gray-500 font-medium">{{ t('users.table.ciNit') }}</span>
              <span class="dark:text-white font-bold text-right">
                {{ owner.taxId || owner.nit || t('common.notAvailable') }}
              </span>

              <span class="text-gray-500 font-medium">{{ t('users.view.address') }}</span>
              <span class="dark:text-white text-right">
                {{ owner.address || t('common.notAvailable') }}
              </span>

              <span class="text-gray-500 font-medium">{{ t('users.view.properties') }}</span>
              <span class="text-blue-600 font-bold text-right">
                {{ owner.propertyIds?.length || 0 }}
              </span>
            </div>
          </div>

          <!-- Contact Info -->
          <div
            class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              {{ t('clientDetails.directContact') }}
            </h4>
            <p class="text-sm dark:text-white flex items-center gap-2">
              <IconLucideMail class="w-4 h-4 text-gray-400" />
              {{ owner.email }}
            </p>
            <p class="text-sm dark:text-white mt-1 flex items-center gap-2">
              <IconLucidePhone class="w-4 h-4 text-gray-400" />
              {{ owner.phone || t('common.noPhone') }}
            </p>
          </div>
        </div>

        <!-- History -->
        <div class="space-y-6">
          <div class="relative pl-6 border-l-2 border-purple-500">
            <div
              class="absolute -left-[9px] top-0 w-4 h-4 bg-purple-500 rounded-full border-4 border-white dark:border-gray-900"
            ></div>
            <h4 class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4">
              {{ t('clientDetails.changeHistory') }}
            </h4>

            <div
              v-if="owner.auditLog?.length"
              class="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
            >
              <div
                v-for="(entry, i) in [...owner.auditLog].reverse()"
                :key="i"
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div class="flex justify-between items-center mb-2">
                  <span
                    class="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase"
                  >
                    {{ t('clientDetails.editor') }} {{ entry.changedBy }}
                  </span>
                  <span class="text-[10px] text-gray-400 font-mono">
                    {{ formatDate(entry.changedAt) }}
                  </span>
                </div>

                <div class="space-y-1">
                  <div
                    v-for="(ch, j) in entry.changes"
                    :key="j"
                    class="text-[11px] flex flex-wrap items-center gap-1"
                  >
                    <span class="font-semibold text-gray-600 dark:text-gray-400">
                      {{ ch.field }}
                    </span>
                    <span class="text-red-400 line-through">
                      {{ ch.oldValue || t('clientDetails.empty') }}
                    </span>
                    <IconLucideArrowRight class="w-2 h-2 text-gray-400" />
                    <span class="text-green-600 dark:text-green-400 font-bold">
                      {{ ch.newValue }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic border-2 border-dashed"
            >
              {{ t('clientDetails.noChanges') }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <fwb-button color="alternative" @click="$emit('close')">{{ t('common.close') }}</fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { FwbModal, FwbBadge, FwbButton } from 'flowbite-vue';
  import StatusBadge from '@/shared/components/ui/StatusBadge.vue';
  import IconLucideArrowRight from '~icons/lucide/arrow-right';
  import IconLucideMail from '~icons/lucide/mail';
  import IconLucidePhone from '~icons/lucide/phone';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/core/locales/i18n';

  const { t } = useI18n();

  interface AuditEntry {
    changedBy: string;
    changedAt: string;
    changes?: Array<{
      field: string;
      oldValue?: string;
      newValue?: string;
    }>;
  }

  interface OwnerRecord {
    fullName?: string;
    taxId?: string;
    nit?: string;
    address?: string;
    propertyIds?: string[];
    email?: string;
    phone?: string;
    auditLog?: AuditEntry[];
    [key: string]: unknown;
  }

  defineProps<{ show: boolean; owner: OwnerRecord | null }>();
  defineEmits(['close']);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString(getLocaleString(), {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
</script>
