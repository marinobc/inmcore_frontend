<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">{{ t('agentOwners.title') }}</h1>
        <p class="text-gray-500 text-sm">{{ t('agentOwners.subtitle') }}</p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">
          {{ t('common.agent') }} {{ authStore.user?.fullName || t('common.agent') }}
        </fwb-badge>
        <fwb-button @click="openCreateModal" gradient="blue">
          <div class="flex items-center">
            <IconLucidePlus class="w-4 h-4 mr-2" />
            {{ t('agentOwners.newOwner') }}
          </div>
        </fwb-button>
      </div>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
    >
      <div class="relative max-w-md">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <IconLucideSearch class="w-5 h-5 text-gray-400" />
        </div>
        <input
          v-model="searchName"
          type="text"
          :placeholder="t('agentOwners.searchPlaceholder')"
          class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500">{{ t('agentOwners.loading') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card
        v-for="o in filteredOwners"
        :key="o.id"
        class="flex flex-col h-full overflow-hidden border-gray-200 dark:border-gray-700 relative"
      >
        <div
          class="h-32 bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center relative"
        >
          <div
            class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black uppercase shadow-inner"
          >
            {{ o.firstName?.charAt(0) }}{{ o.lastName?.charAt(0) }}
          </div>
          <div class="absolute bottom-2 right-2">
            <fwb-badge type="yellow">{{ t('common.ownerBadge') }}</fwb-badge>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <h5 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {{ o.fullName || `${o.firstName} ${o.lastName}` }}
          </h5>
          <p class="text-sm text-gray-500 mb-2 truncate">{{ o.email }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
            CI/NIT: {{ o.taxId || t('common.notAvailable') }}
          </p>

          <div class="flex justify-between items-end mt-auto">
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                {{ t('agentOwners.phone') }}
              </p>
              <p class="text-sm font-semibold dark:text-gray-200">
                {{ o.phone || t('common.notAvailable') }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 uppercase font-bold">
                {{ t('agentOwners.status') }}
              </p>
              <p
                class="text-sm font-semibold"
                :class="o.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'"
              >
                {{
                  o.status === 'ACTIVE'
                    ? t('users.status.active')
                    : o.status === 'INACTIVE'
                      ? t('users.status.inactive')
                      : o.status || t('common.notAvailable')
                }}
              </p>
            </div>
          </div>

          <div
            class="grid grid-cols-1 gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <fwb-button size="sm" color="alternative" @click="openEditModal(o)" class="w-full">
              {{ t('agentOwners.editProfile') }}
            </fwb-button>
          </div>
        </div>
      </fwb-card>
    </div>

    <div
      v-if="!loading && filteredOwners.length === 0"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed"
    >
      <p class="text-gray-500">{{ t('agentOwners.emptyText') }}</p>
    </div>

    <fwb-modal v-if="showModal" @close="closeModal">
      <template #header>
        <div class="text-lg font-bold dark:text-white">
          {{ isEditing ? t('agentOwners.editTitle') : t('agentOwners.createTitle') }}
        </div>
      </template>
      <template #body>
        <user-form
          :key="formKey"
          :initial-data="editingOwner || undefined"
          :is-editing="isEditing"
          :owner-only="true"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </fwb-modal>

    <div
      v-if="toast.visible"
      :class="[
        'fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all max-w-md',
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600',
      ]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucideSearch from '~icons/lucide/search';
  import { ref, computed, onMounted } from 'vue';
  import { FwbButton, FwbBadge, FwbModal, FwbCard } from 'flowbite-vue';
  import { userService } from '@/services/userService';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { personService } from '@/services/personService';
  import UserForm from '@/components/users/UserForm.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  interface Owner {
    id: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    taxId?: string;
    phone?: string;
    status?: string;
    userType: string;
    assignedAgentId?: string;
  }

  const authStore = useAuthStore();
  const owners = ref<Owner[]>([]);
  const loading = ref(false);
  const showModal = ref(false);
  const isEditing = ref(false);
  const editingOwner = ref<Record<string, unknown> | null>(null);
  const formKey = ref(0);
  const searchName = ref('');
  const toast = ref({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.value = { visible: true, message, type };
    setTimeout(() => {
      toast.value.visible = false;
    }, 5000);
  };

  const filteredOwners = computed(() => {
    const term = searchName.value.trim().toLowerCase();
    if (!term) return owners.value;
    return owners.value.filter((o) => {
      const name = (o.fullName || `${o.firstName || ''} ${o.lastName || ''}`).toLowerCase();
      const taxId = (o.taxId || '').toString().toLowerCase();
      return name.includes(term) || taxId.includes(term);
    });
  });

  const loadOwners = async () => {
    loading.value = true;
    try {
      const baseUsers = await userService.getUsers();
      const u = authStore.user as UserClaims | null;
      const agentId = u?.sub || u?.userId;

      const filteredBase = (baseUsers || []).filter((u: Owner) => {
        if (u.userType !== 'OWNER') return false;
        if (!agentId) return true;
        return !u.assignedAgentId || u.assignedAgentId === agentId;
      });

      owners.value = await Promise.all(
        filteredBase.map(async (u: Owner) => {
          try {
            const profile = await personService.getPersonByAuthUserId(u.id);
            return { ...u, ...profile };
          } catch {
            console.warn(`Sin perfil detallado para: ${u.id}`);
            return u;
          }
        })
      );
    } catch (e) {
      console.error('Error loading owners:', e);
      showToast(t('agentOwners.loadError'), 'error');
    } finally {
      loading.value = false;
    }
  };

  const openCreateModal = () => {
    editingOwner.value = {
      userType: 'OWNER',
    };
    isEditing.value = false;
    formKey.value++;
    showModal.value = true;
  };

  const openEditModal = (owner: Owner) => {
    editingOwner.value = { ...owner } as Record<string, unknown>;
    isEditing.value = true;
    formKey.value++;
    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
  };

  const hasDuplicateTaxId = (taxId: string, currentId?: string) => {
    const normalized = (taxId || '').toString().trim().toLowerCase();
    if (!normalized) return false;

    return owners.value.some(
      (o) => (o.taxId || '').toString().trim().toLowerCase() === normalized && o.id !== currentId
    );
  };

  const handleSubmit = async (formData: Record<string, unknown>) => {
    const taxId = (formData.taxId || '').toString().trim();
    if (hasDuplicateTaxId(taxId, editingOwner.value?.id as string | undefined)) {
      showToast(t('agentOwners.duplicateTaxId'), 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        taxId: formData.taxId?.toString().trim(),
        userType: 'OWNER',
        roleIds: ['rol_owner'],
      };

      if (isEditing.value && editingOwner.value) {
        await userService.updateUser(editingOwner.value.id as string, payload);
        showToast(t('agentOwners.updated'));
      } else {
        const u = authStore.user as UserClaims | null;
        const agentId = u?.sub || u?.userId;
        await userService.createUser({
          ...payload,
          assignedAgentId: agentId,
        });
        showToast(t('agentOwners.created'));
      }

      await loadOwners();
      closeModal();
    } catch {
      showToast(t('agentOwners.processError'), 'error');
    }
  };

  onMounted(loadOwners);
</script>
