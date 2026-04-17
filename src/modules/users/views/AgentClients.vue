<template>
  <div>
    <PageHeader :title="t('agentClients.title')" :subtitle="t('agentClients.subtitle')">
      <template #actions>
        <fwb-button @click="openCreateModal" color="blue" class="inline-flex items-center gap-2">
          <IconLucidePlus class="w-4 h-4" />
          <span>{{ t('agentClients.newClient') }}</span>
        </fwb-button>
      </template>
    </PageHeader>

    <PageContainer class="space-y-6 relative">
      <!-- Loading Overlay for seamless updates -->
      <div
        v-if="loading && hasLoadedOnce"
        class="absolute inset-x-0 top-[100px] bottom-0 z-10 bg-gray-50/20 dark:bg-gray-900/20 backdrop-blur-[2px] flex justify-center pt-20 transition-all duration-300 rounded-2xl"
      >
        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-fit flex items-center gap-3"
        >
          <IconLucideLoader class="animate-spin h-6 w-6 text-blue-600" />
          <span class="text-sm font-bold text-gray-600 dark:text-gray-300">
            {{ t('common.loading') }}
          </span>
        </div>
      </div>

      <SearchFilterBar
        v-model="searchQuery"
        :pill-options="[]"
        :active-pill-value="null"
        :placeholder="t('agentClients.searchPlaceholder')"
        @input="handleSearch"
      />

      <!-- Initial Loading Skeleton -->
      <div
        v-if="loading && !hasLoadedOnce"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
        ></div>
      </div>

      <!-- Main Content (Cards or Empty State) -->
      <template v-else>
        <div
          v-if="users.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300"
          :class="{ 'opacity-40 pointer-events-none': loading }"
        >
          <UserCard
            v-for="user in users"
            :key="user.id"
            :user="user"
            @details="openDetailsModal"
            @click="openDetailsModal"
          >
            <template #actions>
              <ActionIconGroup
                variant="pill"
                :actions="[
                  {
                    id: 'edit',
                    icon: IconLucidePencil,
                    tooltip: t('agentClients.editProfile'),
                    color: 'blue',
                  },
                ]"
                @action="openEditModal(user)"
              />
            </template>
          </UserCard>
        </div>

        <div
          v-else-if="!loading"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center"
        >
          <div
            class="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <IconLucideSearch class="w-8 h-8 text-gray-300" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {{ t('agentClients.emptyTitle') || 'No se encontraron clientes' }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">
            {{
              t('agentClients.emptyText') ||
              'No hay clientes asignados que coincidan con tu búsqueda.'
            }}
          </p>
        </div>
      </template>

      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total="totalUsers"
        @change="load(searchQuery)"
      />
    </PageContainer>

    <!-- Modals -->
    <fwb-modal v-if="showModal" @close="closeModal" size="2xl">
      <template #header>
        <div class="text-xl font-bold">
          {{ isEditing ? t('agentClients.editTitle') : t('agentClients.createTitle') }}
        </div>
      </template>
      <template #body>
        <UserForm
          :key="formKey"
          :initial-data="editingUser || undefined"
          client-only
          :is-editing="isEditing"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </fwb-modal>

    <UserDetailsModal
      :show="showDetailsModal"
      :user="selectedUser"
      @close="showDetailsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton, FwbModal } from 'flowbite-vue';
  import { debounce } from '@/utils/debounce';
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucideSearch from '~icons/lucide/search';
  import IconLucidePencil from '~icons/lucide/pencil';
  import IconLucideLoader from '~icons/lucide/loader';
  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';

  import { useAgentClients } from '../composables/useAgentClients';
  import { useToast } from '@/shared/composables/useToast';
  import { handleApiError } from '@/core/api/errorHandler';
  import type { User, UserFormPayload } from '../types/user';

  import Pagination from '@/shared/components/ui/Pagination.vue';
  import UserForm from '../components/UserForm.vue';
  import UserDetailsModal from '../components/UserDetailsModal.vue';
  import UserCard from '../components/UserCard.vue';
  import SearchFilterBar from '@/shared/components/ui/SearchFilterBar.vue';
  import ActionIconGroup from '@/shared/components/ui/ActionIconGroup.vue';

  const { t } = useI18n();
  const toast = useToast();

  const {
    users,
    loading,
    currentPage,
    pageSize,
    totalPages,
    totalUsers,
    hasLoadedOnce,
    searchQuery,
    load,
    create,
    update,
  } = useAgentClients();

  // Modal states
  const showModal = ref(false);
  const showDetailsModal = ref(false);
  const isEditing = ref(false);
  const selectedUser = ref<User | null>(null);
  const editingUser = ref<User | null>(null);
  const formKey = ref(0);

  const handleSearch = debounce(() => {
    load(searchQuery.value);
  }, 300);

  const openCreateModal = () => {
    isEditing.value = false;
    editingUser.value = null;
    formKey.value++;
    showModal.value = true;
  };

  const openEditModal = (user: User) => {
    isEditing.value = true;
    editingUser.value = user;
    formKey.value++;
    showModal.value = true;
  };

  const openDetailsModal = (user: User) => {
    selectedUser.value = user;
    showDetailsModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
    editingUser.value = null;
  };

  const handleSubmit = async (payload: UserFormPayload) => {
    try {
      if (isEditing.value && editingUser.value) {
        await update(editingUser.value.id, payload);
        toast.success(t('users.view.userUpdated'));
      } else {
        await create(payload);
        toast.success(t('users.view.userCreated'));
      }
      closeModal();
    } catch (_e) {
      toast.error(handleApiError(_e).message);
    }
  };

  onMounted(() => {
    load();
  });
</script>
