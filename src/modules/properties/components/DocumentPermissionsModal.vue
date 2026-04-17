<template>
  <fwb-modal v-if="doc" @close="$emit('close')">
    <template #header>
      <div class="text-lg font-bold">
        {{ t('documentUpload.configurePermissions') }}
      </div>
    </template>
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('documentUpload.documentLabel') }}
          <span class="font-bold">{{ doc.originalFileName }}</span>
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('documentUpload.accessRoles') }}
          </label>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="form.roles.ADMIN" />
              <span>{{ t('documentUpload.admins') }}</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="form.roles.AGENT" />
              <span>{{ t('documentUpload.generalAgents') }}</span>
            </label>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('documentUpload.specificAgents') }}
          </label>
          <div class="flex gap-2">
            <input
              v-model="newAgentId"
              type="text"
              :placeholder="t('documentUpload.agentIdPlaceholder')"
              class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
            />
            <fwb-button size="sm" @click="addAgent">{{ t('documentUpload.add') }}</fwb-button>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="agent in form.specificAgents"
              :key="agent"
              class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
            >
              {{ agent }}
              <button @click="removeAgent(agent)" class="hover:text-red-600">×</button>
            </span>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <fwb-button color="alternative" @click="$emit('close')">
          {{ t('documentUpload.cancel') }}
        </fwb-button>
        <fwb-button gradient="blue" @click="save" :disabled="loading">
          {{ t('documentUpload.save') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbModal, FwbButton } from 'flowbite-vue';
  import { documentService, type DocumentResponse } from '../services/documentService';
  import { useToast } from '@/shared/composables/useToast';

  const { t } = useI18n();
  const toast = useToast();
  const props = defineProps<{ doc: DocumentResponse }>();
  const emit = defineEmits(['close', 'updated']);

  const loading = ref(false);
  const newAgentId = ref('');
  const form = reactive({
    roles: { ADMIN: false, AGENT: false },
    specificAgents: [] as string[],
  });

  watch(
    () => props.doc,
    (d) => {
      if (!d) return;
      const policy = d.accessPolicy || [];
      form.roles.ADMIN = policy.includes('ROLE_ADMIN');
      form.roles.AGENT = policy.includes('ROLE_AGENT');
      form.specificAgents = policy.filter((p: string) => p !== 'ROLE_ADMIN' && p !== 'ROLE_AGENT');
    },
    { immediate: true }
  );

  const addAgent = () => {
    if (newAgentId.value && !form.specificAgents.includes(newAgentId.value)) {
      form.specificAgents.push(newAgentId.value);
      newAgentId.value = '';
    }
  };
  const removeAgent = (id: string) =>
    (form.specificAgents = form.specificAgents.filter((a) => a !== id));

  async function save() {
    loading.value = true;
    const policy = [];
    if (form.roles.ADMIN) policy.push('ROLE_ADMIN');
    if (form.roles.AGENT) policy.push('ROLE_AGENT');
    policy.push(...form.specificAgents);
    try {
      await documentService.updateDocumentPermissions(props.doc.id, policy);
      toast.success(t('documentUpload.permissionsSuccess'));
      emit('updated');
      emit('close');
    } catch {
      toast.error(t('documentUpload.permissionsError'));
    } finally {
      loading.value = false;
    }
  }
</script>
