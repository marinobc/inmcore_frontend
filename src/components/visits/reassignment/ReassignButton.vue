<template>
  <!--
    ReassignButton.vue
    "Request Reassignment" button placed inside the visit detail
    view/component. Opens the ReassignmentModal on click.

    USAGE:
      <ReassignButton
        :visit-id="visit.id"
        :visit-info="`${formatDate(visit.dateTime)} — ${visit.property}`"
        @request-sent="onRequestSent"
      />
  -->
  <div>
    <button
      @click="openModal"
      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-amber-400 bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 hover:border-amber-500 transition-all group"
    >
      <!-- Swap icon -->
      <svg
        class="w-4 h-4 group-hover:rotate-180 transition-transform duration-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
      Solicitar Reasignación
    </button>

    <!-- Reassignment modal -->
    <ReassignmentModal
      v-model="modalVisible"
      :visit-id="visitId"
      :visit-info="visitInfo"
      @request-sent="onRequestSent"
    />

    <!-- Success toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toastVisible"
          class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium"
        >
          <svg
            class="w-5 h-5 text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          Solicitud enviada! Tu colega será notificado.
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ReassignmentModal from "./ReassignmentModal.vue";

// ── Props & Emits ─────────────────────────────────────────────────────────
defineProps<{
  visitId: string;
  visitInfo?: string; // Human-readable label shown in the modal header
}>();

const emit = defineEmits<{
  (e: "requestSent"): void;
}>();

// ── State ─────────────────────────────────────────────────────────────────
const modalVisible = ref(false);
const toastVisible = ref(false);

// ── Methods ───────────────────────────────────────────────────────────────
function openModal() {
  modalVisible.value = true;
}

function onRequestSent() {
  showToast();
  emit("requestSent");
}

function showToast() {
  toastVisible.value = true;
  setTimeout(() => (toastVisible.value = false), 4000);
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
