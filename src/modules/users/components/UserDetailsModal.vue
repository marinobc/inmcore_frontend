<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="2xl">
    <template #header>
      <div class="text-xl font-bold dark:text-white">
        {{ t('users.view.detailsTitle') }}
      </div>
    </template>
    <template #body>
      <div v-if="user" class="space-y-6">
        <!-- Header Info -->
        <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
          <div
            class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner border border-white dark:border-gray-600"
          >
            {{ user.fullName?.charAt(0) || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-lg font-bold dark:text-white truncate">{{ user.fullName }}</h4>
            <p class="text-sm text-gray-500 truncate">{{ user.email }}</p>
          </div>
          <div class="ml-auto flex flex-col items-end gap-2">
            <StatusBadge :status="user.status" />
            <fwb-badge type="indigo" class="text-[10px] uppercase font-black">
              {{ resolveRoleName(user.userType) }}
            </fwb-badge>
          </div>
        </div>

        <!-- Details Grid -->
        <div
          class="grid grid-cols-2 md:grid-cols-3 gap-6 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <!-- Common Fields -->
          <div v-for="f in ['phone', 'birthDate'] as const" :key="f">
            <label
              class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1"
            >
              {{ t(`users.table.${f}`) }}
            </label>
            <p class="text-sm font-bold text-gray-900 dark:text-white">
              {{ user[f] || t('common.notAvailable') }}
            </p>
          </div>

          <!-- Role Specific: Owner -->
          <div v-if="user.userType === 'OWNER'">
            <label
              class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1"
            >
              {{ t('users.table.ciNit') }}
            </label>
            <p class="text-sm font-bold text-gray-900 dark:text-white">
              {{ user.taxId || user.nit || t('common.notAvailable') }}
            </p>
          </div>

          <!-- Role Specific: Employee/Admin -->
          <template v-if="user.userType === 'EMPLOYEE' || user.userType === 'ADMIN'">
            <div v-for="f in ['department', 'position', 'hireDate'] as const" :key="f">
              <label
                class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1"
              >
                {{ t(`users.form.${f}`) }}
              </label>
              <p class="text-sm font-bold text-gray-900 dark:text-white">
                {{ user[f] || t('common.notAvailable') }}
              </p>
            </div>
          </template>

          <!-- Role Specific: Client -->
          <template v-if="user.userType === 'INTERESTED_CLIENT'">
            <div v-for="f in ['budget', 'preferredZone', 'preferredRooms'] as const" :key="f">
              <label
                class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1"
              >
                {{ t(`users.view.${f === 'preferredRooms' ? 'rooms' : f}`) }}
              </label>
              <p class="text-sm font-bold text-gray-900 dark:text-white">
                {{
                  f === 'budget' && user[f]
                    ? `$${Number(user[f]).toLocaleString()}`
                    : user[f] || t('common.notAvailable')
                }}
              </p>
            </div>
          </template>
        </div>

        <!-- Address Section -->
        <div
          v-if="user.address"
          class="p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20"
        >
          <label class="block text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">
            {{ t('users.view.address') }}
          </label>
          <p class="text-sm font-medium text-gray-900 dark:text-white italic">
            "{{ user.address }}"
          </p>
        </div>

        <!-- Audit/History (Placeholder for future expansion) -->
        <slot name="extra" :user="user"></slot>

        <!-- Footer Actions for Admin (e.g. Delete) -->
        <div
          v-if="showAdminActions && user.status === 'INACTIVE'"
          class="border-t border-gray-100 dark:border-gray-700 pt-6 flex justify-end"
        >
          <fwb-button @click="$emit('delete', user)" color="red" class="rounded-xl">
            <IconLucideTrash class="w-4 h-4 mr-2" />
            {{ t('users.view.deactivate') }}
          </fwb-button>
        </div>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { FwbModal, FwbButton, FwbBadge } from 'flowbite-vue';
  import StatusBadge from '@/shared/components/ui/StatusBadge.vue';
  import IconLucideTrash from '~icons/lucide/trash';
  import type { User } from '../types/user';

  const { t } = useI18n();

  defineProps<{
    show: boolean;
    user: User | null;
    showAdminActions?: boolean;
  }>();

  defineEmits(['close', 'delete']);

  const resolveRoleName = (type?: string) => {
    if (!type) return t('common.unknown');
    const tMap: Record<string, string> = {
      ADMIN: t('roleTypes.admin'),
      EMPLOYEE: t('roleTypes.agent'),
      OWNER: t('roleTypes.owner'),
      INTERESTED_CLIENT: t('roleTypes.client'),
    };
    return tMap[type.toUpperCase()] || type;
  };
</script>
