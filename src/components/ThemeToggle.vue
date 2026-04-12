<template>
  <button
    @click="toggleTheme"
    type="button"
    class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 transition-colors"
    aria-label="Toggle dark mode"
  >
    <IconLucideSun v-if="isDark" class="w-5 h-5" />
    <IconLucideMoon v-else class="w-5 h-5" />
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import IconLucideSun from '~icons/lucide/sun';
import IconLucideMoon from '~icons/lucide/moon';

const { isDark, toggleTheme } = useTheme();
</script>
