<template>
  <PropertyListingView
    ref="listingRef"
    mode="admin"
    title="adminProperties.title"
    subtitle="adminProperties.subtitle"
    show-filters
    @prep-price="
      selectedProp = $event;
      showPriceModal = true;
    "
    @prep-op="
      selectedProp = $event;
      showOpTypeModal = true;
    "
    @prep-agent="
      selectedProp = $event;
      showAssignModal = true;
    "
    @prep-owner="
      selectedProp = $event;
      showOwnerModal = true;
    "
  />

  <PropertyPriceModal
    v-if="showPriceModal"
    :property="selectedProp"
    @close="showPriceModal = false"
    @updated="refresh"
  />
  <PropertyOpTypeModal
    v-if="showOpTypeModal"
    :property="selectedProp"
    @close="showOpTypeModal = false"
    @updated="refresh"
  />
  <PropertyOwnerModal
    v-if="showOwnerModal"
    :property="selectedProp"
    :owners="availableOwners"
    @close="showOwnerModal = false"
    @updated="refresh"
  />
  <AssignAgentModal
    v-if="showAssignModal"
    :show="showAssignModal"
    :property="selectedProp"
    :agents="activeAgents"
    @confirm="doAssignAgent"
    @close="showAssignModal = false"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useToast } from '@/shared/composables/useToast';
  import { useI18n } from 'vue-i18n';
  import { propertyService } from '../services/propertyService';
  import { userService } from '@/modules/users/services/userService';
  import type { Property } from '../types/property';
  import type { User } from '@/modules/users/types/user';

  import PropertyListingView from '../components/PropertyListingView.vue';
  import PropertyPriceModal from '../components/PropertyPriceModal.vue';
  import PropertyOpTypeModal from '../components/PropertyOpTypeModal.vue';
  import PropertyOwnerModal from '../components/PropertyOwnerModal.vue';
  import AssignAgentModal from '../components/AssignAgentModal.vue';

  const { t } = useI18n();
  const toast = useToast();
  const listingRef = ref<InstanceType<typeof PropertyListingView> | null>(null);
  const selectedProp = ref<Property | null>(null);
  const showPriceModal = ref(false);
  const showOpTypeModal = ref(false);
  const showOwnerModal = ref(false);
  const showAssignModal = ref(false);
  const allUsers = ref<User[]>([]);

  const activeAgents = computed(() =>
    allUsers.value.filter(
      (u) => (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') && u.status === 'ACTIVE'
    )
  );
  const availableOwners = computed(() =>
    allUsers.value.filter((u) => u.userType === 'OWNER' && u.status === 'ACTIVE')
  );

  async function loadUsers() {
    userService
      .getUsers(0, 1000)
      .then((res) => (allUsers.value = res.data || []))
      .catch(console.error);
  }
  const refresh = () => {
    listingRef.value?.refresh();
  };

  async function doAssignAgent(agentId: string) {
    if (!selectedProp.value) return;
    try {
      await propertyService.assignAgent(selectedProp.value.id, { agentId });
      toast.success(t('adminProperties.propertyUpdated'));
      showAssignModal.value = false;
      refresh();
    } catch {
      toast.error(t('common.error'));
    }
  }

  onMounted(loadUsers);
</script>
