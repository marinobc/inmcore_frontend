<template>
  <div
    class="fixed bottom-4 left-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-w-xs"
  >
    <h3
      class="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex justify-between items-center"
    >
      {{ t('auth.devLogin') }}
      <span class="text-[10px] font-normal lowercase opacity-50">{{ t('auth.access') }}</span>
    </h3>
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="(user, i) in devUsers"
        :key="i"
        @click="$emit('login', user)"
        class="text-[10px] font-bold py-2 px-3 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all text-left truncate"
        :title="user.email"
      >
        {{ user.label || 'User ' + (i + 1) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  const devUsers = [
    { label: 'Admin', email: 'admin@admin.com', password: 'password' },
    { label: 'Agent 1', email: 'agent1@user.com', password: 'password' },
    { label: 'Agent 2', email: 'agent2@user.com', password: 'password' },
    { label: 'Owner 1', email: 'owner1@user.com', password: 'password' },
    { label: 'Owner 2', email: 'owner2@user.com', password: 'password' },
    { label: 'Client', email: 'client1@user.com', password: 'password' },
  ];

  defineEmits(['login']);
</script>
