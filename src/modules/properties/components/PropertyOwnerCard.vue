<template>
  <div
    class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
  >
    <h4 class="text-xs font-black text-green-600 uppercase tracking-widest mb-3">
      {{ t('propertyDetails.responsible') }}
    </h4>

    <div v-if="loading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
    </div>

    <div v-else-if="owner" class="flex items-center gap-3">
      <!-- Avatar -->
      <div
        class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
      >
        {{ owner.firstName?.charAt(0) }}{{ owner.lastName?.charAt(0) }}
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <h5 class="text-sm font-semibold leading-tight truncate dark:text-white">
          {{ owner.firstName }} {{ owner.lastName }}
        </h5>
        <div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          <span v-if="owner.email" class="flex items-center gap-1 truncate">
            <IconLucideMail class="w-3 h-3 shrink-0" />
            <span class="truncate">{{ owner.email }}</span>
          </span>
          <span v-if="owner.phone" class="flex items-center gap-1 shrink-0">
            <IconLucidePhone class="w-3 h-3 shrink-0" />
            {{ owner.phone }}
          </span>
        </div>
      </div>

      <!-- WhatsApp button -->
      <fwb-button
        v-if="owner.phone"
        @click="$emit('whatsapp')"
        size="sm"
        color="green"
        class="flex-shrink-0 flex items-center gap-2 rounded-xl px-4 py-2"
      >
        <IconWhatsapp class="w-4 h-4 text-white" />
        <span class="font-bold text-white">WhatsApp</span>
      </fwb-button>
    </div>

    <div v-else class="flex items-center gap-2 py-2 text-gray-400">
      <IconLucideUser class="w-5 h-5 opacity-50" />
      <p class="text-xs">{{ t('propertyDetails.noOwnerAssigned') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { FwbButton } from 'flowbite-vue';
  import IconLucideMail from '~icons/lucide/mail';
  import IconLucidePhone from '~icons/lucide/phone';
  import IconLucideUser from '~icons/lucide/user';
  // Use monotone version to allow color overriding (white)
  import IconWhatsapp from '~icons/ic/baseline-whatsapp';
  import type { User } from '@/modules/users/types/user';

  const { t } = useI18n();
  defineProps<{ owner: User | null; loading: boolean }>();
  defineEmits(['whatsapp']);
</script>
