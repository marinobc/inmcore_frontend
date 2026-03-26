<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Mis Clientes</h1>
      <fwb-button @click="openCreateModal" gradient="blue">
        Registrar Nuevo Cliente
      </fwb-button>
    </div>

    <div v-if="loading" class="text-center py-10">Cargando...</div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow border">
      <fwb-table hoverable>
        <fwb-table-head>
          <fwb-table-head-cell>Nombre</fwb-table-head-cell>
          <fwb-table-head-cell>Email</fwb-table-head-cell>
          <fwb-table-head-cell>Teléfono</fwb-table-head-cell>
          <fwb-table-head-cell>Presupuesto</fwb-table-head-cell>
          <fwb-table-head-cell>Acciones</fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="c in clients" :key="c.id">
            <fwb-table-cell>{{ c.fullName || c.firstName + ' ' + c.lastName }}</fwb-table-cell>
            <fwb-table-cell>{{ c.email }}</fwb-table-cell>
            <fwb-table-cell>{{ c.phone }}</fwb-table-cell>
            <fwb-table-cell>{{ c.budget ? `$${c.budget}` : '—' }}</fwb-table-cell>
            <fwb-table-cell>
              <button @click="openEditModal(c)" class="text-blue-600 hover:text-blue-800">
                Editar
              </button>
            </fwb-table-cell>
          </fwb-table-row>
        </fwb-table-body>
      </fwb-table>
    </div>

    <!-- Modal para crear/editar cliente -->
    <fwb-modal v-if="showModal" @close="closeModal">
      <template #header>
        <div class="text-lg font-semibold">
          {{ isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente' }}
        </div>
      </template>
      <template #body>
        <user-form
          :key="formKey"
          :initial-data="editingClient"
          :is-editing="isEditing"
          :client-only="true"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FwbButton, FwbTable, FwbTableHead, FwbTableHeadCell, FwbTableBody, FwbTableRow, FwbTableCell, FwbModal } from 'flowbite-vue';
import { personService } from '../services/personService';
import { userService } from '../services/userService';
import { useAuth } from '../composables/useAuth';
import UserForm from '../components/users/UserForm.vue';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  budget?: string;
  preferredContactMethod?: string;
  birthDate?: string;
}

const { user } = useAuth();
const clients = ref<Client[]>([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const editingClient = ref<Client | null>(null);
const formKey = ref(0);

const loadClients = async () => {
  loading.value = true;
  try {
    const data = await personService.getClientsForAgent();
    clients.value = data;
  } catch (error) {
    console.error('Error loading clients:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingClient.value = null;
  isEditing.value = false;
  formKey.value++;
  showModal.value = true;
};

const openEditModal = (client: Client) => {
  editingClient.value = { ...client };
  isEditing.value = true;
  formKey.value++;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSubmit = async (formData: any) => {
  try {
    if (isEditing.value && editingClient.value) {
      // Editar cliente existente (usando user-service)
      await personService.updateClientForAgent(editingClient.value.id, formData);
      alert('Cliente actualizado correctamente');
    } else {
      // Crear nuevo cliente (usando identity-service)
      const agentId = user.value?.userId || user.value?.sub;
      if (!agentId) throw new Error('No se pudo identificar al agente');
      await userService.createUser(formData, agentId);
      alert('Cliente creado exitosamente');
    }
    await loadClients();
    closeModal();
  } catch (error: any) {
    console.error('Error:', error);
    alert(error.response?.data?.detail || error.message || 'Error al procesar la solicitud');
  }
};

onMounted(loadClients);
</script>