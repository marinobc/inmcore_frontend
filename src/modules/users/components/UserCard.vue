<template>
  <fwb-card
    class="flex flex-col h-full overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border-gray-200 dark:border-gray-700 relative dark:bg-gray-800"
    @click="$emit('click', user)"
  >
    <!-- Status Badge -->
    <div class="absolute top-3 right-3 z-10">
      <StatusBadge :status="user.status" />
    </div>

    <div class="p-5 flex-1 flex flex-col">
      <!-- Header with Initials/Avatar -->
      <div class="flex items-center gap-4 mb-5">
        <div
          :class="[
            'w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner border transition-all duration-300 group-hover:scale-110',
            avatarColorClass,
          ]"
        >
          {{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <h5 class="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
            {{ user.fullName }}
          </h5>
          <p
            v-if="user.userType"
            class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest"
          >
            {{ t('users.types.' + user.userType.toLowerCase()) }}
          </p>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="space-y-3 mb-6">
        <div class="flex items-center gap-3 group/item">
          <div
            class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-400 group-hover/item:text-blue-500 transition-colors"
          >
            <IconLucideMail class="w-4 h-4" />
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ user.email }}</p>
        </div>
        <div class="flex items-center gap-3 group/item">
          <div
            class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-400 group-hover/item:text-green-500 transition-colors"
          >
            <IconLucidePhone class="w-4 h-4" />
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ user.phone || t('common.noPhone') }}
          </p>
        </div>
      </div>

      <!-- Preferences (for Clients) -->
      <div
        v-if="user.userType === 'INTERESTED_CLIENT'"
        class="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 mb-6 border border-blue-100/50 dark:border-blue-900/20"
      >
        <p class="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-3">
          {{ t('agentClients.preferences') }}
        </p>
        <div class="grid grid-cols-1 gap-3">
          <div v-if="user.preferredZone" class="flex items-center gap-2">
            <span class="text-xs">📍</span>
            <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {{ user.preferredZone }}
            </span>
          </div>
          <div v-if="user.budget" class="flex items-center gap-2">
            <span class="text-xs">💰</span>
            <span class="text-xs font-bold text-blue-600 dark:text-blue-400">
              ${{ Number(user.budget).toLocaleString() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center"
      >
        <div class="flex gap-1">
          <slot name="actions"></slot>
        </div>
        <button
          @click.stop="$emit('details', user)"
          class="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 group/btn"
        >
          {{ t('common.details') }}
          <IconLucideChevronRight
            class="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </div>
  </fwb-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbCard } from 'flowbite-vue';
  import StatusBadge from '@/shared/components/ui/StatusBadge.vue';
  import IconLucideMail from '~icons/lucide/mail';
  import IconLucidePhone from '~icons/lucide/phone';
  import IconLucideChevronRight from '~icons/lucide/chevron-right';
  import type { User } from '../types/user';

  const { t } = useI18n();

  const props = defineProps<{
    user: User;
  }>();

  defineEmits(['click', 'details', 'edit', 'deactivate']);

  const avatarColorClass = computed(() => {
    const type = props.user.userType?.toUpperCase();
    switch (type) {
      case 'INTERESTED_CLIENT':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 border-blue-200 dark:border-blue-800/50';
      case 'OWNER':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 border-purple-200 dark:border-purple-800/50';
      case 'EMPLOYEE':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 border-orange-200 dark:border-orange-800/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 border-gray-200 dark:border-gray-700';
    }
  });
</script>
