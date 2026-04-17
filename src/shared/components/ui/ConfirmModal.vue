<template>
  <fwb-modal v-if="modelValue" @close="$emit('update:modelValue', false)">
    <template #header>
      <div class="text-lg font-semibold">{{ title }}</div>
    </template>
    <template #body>
      <div class="space-y-3">
        <p class="text-sm text-gray-700 dark:text-gray-300">
          {{ message }}
        </p>
        <slot></slot>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <fwb-button @click="$emit('update:modelValue', false)" color="alternative">
          {{ cancelText || t('common.cancel') }}
        </fwb-button>
        <fwb-button @click="$emit('confirm')" :color="confirmColor || 'blue'" :disabled="loading">
          <IconLucideLoader v-if="loading" class="animate-spin w-4 h-4 mr-2 inline" />
          {{ confirmText || t('common.confirm') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { FwbModal, FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import IconLucideLoader from '~icons/lucide/loader';

  const { t } = useI18n();

  defineProps<{
    modelValue: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'blue' | 'red' | 'green' | 'yellow' | 'alternative' | 'dark' | 'light';
    loading?: boolean;
  }>();
  defineEmits(['update:modelValue', 'confirm']);
</script>
