<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative">
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
  import ToastContainer from '@/shared/components/ui/ToastContainer.vue';
</script>
