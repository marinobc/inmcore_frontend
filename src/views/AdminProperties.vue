<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Gestión de Inventario</h1>
        <p class="text-gray-500 text-sm">Administración global y categorización de inmuebles</p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">Modo Administrador</fwb-badge>
        <fwb-button @click="openCreateModal" gradient="blue">Registrar Nuevo</fwb-button>
      </div>
    </div>

    <!-- Rest of the template remains the same... -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase">Buscar por título</label>
          <fwb-input v-model="filterTitle" placeholder="Ej: Condominio..." @input="handleFilterDebounce" />
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase">Tipo de Operación</label>
          <select v-model="filterOpType" @change="load" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white">
            <option value="">Todos los tipos</option>
            <option value="VENTA">Venta</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="ANTICRETICO">Anticrético</option>
          </select>
        </div>
        <div class="flex justify-end gap-2">
          <fwb-button color="alternative" size="sm" @click="clearAllFilters">Limpiar Filtros</fwb-button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-500">Cargando propiedades...</p>
    </div>

    <div v-else-if="allProperties.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed">
      <p class="text-gray-500">No se encontraron propiedades</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card v-for="p in allProperties" :key="p.id" class="flex flex-col h-full border-gray-200 dark:border-gray-700 relative">
        <div class="absolute top-2 left-2 z-10">
          <fwb-badge :type="getOpTypeBadge(p.operationType)">{{ p.operationType || 'No definido' }}</fwb-badge>
        </div>

        <!-- Delete Button -->
        <button
          @click="confirmDelete(p)"
          class="absolute top-2 right-2 z-10 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-lg"
          title="Eliminar propiedad"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>

        <!-- Edit Button -->
        <button
          @click="openEditModal(p)"
          class="absolute top-2 right-12 z-10 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors shadow-lg"
          title="Editar propiedad"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>

        <!-- Image Gallery -->
        <div class="relative h-48 bg-gray-100 dark:bg-gray-700">
          <div v-if="p.imageUrls && p.imageUrls.length > 0" class="relative h-full">
            <img 
              :src="p.imageUrls[0]" 
              class="h-full w-full object-cover"
              @error="handleImageError(p, $event)"
            />
            <div v-if="p.imageUrls.length > 1" class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              +{{ p.imageUrls.length - 1 }}
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
    Dueño: {{ getOwnerName(p.ownerId) || 'No asignado' }}
  </div>

        <div class="p-5 flex-1 flex flex-col">
          <h5 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ p.title || 'Sin título' }}</h5>
          <p class="text-sm text-gray-500 mb-4">{{ p.address || 'Sin dirección' }}</p>
          <p class="text-2xl font-black text-blue-600">${{ (p.price || 0).toLocaleString() }}</p>

          <!-- Document Upload Section for Admin -->
          <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <document-upload 
              :property-id="p.id" 
              :agent-id="p.assignedAgentId || undefined"
            />
          </div>

          <div class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <fwb-button size="sm" color="alternative" @click="prepPriceUpdate(p)">Precio</fwb-button>
            <fwb-button size="sm" color="alternative" @click="prepOpTypeUpdate(p)">Operación</fwb-button>
            <fwb-button size="sm" gradient="blue" @click="prepAssignment(p)">Agente</fwb-button>
            <fwb-button size="sm" gradient="purple" @click="prepOwnerAssignment(p)">Dueño</fwb-button>
          </div>
        </div>
      </fwb-card>
    </div>

    <!-- Modales -->
    <fwb-modal v-if="showPriceModal" @close="showPriceModal = false">
      <template #header><div class="text-lg font-bold">Modificar Precio</div></template>
      <template #body>
        <fwb-input v-model.number="newPrice" type="number" label="Nuevo Valor ($)" required />
      </template>
      <template #footer>
        <fwb-button color="alternative" @click="showPriceModal = false">Cancelar</fwb-button>
        <fwb-button @click="doPriceUpdate" gradient="blue">Confirmar</fwb-button>
      </template>
    </fwb-modal>

    <fwb-modal v-if="showOwnerModal" @close="showOwnerModal = false">
      <template #header><div class="text-lg font-bold">Asignar Propietario</div></template>
      <template #body>
        <select v-model="selectedOwnerId" class="w-full border rounded-lg p-2.5 dark:bg-gray-700">
          <option value="">Seleccione un dueño...</option>
          <option v-for="o in availableOwners" :key="o.id" :value="o.id">{{ o.fullName }}</option>
        </select>
      </template>
      <template #footer>
        <fwb-button @click="doAssignOwner" gradient="blue">Asignar</fwb-button>
      </template>
    </fwb-modal>

    <fwb-modal v-if="showOpTypeModal" @close="showOpTypeModal = false">
       <template #header><div class="text-lg font-bold">Cambiar Operación</div></template>
       <template #body>
         <select v-model="newOpType" class="w-full border rounded-lg p-2.5 dark:bg-gray-700">
            <option value="VENTA">Venta</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="ANTICRETICO">Anticrético</option>
         </select>
       </template>
       <template #footer>
         <fwb-button @click="doOpTypeUpdate" gradient="blue">Guardar</fwb-button>
       </template>
    </fwb-modal>

    <assign-agent-modal v-if="showAssignModal" :show="showAssignModal" :property="selectedProp" :agents="activeAgents" @confirm="doAssign" @close="showAssignModal = false" />
    
    <!-- Create/Edit Modal -->
    <fwb-modal v-if="showCreateEditModal" @close="closeCreateEditModal" size="2xl">
      <template #header>
        <div class="text-lg font-bold">{{ isEditing ? 'Editar Propiedad' : 'Registrar Propiedad' }}</div>
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
import { userService } from '../services/userService'
import { api } from '../services/api'
import type { Property } from '../types/property'
import AssignAgentModal from '../components/properties/AssignAgentModal.vue'
import PropertyForm from '../components/properties/PropertyForm.vue'
import DocumentUpload from '../components/properties/DocumentUpload.vue'

