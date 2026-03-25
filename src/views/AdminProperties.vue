<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold dark:text-white">Gestión de Inventario</h1>
      <div class="text-sm text-gray-500">Total: {{ allProperties.length }} inmuebles</div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
      <fwb-table hoverable>
        <fwb-table-head>
          <fwb-table-head-cell>Inmueble</fwb-table-head-cell>
          <fwb-table-head-cell>Ubicación</fwb-table-head-cell>
          <fwb-table-head-cell>Precio</fwb-table-head-cell>
          <fwb-table-head-cell>Responsable</fwb-table-head-cell>
          <fwb-table-head-cell class="text-center">Acciones</fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="p in allProperties" :key="p.id" class="group">
            <fwb-table-cell class="font-medium">
              <div class="flex flex-col">
                <span class="text-gray-900 dark:text-white">{{ p.title }}</span>
                <span class="text-xs text-gray-400">{{ p.type }}</span>
              </div>
            </fwb-table-cell>
            <fwb-table-cell>{{ p.address }}</fwb-table-cell>
            <fwb-table-cell class="font-bold text-blue-600">${{ p.price.toLocaleString() }}</fwb-table-cell>
            <fwb-table-cell>
              <div v-if="p.assignedAgentId" class="flex items-center space-x-2">
                <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                  {{ resolveAgentName(p.assignedAgentId).charAt(0) }}
                </div>
                <span>{{ resolveAgentName(p.assignedAgentId) }}</span>
              </div>
              <span v-else class="text-orange-500 italic text-sm">Sin asignar</span>
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex justify-center space-x-2">
                <!-- BOTÓN EDITAR PRECIO (HU2) -->
                <fwb-button size="xs" color="alternative" @click="prepPriceUpdate(p)" title="Editar Precio">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </fwb-button>
                
                <!-- BOTÓN ASIGNAR EMPLEADO (HU3) -->
                <fwb-button size="xs" gradient="blue" @click="prepAssignment(p)" title="Asignar Responsable">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </fwb-button>
              </div>
            </fwb-table-cell>
          </fwb-table-row>
        </fwb-table-body>
      </fwb-table>
    </div>

    <!-- MODAL DE ASIGNACIÓN -->
    <assign-agent-modal
      :show="showAssignModal"
      :property="selectedProp"
      :agents="activeAgents"
      @confirm="doAssign"
      @close="showAssignModal = false"
    />

    <!-- MODAL DE EDICIÓN DE PRECIO -->
    <fwb-modal v-if="showPriceModal" @close="showPriceModal = false">
      <template #header>
        <div class="text-lg font-bold">Actualizar Precio de Lista</div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-500 italic">{{ selectedProp?.title }}</p>
          <fwb-input 
            v-model.number="newPrice" 
            type="number" 
            label="Nuevo Precio ($)" 
            placeholder="Ingrese el monto acordado"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <fwb-button color="alternative" @click="showPriceModal = false">Cancelar</fwb-button>
          <fwb-button @click="doPriceUpdate" gradient="blue">Guardar Cambio</fwb-button>
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  FwbTable, FwbTableHead, FwbTableHeadCell, FwbTableBody, 
  FwbTableRow, FwbTableCell, FwbButton, FwbModal, FwbInput 
} from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { userService } from '../services/userService'
import type { Property } from '../types/property'
import type { User } from '../types/user'
import AssignAgentModal from '../components/properties/AssignAgentModal.vue'

const allProperties = ref<Property[]>([])
const allUsers = ref<User[]>([])
const selectedProp = ref<Property | null>(null)
const showAssignModal = ref(false)
const showPriceModal = ref(false)
const newPrice = ref(0)

// Filtramos solo agentes que estén ACTIVOS para la asignación
const activeAgents = computed(() => 
  allUsers.value.filter(u => (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') && u.status === 'ACTIVE')
)

const load = async () => {
  try {
    const [propsRes, usersRes] = await Promise.all([
      propertyService.getProperties(),
      userService.getUsers()
    ])
    allProperties.value = propsRes
    allUsers.value = usersRes
  } catch (e) {
    console.error("Error al cargar datos de gestión", e)
  }
}

const resolveAgentName = (id: string) => {
  const agent = allUsers.value.find(u => u.id === id)
  return agent ? (agent.fullName || agent.firstName) : 'Cargando...'
}

const prepPriceUpdate = (p: Property) => {
  selectedProp.value = p
  newPrice.value = p.price
  showPriceModal.value = true
}

const doPriceUpdate = async () => {
  if (!selectedProp.value) return
  try {
    await propertyService.updatePrice(selectedProp.value.id, newPrice.value)
    showPriceModal.value = false
    await load()
  } catch (e: any) {
    alert(e.response?.data?.detail || 'Error al actualizar precio')
  }
}

const prepAssignment = (p: Property) => {
  selectedProp.value = p
  showAssignModal.value = true
}

const doAssign = async (agentId: string) => {
  if (!selectedProp.value) return
  try {
    await propertyService.assignAgent(selectedProp.value.id, { agentId })
    showAssignModal.value = false
    await load()
  } catch (e: any) {
    alert(e.response?.data?.detail || 'No se pudo asignar el agente')
  }
}

onMounted(load)
</script>