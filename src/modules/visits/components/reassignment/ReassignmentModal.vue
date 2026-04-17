<template>
  <FwbModal v-if="modelValue" @close="$emit('update:modelValue', false)" size="lg">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
          <IconLucideUsers class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 class="font-semibold text-lg dark:text-white">
            {{ t('reassignment.title') }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            {{ t('reassignment.visitLabel') }} {{ visitInfo }}
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <form @submit.prevent="submit" class="space-y-5">
        <SearchableSelect
          v-model="destinationAgentId"
          :items="agentOptions"
          :label="t('reassignment.selectColleague')"
          :placeholder="t('reassignment.loadingAgents')"
          :loading="loadingAgents"
          :error="errors.destinationAgentId"
          required
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('reassignment.reasonLabel') }}
            <span class="text-red-500">*</span>
          </label>
          <fwb-textarea
            v-model="reason"
            :placeholder="t('reassignment.reasonPlaceholder')"
            :rows="3"
          />
          <p v-if="errors.reason" class="text-red-500 text-xs mt-1">
            {{ errors.reason }}
          </p>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex gap-3 justify-end w-full">
        <FwbButton @click="$emit('update:modelValue', false)" color="alternative">
          {{ t('common.cancel') }}
        </FwbButton>
        <FwbButton @click="submit" :disabled="loading" gradient="blue">
          <IconLucideLoader v-if="loading" class="animate-spin w-4 h-4 mr-2 inline" />
          {{ loading ? t('reassignment.sending') : t('reassignment.sendRequest') }}
        </FwbButton>
      </div>
    </template>
  </FwbModal>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useForm } from 'vee-validate';
  import { z } from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';
  import { FwbModal, FwbButton, FwbTextarea } from 'flowbite-vue';
  import IconLucideUsers from '~icons/lucide/users';
  import IconLucideLoader from '~icons/lucide/loader';

  import { reassignmentService } from '@/modules/visits/services/reassignmentService';
  import { useAuthStore } from '@/modules/auth/stores/authStore';
  import { useToast } from '@/shared/composables/useToast';
  import SearchableSelect from '@/shared/components/common/SearchableSelect.vue';
  import type {
    AvailableAgent,
    ReassignmentSolicitation,
  } from '@/modules/visits/types/reassignment';

  const { t } = useI18n();
  const toast = useToast();
  const authStore = useAuthStore();

  const props = defineProps<{
    modelValue: boolean;
    visitId: string;
    visitInfo?: string;
  }>();
  const emit = defineEmits(['update:modelValue', 'requestSent']);

  const agents = ref<AvailableAgent[]>([]);
  const loadingAgents = ref(false);
  const loading = ref(false);

  const schema = toTypedSchema(
    z.object({
      destinationAgentId: z.string().min(1, t('reassignment.validationSelect')),
      reason: z
        .string()
        .min(10, t('reassignment.validationReasonMin'))
        .max(300, t('reassignment.validationReasonMax')),
    })
  );

  const { defineField, errors, handleSubmit, resetForm } = useForm({
    validationSchema: schema,
    initialValues: { destinationAgentId: '', reason: '' },
  });

  const [destinationAgentId] = defineField('destinationAgentId');
  const [reason] = defineField('reason');

  const agentOptions = computed(() =>
    agents.value.map((a) => ({
      value: a.id,
      label: `${a.firstName} ${a.lastName}`,
      subtitle: a.email,
    }))
  );

  watch(
    () => props.modelValue,
    async (open) => {
      if (open) {
        resetForm();
        loadingAgents.value = true;
        try {
          const all = await reassignmentService.getAvailableAgents();
          const me = authStore.user?.sub || authStore.user?.userId;
          agents.value = all.filter((a: AvailableAgent) => a.id !== me);
        } finally {
          loadingAgents.value = false;
        }
      }
    }
  );

  const submit = handleSubmit(async (values) => {
    loading.value = true;
    try {
      const result: ReassignmentSolicitation = await reassignmentService.requestReassignment(
        props.visitId,
        values
      );
      console.log('Reassignment requested:', result.id);
      toast.success(t('reassignment.toastSuccess'));
      emit('requestSent');
      emit('update:modelValue', false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      loading.value = false;
    }
  });
</script>