const allProperties = ref<Property[]>([])
const allUsers = ref<any[]>([])
const loading = ref(false)
const deleting = ref(false)
const filterTitle = ref('')
const filterOpType = ref('')
let debounceTimer: any = null

const showCreateEditModal = ref(false)
const showAssignModal = ref(false)
const showPriceModal = ref(false)
const showOpTypeModal = ref(false)
const showOwnerModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingProperty = ref<Property | null>(null)
const propertyToDelete = ref<Property | null>(null)
const formKey = ref(0)

const selectedProp = ref<Property | null>(null)
const newPrice = ref(0)
const newOpType = ref('')
const selectedOwnerId = ref('')

// COMPUTED
const activeAgents = computed(() => 
  allUsers.value.filter(u => (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') && u.status === 'ACTIVE')
)
const availableOwners = computed(() => 
  allUsers.value.filter(u => u.userType === 'OWNER' && u.status === 'ACTIVE')
)

const load = async () => {
  loading.value = true
  try {
    const filters: any = {}
    if (filterTitle.value) filters.title = filterTitle.value
    if (filterOpType.value) filters.operationType = filterOpType.value
    
    const response = await propertyService.getProperties(filters)
    
    if (response && response.data && Array.isArray(response.data)) {
      allProperties.value = response.data
    } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
      allProperties.value = response.data.data
    } else if (Array.isArray(response)) {
      allProperties.value = response
    } else {
      allProperties.value = []
    }
    
    try {
      const users = await userService.getUsers()
      allUsers.value = users
    } catch (userError) {
      console.error('Error cargando usuarios:', userError)
      allUsers.value = []
    }
  } catch (error) {
    console.error('Error cargando propiedades:', error)
    allProperties.value = []
  } finally {
    loading.value = false
  }
}

const handleFilterDebounce = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 500)
}

