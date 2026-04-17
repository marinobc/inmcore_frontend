<template>
  <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
    <TransitionGroup
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto w-full sm:w-[400px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 shadow-2xl rounded-2xl ring-1 ring-black/5 overflow-hidden transition-all duration-300"
      >
        <div class="p-3">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <IconLucideCheckCircle
                v-if="toast.type === 'success'"
                class="block h-5 w-5 text-green-500"
              />
              <IconLucideAlertCircle
                v-else-if="toast.type === 'error'"
                class="block h-5 w-5 text-red-500"
              />
              <IconLucideAlertTriangle
                v-else-if="toast.type === 'warning'"
                class="block h-5 w-5 text-yellow-500"
              />
              <IconLucideInfo v-else class="block h-5 w-5 text-blue-500" />
            </div>
            <div class="flex-1 min-w-0 overflow-hidden">
              <p
                class="text-sm font-semibold text-gray-900 dark:text-white break-words whitespace-normal overflow-wrap-anywhere leading-normal"
              >
                {{ toast.message }}
              </p>
            </div>
            <!-- was: <div class="flex-shrink-0 mt-0.5"> -->
            <div class="flex-shrink-0">
              <button
                @click="remove(toast.id)"
                class="bg-transparent rounded-lg p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
              >
                <span class="sr-only">{{ t('common.close') }}</span>
                <IconLucideX class="block h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
  import { useToast } from '@/shared/composables/useToast';
  import { useI18n } from 'vue-i18n';
  import IconLucideCheckCircle from '~icons/lucide/check-circle';
  import IconLucideAlertCircle from '~icons/lucide/alert-circle';
  import IconLucideAlertTriangle from '~icons/lucide/alert-triangle';
  import IconLucideInfo from '~icons/lucide/info';
  import IconLucideX from '~icons/lucide/x';

  const { t } = useI18n();
  const { toasts, remove } = useToast();
</script>
