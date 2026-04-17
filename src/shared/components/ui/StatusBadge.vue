<template>
  <span
    :class="badgeClasses"
    class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { t, te } = useI18n();

  const props = defineProps<{
    status: string;
  }>();

  const label = computed(() => {
    if (!props.status) return t('common.unknown') || 'Unknown';
    const s = props.status.toLowerCase();
    const S = props.status.toUpperCase();

    // Try multiple namespaces in order of relevance
    const paths = [
      `status.${S}`, // Root uppercase (e.g. status.DISPONIBLE)
      `status.${s}`, // Root lowercase (e.g. status.pending)
      `users.status.${s}`, // Users namespace
      `propertyStatus.${s}`, // Property namespace
    ];

    for (const path of paths) {
      if (te(path)) return t(path);
    }

    return props.status;
  });

  const badgeClasses = computed(() => {
    const s = props.status?.toUpperCase();
    switch (s) {
      case 'ACTIVE':
      case 'DISPONIBLE':
      case 'AVAILABLE':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'INACTIVE':
      case 'DEACTIVATED':
      case 'SUSPENDIDO':
      case 'OFF_MARKET':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'VENDIDO':
      case 'SOLD':
      case 'DELETED':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'RESERVADO':
      case 'RESERVED':
      case 'EN_NEGOCIACION':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  });
</script>
