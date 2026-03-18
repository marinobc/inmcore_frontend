<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative">
    <div class="absolute top-4 right-4 z-50">
      <theme-toggle />
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from './components/ThemeToggle.vue'
</script>
