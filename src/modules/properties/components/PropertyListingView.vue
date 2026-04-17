<template>
  <div>
    <PageHeader :title="t(title)" :subtitle="t(subtitle)">
      <template #actions>
        <fwb-badge v-if="mode === 'admin'" type="indigo" class="px-3 py-1">
          {{ t('adminProperties.adminMode') }}
        </fwb-badge>
        <fwb-button
          v-if="canCreate"
          @click="openCreateModal"
          color="blue"
          class="inline-flex items-center gap-2"
        >
          <IconLucidePlus class="w-4 h-4" />
          <span>{{ t('common.addNew') }}</span>
        </fwb-button>
      </template>
    </PageHeader>

    <PageContainer class="space-y-8">
      <PropertyFilters
        v-if="showFilters"
        v-model:filters="filters"
        :show-status="mode === 'admin'"
        :hide-status="mode === 'agent'"
        @apply="load"
        @clear="load"
      />

      <div v-if="loading" class="flex justify-center py-20">
        <IconLucideLoader class="animate-spin h-10 w-10 text-blue-600" />
      </div>

      <div
        v-else-if="properties.length === 0"
        class="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
      >
        <p class="text-gray-500">{{ t('common.noResults') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <PropertyCard
          v-for="p in properties"
          :key="p.id"
          :property="p"
          :is-favorite="favorites.has(p.id)"
          :show-favorite="mode === 'client'"
          :show-document-upload="mode === 'admin' || mode === 'agent'"
          @click="viewDetails(p)"
          @toggle-favorite="toggleFavorite(p.id)"
        >
          <template #action>
            <ActionIconGroup
              v-if="mode === 'admin' || mode === 'agent'"
              variant="square"
              :actions="getPropertyActions(p)"
              @action="handlePropertyAction($event, p)"
            />
            <div
              v-if="mode === 'owner'"
              class="bg-blue-600 text-white rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <IconLucideEye class="w-4 h-4" />
              {{ p.visitCount || 0 }}
            </div>
          </template>
          <template #footer-extra>
            <slot name="card-footer" :property="p"></slot>
            <GridButtonGroup
              v-if="mode === 'admin'"
              container-class="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700"
              :buttons="getAdminButtons(p)"
              @click="handleAdminAction($event, p)"
            />
          </template>
        </PropertyCard>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total="totalElements"
        @change="loadPage"
      />
    </PageContainer>

    <!-- Modals -->
    <PropertyDetailsModal
      v-if="showDetailsModal"
      :show="showDetailsModal"
      :property="selectedProp"
      :is-client-view="mode === 'client'"
      @close="showDetailsModal = false"
      @status-updated="load"
    />

    <fwb-modal v-if="showCreateEditModal" @close="showCreateEditModal = false" size="2xl">
      <template #header>
        <div class="text-lg font-bold">
          {{ isEditing ? t('common.edit') : t('common.addNew') }}
        </div>
      </template>
      <template #body>
        <PropertyForm
          :key="formKey"
          :initial-data="editingProperty || undefined"
          :property-id="editingProperty?.id"
          @submit="handleCreateEdit"
          @cancel="showCreateEditModal = false"
        />
      </template>
    </fwb-modal>

    <ConfirmModal
      v-model="showDeleteModal"
      :title="t('common.confirmDelete')"
      :message="t('common.confirmDeleteText', { name: propertyToDelete?.title })"
      confirm-color="red"
      @confirm="doDeleteProperty"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbBadge, FwbButton, FwbModal } from 'flowbite-vue';
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucidePencil from '~icons/lucide/pencil';
  import IconLucideTrash from '~icons/lucide/trash';
  import IconLucideLoader from '~icons/lucide/loader';
  import IconLucideEye from '~icons/lucide/eye';

  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';

  import { useProperties } from '../composables/useProperties';
  import { propertyService } from '../services/propertyService';
  import { useToast } from '@/shared/composables/useToast';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import type { Property, PropertyFormPayload } from '../types/property';

  import PropertyCard from '../components/PropertyCard.vue';
  import PropertyFilters from '../components/PropertyFilters.vue';
  import PropertyDetailsModal from '../components/PropertyDetailsModal.vue';
  import PropertyForm from '../components/PropertyForm.vue';
  import ConfirmModal from '@/shared/components/ui/ConfirmModal.vue';
  import Pagination from '@/shared/components/ui/Pagination.vue';
  import ActionIconGroup, { type ActionIconItem } from '@/shared/components/ui/ActionIconGroup.vue';
  import GridButtonGroup, { type GridButtonItem } from '@/shared/components/ui/GridButtonGroup.vue';

  const { t } = useI18n();
  const toast = useToast();
  const authStore = useAuthStore();
  const {
    properties,
    loading,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    filters,
    favorites,
    load,
    loadPage,
    toggleFavorite,
  } = useProperties();

  const props = defineProps<{
    mode: 'admin' | 'agent' | 'owner' | 'client' | 'favorites';
    title: string;
    subtitle: string;
    showFilters?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'prep-price', property: Property): void;
    (e: 'prep-op', property: Property): void;
    (e: 'prep-agent', property: Property): void;
    (e: 'prep-owner', property: Property): void;
  }>();

  const showCreateEditModal = ref(false);
  const showDeleteModal = ref(false);
  const showDetailsModal = ref(false);
  const isEditing = ref(false);
  const editingProperty = ref<Property | null>(null);
  const propertyToDelete = ref<Property | null>(null);
  const selectedProp = ref<Property | null>(null);
  const formKey = ref(0);

  const currentUserId = computed(
    () => (authStore.user as UserClaims)?.userId || (authStore.user as UserClaims)?.sub
  );
  const canCreate = computed(() => props.mode === 'admin' || props.mode === 'agent');

  const getPropertyActions = (_p: Property): ActionIconItem[] => [
    {
      id: 'edit',
      icon: IconLucidePencil,
      tooltip: t('common.edit'),
      color: 'blue',
    },
    {
      id: 'delete',
      icon: IconLucideTrash,
      tooltip: t('common.delete'),
      color: 'red',
      show: props.mode === 'admin',
    },
  ];

  const handlePropertyAction = (actionId: string, p: Property) => {
    if (actionId === 'edit') openEditModal(p);
    else if (actionId === 'delete') confirmDelete(p);
  };

  const getAdminButtons = (_p: Property): GridButtonItem[] => [
    { id: 'price', label: t('adminProperties.price'), color: 'alternative' },
    { id: 'op', label: t('adminProperties.operation'), color: 'alternative' },
    { id: 'agent', label: t('adminProperties.agent'), color: 'blue' },
    { id: 'owner', label: t('adminProperties.ownerLabel'), color: 'purple' },
  ];

  const handleAdminAction = (id: string, p: Property) => {
    switch (id) {
      case 'price':
        emit('prep-price', p);
        break;
      case 'op':
        emit('prep-op', p);
        break;
      case 'agent':
        emit('prep-agent', p);
        break;
      case 'owner':
        emit('prep-owner', p);
        break;
    }
  };

  const viewDetails = (p: Property) => {
    selectedProp.value = p;
    showDetailsModal.value = true;
  };
  const openCreateModal = () => {
    editingProperty.value = null;
    isEditing.value = false;
    formKey.value++;
    showCreateEditModal.value = true;
  };
  const openEditModal = (p: Property) => {
    editingProperty.value = p;
    isEditing.value = true;
    formKey.value++;
    showCreateEditModal.value = true;
  };
  const confirmDelete = (p: Property) => {
    propertyToDelete.value = p;
    showDeleteModal.value = true;
  };

  onMounted(() => {
    if (props.mode === 'agent') filters.value.agentId = currentUserId.value || '';
    if (props.mode === 'owner') filters.value.agentId = currentUserId.value || ''; // Owner uses same filter param in backend often, or handled by useProperties
    load();
  });

  async function handleCreateEdit(data: PropertyFormPayload) {
    try {
      if (isEditing.value && editingProperty.value) {
        if (props.mode === 'agent')
          await propertyService.updatePropertyAsAgent(editingProperty.value.id, data);
        else await propertyService.updateProperty(editingProperty.value.id, data);
      } else await propertyService.createProperty(data);
      toast.success(t('common.success'));
      showCreateEditModal.value = false;
      load();
    } catch {
      toast.error(t('common.error'));
    }
  }

  async function doDeleteProperty() {
    try {
      if (propertyToDelete.value) {
        await propertyService.deleteProperty(propertyToDelete.value.id);
        toast.success(t('common.success'));
        showDeleteModal.value = false;
        load();
      }
    } catch {
      toast.error(t('common.error'));
    }
  }

  defineExpose({ refresh: load });
</script>