const clearAllFilters = () => { 
  filterTitle.value = ''; 
  filterOpType.value = ''; 
  load() 
}

const getOpTypeBadge = (type: string): any => {
  if (type === 'VENTA') return 'indigo'
  if (type === 'ALQUILER') return 'green'
  if (type === 'ANTICRETICO') return 'yellow'
  return 'dark'
}

const handleImageError = (property: Property, event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  console.warn(`Failed to load image for property ${property.id}`)
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
      // For editing, we need to handle differently - update only specific fields
      // The property service might not have a full update endpoint
      // For now, we'll update price and other fields individually
      if (data.price !== editingProperty.value.price) {
        await propertyService.updatePrice(editingProperty.value.id, data.price)
      }
      if (data.operationType !== editingProperty.value.operationType) {
        await api.patch(`/properties/${editingProperty.value.id}/operation-type`, { operationType: data.operationType })
      }
      // Update images if needed
      if (data.imageUrls && data.imageUrls.length > 0) {
        // Add new images to property
        for (const url of data.imageUrls) {
          if (!editingProperty.value.imageUrls?.includes(url)) {
            // This would need a specific endpoint to add images
            console.log('New image to add:', url)
          }
        }
      }
      alert('Propiedad actualizada con éxito')
    } else {
      await propertyService.createProperty(data)
      alert('Propiedad registrada con éxito')
    }
    closeCreateEditModal()
    await load()
  } catch (e: any) {
    console.error('Error:', e)
    alert('Error: ' + (e.response?.data?.detail || 'Error al procesar la solicitud'))
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

const prepAssignment = (p: Property) => { selectedProp.value = p; showAssignModal.value = true }
const prepOwnerAssignment = (p: Property) => { selectedProp.value = p; selectedOwnerId.value = p.ownerId || ''; showOwnerModal.value = true }
const prepPriceUpdate = (p: Property) => { selectedProp.value = p; newPrice.value = p.price || 0; showPriceModal.value = true }
const prepOpTypeUpdate = (p: Property) => { selectedProp.value = p; newOpType.value = p.operationType || 'VENTA'; showOpTypeModal.value = true }

const doPriceUpdate = async () => {
  if (!selectedProp.value) return
  try {
    await propertyService.updatePrice(selectedProp.value.id, newPrice.value)
    showPriceModal.value = false
    await load()
  } catch (e) { 
    console.error('Error actualizando precio:', e)
    alert('Error al actualizar el precio') 
  }
}

const doAssignOwner = async () => {
  if (!selectedProp.value) return
  try {
    await propertyService.assignOwner(selectedProp.value.id, { ownerId: selectedOwnerId.value })
    showOwnerModal.value = false
    await load()
    
    alert('Propietario asignado exitosamente')
  } catch (e: any) { 
    console.error('Error asignando propietario:', e)
    alert(e.response?.data?.detail || 'Error al asignar propietario')
  }
}

const doOpTypeUpdate = async () => {
  if (!selectedProp.value) return
  try {
    await api.patch(`/properties/${selectedProp.value.id}/operation-type`, { operationType: newOpType.value })
    showOpTypeModal.value = false
    await load()
  } catch (e) { 
    console.error('Error actualizando tipo de operación:', e)
    alert('Error al actualizar el tipo de operación') 
  }
}

const doAssign = async (agentId: string) => {
  if (!selectedProp.value) return
  try {
    await propertyService.assignAgent(selectedProp.value.id, { agentId })
    showAssignModal.value = false
    await load()
  } catch (e) { 
    console.error('Error asignando agente:', e)
    alert('Error al asignar agente') 
  }
}

const getOwnerName = (ownerId?: string) => {
  if (!ownerId) return null
  const owner = allUsers.value.find(u => u.id === ownerId)
  return owner?.fullName || (owner?.firstName + ' ' + owner?.lastName) || ownerId
}

onMounted(load)
</script>