<template>
  <div class="flex items-center gap-1" :class="containerClass">
    <template v-for="action in visibleActions" :key="action.id">
      <fwb-button
        v-if="variant === 'pill' || variant === 'square'"
        :color="(action.color as any) || 'blue'"
        :pill="variant === 'pill'"
        :square="variant === 'square'"
        size="sm"
        :title="action.tooltip"
        @click.stop="$emit('action', action.id)"
      >
        <component :is="action.icon" class="w-4 h-4" />
      </fwb-button>

      <button
        v-else
        class="p-2 rounded-lg transition-all"
        :class="getColorClass(action.color)"
        :title="action.tooltip"
        @click.stop="$emit('action', action.id)"
      >
        <component :is="action.icon" class="w-5 h-5" />
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, type Component } from 'vue';
  import { FwbButton } from 'flowbite-vue';

  export interface ActionIconItem {
    id: string;
    icon: Component;
    tooltip: string;
    color?: 'blue' | 'red' | 'green' | 'yellow' | 'alternative' | string;
    show?: boolean;
  }

  const props = defineProps<{
    actions: ActionIconItem[];
    variant?: 'ghost' | 'pill' | 'square';
    containerClass?: string;
  }>();

  defineEmits<{
    (e: 'action', id: string): void;
  }>();

  const visibleActions = computed(() => props.actions.filter((a) => a.show !== false));

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20';
      case 'red':
        return 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20';
      case 'green':
        return 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20';
      case 'yellow':
        return 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20';
      default:
        return 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20';
    }
  };
</script>
