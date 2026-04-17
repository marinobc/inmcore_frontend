<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
  >
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <fwb-input
          v-model="internalSearch"
          :placeholder="placeholder"
          size="md"
          class="rounded-xl"
          @input="handleInput"
        >
          <template #prefix>
            <IconLucideSearch class="w-4 h-4 text-gray-400" />
          </template>
        </fwb-input>
      </div>
      <div class="flex gap-2">
        <fwb-button
          v-if="internalSearch"
          @click="clear"
          color="alternative"
          size="sm"
          class="rounded-lg"
        >
          {{ clearLabel || 'Clear' }}
        </fwb-button>
        <div class="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          <button
            v-for="opt in pillOptions"
            :key="String(opt.value)"
            class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all"
            :class="
              activePillValue === opt.value
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            "
            @click="$emit('update:activePillValue', opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { FwbInput, FwbButton } from 'flowbite-vue';
  import IconLucideSearch from '~icons/lucide/search';

  const props = defineProps<{
    modelValue: string;
    activePillValue: unknown;
    pillOptions: Array<{ label: string; value: unknown }>;
    placeholder?: string;
    clearLabel?: string;
  }>();

  const emit = defineEmits(['update:modelValue', 'update:activePillValue', 'clear', 'input']);

  const internalSearch = ref(props.modelValue);

  watch(
    () => props.modelValue,
    (val) => {
      internalSearch.value = val;
    }
  );

  const handleInput = () => {
    emit('update:modelValue', internalSearch.value);
    emit('input', internalSearch.value);
  };

  const clear = () => {
    internalSearch.value = '';
    emit('update:modelValue', '');
    emit('clear');
  };
</script>
