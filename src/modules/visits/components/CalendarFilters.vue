<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 transition-colors shadow-sm"
  >
    <div class="flex flex-col lg:flex-row gap-5 items-center">
      <!-- Searchable Filters -->
      <div class="flex-1 flex flex-col md:flex-row gap-5 w-full">
        <SearchableSelect
          v-model="propertyId"
          :label="t('calendar.filterProperty')"
          :items="propertyOptions"
          :placeholder="t('calendar.searchProperty')"
        />
        <SearchableSelect
          v-model="agentId"
          :label="t('calendar.filterAgent')"
          :items="agentOptions"
          :placeholder="t('calendar.searchAgent')"
        />
      </div>

      <!-- Clear Filters -->
      <div class="flex items-center h-full">
        <fwb-button
          v-if="propertyId || agentId"
          @click="clear"
          color="red"
          size="xs"
          class="uppercase font-bold tracking-widest rounded-xl px-4 py-2"
        >
          {{ t('common.clear') }}
        </fwb-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton } from 'flowbite-vue';
  import SearchableSelect from '@/shared/components/common/SearchableSelect.vue';
  import { propertyService } from '@/modules/properties';
  import { userService } from '@/modules/users/services/userService';
  import type { Property } from '@/modules/properties/types/property';
  import type { User } from '@/modules/users/types/user';

  const { t } = useI18n();
  const emit = defineEmits([
    'update:propertyId',
    'update:agentId',
    'change',
    'prev',
    'next',
    'today',
  ]);

  const propertyId = ref('');
  const agentId = ref('');
  const properties = ref<Property[]>([]);
  const agents = ref<User[]>([]);

  const propertyOptions = computed(() =>
    properties.value.map((p) => ({ value: p.id, label: p.title }))
  );
  const agentOptions = computed(() =>
    agents.value.map((a) => ({ value: a.id, label: a.fullName }))
  );

  async function loadData() {
    const [pRes, uRes] = await Promise.all([
      propertyService.getProperties(),
      userService.getUsers(0, 1000),
    ]);
    properties.value = pRes.data || [];
    agents.value = (uRes.data || []).filter(
      (u: User) => u.userType === 'EMPLOYEE' || u.userType === 'ADMIN'
    );
  }

  watch(propertyId, (val) => {
    emit('update:propertyId', val);
    emit('change');
  });
  watch(agentId, (val) => {
    emit('update:agentId', val);
    emit('change');
  });

  function clear() {
    propertyId.value = '';
    agentId.value = '';
    emit('change');
  }

  loadData();
</script>
