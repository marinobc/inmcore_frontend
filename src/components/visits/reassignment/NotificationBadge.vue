<template>
  <!--
    NotificationBadge.vue
    Badge showing the number of pending reassignment requests in the navbar
    menu item. Refreshes automatically on mount via polling.

    USAGE in Navbar.vue:
      <RouterLink to="/reassignments/inbox">
        Reassignments
        <NotificationBadge />
      </RouterLink>
  -->
  <span
    v-if="count > 0"
    class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none ml-1.5 animate-pulse"
    :title="`${count} pending reassignment request${count !== 1 ? 's' : ''}`"
  >
    {{ count > 99 ? '99+' : count }}
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import reassignmentService from '@/services/reassignmentService';

// ── State ─────────────────────────────────────────────────────────────────
const count = ref(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  fetchCount();
  // Refresh the badge every 60 seconds (lightweight polling)
  intervalId = setInterval(fetchCount, 60_000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

// ── Methods ───────────────────────────────────────────────────────────────
async function fetchCount() {
  try {
    count.value = await reassignmentService.getPendingCount();
  } catch {
    // Silent: do not break the menu if the request fails
  }
}
</script>
