<template>
  <div>
    <fwb-input
      v-bind="$attrs"
      :label="label"
      :validation-status="error ? 'error' : modified ? 'success' : undefined"
      :class="{ 'border-blue-500 ring-2 ring-blue-200': modified && !error }"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-500 font-medium">
      {{ error }}
    </p>
    <p v-if="modified && !error && modificationMessage" class="text-xs text-blue-600 mt-1">
      {{ modificationMessage }}
    </p>
    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts">
  import { FwbInput } from 'flowbite-vue';

  defineProps<{
    label?: string;
    error?: string;
    modified?: boolean;
    modificationMessage?: string;
  }>();

  defineOptions({
    inheritAttrs: false,
  });
</script>
