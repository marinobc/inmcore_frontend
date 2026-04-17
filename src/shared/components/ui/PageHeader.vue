<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-5">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <router-link
            v-if="backTo"
            :to="backTo"
            class="p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <IconLucideArrowLeft class="h-5 w-5" />
          </router-link>

          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {{ title }}
            </h1>
            <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <slot name="actions"></slot>
        </div>
      </div>

      <div v-if="$slots.navigation" class="mt-4">
        <slot name="navigation"></slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import IconLucideArrowLeft from '~icons/lucide/arrow-left';

  defineProps<{
    title: string;
    subtitle?: string;
    backTo?: string;
  }>();
</script>
