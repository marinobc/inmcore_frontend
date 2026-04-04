<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Mis Inmuebles</h1>
        <p class="text-gray-500 text-sm">Gestiona y filtra tus propiedades asignadas</p>
      </div>
      <fwb-button @click="showCreateEditModal = true" gradient="blue">
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Registrar Nuevo
        </div>
      </fwb-button>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-wider">Buscar por título</label>
          <fwb-input v-model="filterTitle" placeholder="Ej: Departamento..." @input="handleFilterDebounce" />
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-wider">Tipo de Operación</label>
          <select v-model="filterOpType" @change="load" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-blue-500">
            <option value="">Todos los tipos</option>
            <option value="VENTA">Venta</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="ANTICRETICO">Anticrético</option>
          </select>
        </div>
        <div class="flex justify-end">
          <fwb-button color="alternative" size="sm" @click="clearAllFilters">Limpiar Filtros</fwb-button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10 dark:text-white">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-500">Cargando tus propiedades...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card v-for="p in myProperties" :key="p.id" class="flex flex-col h-full overflow-hidden border-gray-200 dark:border-gray-700 relative">
        <!-- Action Buttons -->
        <div class="absolute top-2 right-2 z-10 flex gap-1">
          <button
            @click="openEditModal(p)"
            class="bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors shadow-lg"
            title="Editar propiedad"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button
            v-if="isAdmin"
            @click="confirmDelete(p)"
            class="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-lg"
            title="Eliminar propiedad"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>

        <div class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
          <img v-if="p.imageUrls?.length" :src="p.imageUrls[0]" class="h-full w-full object-cover">
          <span v-else>Sin imágenes</span>
          <div class="absolute bottom-2 right-2">
            <fwb-badge :type="p.status === 'DISPONIBLE' ? 'green' : 'red'">{{ p.status }}</fwb-badge>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <div class="flex gap-2 mb-3">
            <fwb-badge :type="getOpTypeBadge(p.operationType)">{{ p.operationType }}</fwb-badge>
            <fwb-badge type="dark">{{ p.type }}</fwb-badge>
          </div>
          
          <h5 class="text-xl font-bold dark:text-white mb-1">{{ p.title }}</h5>
          <p class="text-sm text-gray-500 mb-4">{{ p.address }}</p>
          
          <div class="mt-auto">
            <p class="text-2xl font-black text-blue-600">${{ p.price.toLocaleString() }}</p>
            
            <!-- Document Upload Section -->
            <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <document-upload 
                :property-id="p.id" 
                :agent-id="p.assignedAgentId || undefined"
              />
            </div>
          </div>
        </div>
      </fwb-card>
    </div>

    <div v-if="!loading && myProperties.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
       <p class="text-gray-500">No tienes inmuebles que coincidan con la búsqueda.</p>
    </div>

    <!-- Create/Edit Modal -->
    <fwb-modal v-if="showCreateEditModal" @close="closeCreateEditModal" size="2xl">
      <template #header>
        <div class="text-lg font-bold">{{ isEditing ? 'Editar Propiedad' : 'Nuevo Inmueble' }}</div>
      </template>
      <template #body>
        <property-form 
          :key="formKey"
          :initial-data="editingProperty"
          :property-id="editingProperty?.id"
          @submit="handleCreateEdit"
          @cancel="closeCreateEditModal"
        />
      </template>
    </fwb-modal>

    <!-- Delete Confirmation Modal -->
    <fwb-modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <div class="text-lg font-bold text-red-600">Confirmar Eliminación</div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p>¿Estás seguro de que deseas eliminar la propiedad <strong>{{ propertyToDelete?.title }}</strong>?</p>
          <p class="text-sm text-red-500">Esta acción eliminará permanentemente la propiedad, sus imágenes y documentos asociados. No se puede deshacer.</p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <fwb-button color="alternative" @click="showDeleteModal = false">Cancelar</fwb-button>
          <fwb-button color="red" @click="doDeleteProperty" :disabled="deleting">
            {{ deleting ? 'Eliminando...' : 'Eliminar Permanentemente' }}
          </fwb-button>
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { FwbCard, FwbButton, FwbModal, FwbInput, FwbBadge } from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { useAuth } from '../composables/useAuth'
import { api } from '../services/api'
import type { Property } from '../types/property'
import PropertyForm from '../components/properties/PropertyForm.vue'
import DocumentUpload from '../components/properties/DocumentUpload.vue'

const { user } = useAuth()
const myProperties = ref<Property[]>([])
const loading = ref(false)
const deleting = ref(false)
const showCreateEditModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingProperty = ref<Property | null>(null)
const propertyToDelete = ref<Property | null>(null)
const formKey = ref(0)

// Filtros
const filterTitle = ref('')
const filterOpType = ref('')
let debounceTimer: any = null

const isAdmin = computed(() => {
  const roles = user.value?.roles || []
  return roles.includes('ADMIN') || user.value?.userType === 'ADMIN'
})

const load = async () => {
  loading.value = true
  try {
    const agentId = user.value?.userId || user.value?.sub
    const response = await api.get('/properties', {
      params: {
        title: filterTitle.value || undefined,
        operationType: filterOpType.value || undefined,
        agentId: agentId
      }
    })
    myProperties.value = response.data.data || response.data
  } catch (e) {
    console.error("Error cargando inventario:", e)
  } finally {
    loading.value = false
  }
}

const handleFilterDebounce = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 500)
}

const clearAllFilters = () => {
  filterTitle.value = ''
  filterOpType.value = ''
  load()
}

const getOpTypeBadge = (type: string) => {
  switch (type) {
    case 'VENTA': return 'indigo'
    case 'ALQUILER': return 'green'
    case 'ANTICRETICO': return 'yellow'
    default: return 'dark'
  }
}

const openEditModal = (property: Property) => {
  editingProperty.value = { ...property }
  isEditing.value = true
  formKey.value++
  showCreateEditModal.value = true
}

const openCreateModal = () => {
  editingProperty.value = null
  isEditing.value = false
  formKey.value++
  showCreateEditModal.value = true
}

const closeCreateEditModal = () => {
  showCreateEditModal.value = false
  editingProperty.value = null
}

const handleCreateEdit = async (data: any) => {
  try {
    if (isEditing.value && editingProperty.value) {
      // For editing, update price and operation type
      if (data.price !== editingProperty.value.price) {
        await propertyService.updatePrice(editingProperty.value.id, data.price)
      }
      if (data.operationType !== editingProperty.value.operationType) {
        await api.patch(`/properties/${editingProperty.value.id}/operation-type`, { operationType: data.operationType })
      }
      alert('Propiedad actualizada con éxito')
    } else {
      await propertyService.createProperty(data)
      alert('Inmueble registrado con éxito')
    }
    closeCreateEditModal()
    await load()
  } catch (e: any) {
    alert('Error: ' + (e.response?.data?.detail || 'Error de conexión'))
  }
}

const confirmDelete = (property: Property) => {
  propertyToDelete.value = property
  showDeleteModal.value = true
}

const doDeleteProperty = async () => {
  if (!propertyToDelete.value) return
  
  deleting.value = true
  try {
    await api.delete(`/properties/${propertyToDelete.value.id}`)
    showDeleteModal.value = false
    await load()
    alert('Propiedad eliminada exitosamente')
  } catch (e: any) {
    console.error('Error eliminando propiedad:', e)
    alert(e.response?.data?.detail || 'Error al eliminar la propiedad')
  } finally {
    deleting.value = false
    propertyToDelete.value = null
  }
}

onMounted(load)
</script>