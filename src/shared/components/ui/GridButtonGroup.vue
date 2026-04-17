<template>
  <div class="grid grid-cols-2 gap-2" :class="containerClass">
    <template v-for="btn in visibleButtons" :key="btn.id">
      <fwb-button
        size="sm"
        :color="(btn.color as any) || 'alternative'"
        class="rounded-lg shadow-sm"
        @click.stop="$emit('click', btn.id)"
      >
        {{ btn.label }}
      </fwb-button>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { FwbButton } from 'flowbite-vue';

  export interface GridButtonItem {
    id: string;
    label: string;
    color?: string;
    show?: boolean;
  }

  const props = defineProps<{
    buttons: GridButtonItem[];
    containerClass?: string;
  }>();

  defineEmits<{
    (e: 'click', id: string): void;
  }>();

  const visibleButtons = computed(() => props.buttons.filter((b) => b.show !== false));
</script>
