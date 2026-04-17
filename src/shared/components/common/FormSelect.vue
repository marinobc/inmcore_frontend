<template>
  <div>
    <label v-if="label" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      {{ label }}
    </label>
    <select
      v-bind="$attrs"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      <slot></slot>
    </select>
    <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-500 font-medium">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    label?: string;
    modelValue?: string | number;
    error?: string;
  }>();

  defineEmits(['update:modelValue']);
</script>
