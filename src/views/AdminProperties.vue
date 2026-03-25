<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Gestión de Inventario</h1>
        <p class="text-gray-500 text-sm">Panel de control global de inmuebles</p>
      </div>
      <fwb-badge type="indigo" size="sm">Vista Administrador</fwb-badge>
    </div>

    <!-- Grid de Tarjetas -->
    <div v-if="loading" class="text-center py-20 dark:text-white">Cargando inmuebles...</div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card v-for="p in allProperties" :key="p.id" class="flex flex-col h-full overflow-hidden border-gray-200 dark:border-gray-700">
        <!-- Imagen / Placeholder -->
        <div class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 relative">
          <img v-if="p.imageUrls?.length" :src="p.imageUrls[0]" class="h-full w-full object-cover">
          <span v-else>Sin imágenes</span>
          <div class="absolute top-2 right-2">
            <fwb-badge :type="p.status === 'DISPONIBLE' ? 'green' : 'red'">{{ p.status }}</fwb-badge>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-5 flex-1 flex flex-col">
          <h5 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">{{ p.title }}</h5>
          <p class="text-sm text-gray-500 mb-4">{{ p.address }}</p>
          
          <div class="flex justify-between items-end mt-auto">
            <div>
              <p class="text-xs text-gray-400 uppercase font-bold">Precio actual</p>
              <p class="text-2xl font-extrabold text-blue-600">${{ p.price.toLocaleString() }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 uppercase font-bold">Responsable</p>
              <p class="text-sm font-medium dark:text-gray-200">
                {{ resolveAgentName(p.assignedAgentId) }}
              </p>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <fwb-button size="sm" color="alternative" @click="prepPriceUpdate(p)" class="w-full">
              <div class="flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Precio
              </div>
            </fwb-button>
            <fwb-button size="sm" gradient="blue" @click="prepAssignment(p)" class="w-full">
              <div class="flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Asignar
              </div>
            </fwb-button>
          </div>
        </div>
      </fwb-card>
    </div>

    <!-- Mensaje si está vacío -->
    <div v-if="!loading && allProperties.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
       <p class="text-gray-500">No hay inmuebles registrados en el sistema.</p>
    </div>

    <!-- MODAL ASIGNAR AGENTE -->
    <assign-agent-modal
      v-if="showAssignModal"
      :show="showAssignModal"
      :property="selectedProp"
      :agents="activeAgents"
      @confirm="doAssign"
      @close="showAssignModal = false"
    />

    <!-- MODAL EDITAR PRECIO -->
    <fwb-modal v-if="showPriceModal" @close="showPriceModal = false">
      <template #header><div class="text-lg font-bold">Actualizar Precio de Mercado</div></template>
      <template #body>
        <div class="space-y-3">
          <p class="text-sm text-gray-500">Inmueble: <span class="font-bold text-gray-700 dark:text-white">{{ selectedProp?.title }}</span></p>
          <fwb-input v-model.number="newPrice" type="number" label="Nuevo Valor ($)" placeholder="Ej: 150000" required />
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
import { FwbCard, FwbButton, FwbModal, FwbInput, FwbBadge } from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { userService } from '../services/userService'
import AssignAgentModal from '../components/properties/AssignAgentModal.vue'

const allProperties = ref<any[]>([])
const allUsers = ref<any[]>([])
const loading = ref(false)
const selectedProp = ref<any>(null)
const showAssignModal = ref(false)
const showPriceModal = ref(false)
const newPrice = ref(0)

// Filtrar empleados/admins activos
const activeAgents = computed(() => 
  allUsers.value.filter(u => (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') && u.status === 'ACTIVE')
)

const load = async () => {
  loading.value = true
  try {
    const [p, u] = await Promise.all([propertyService.getProperties(), userService.getUsers()])
    allProperties.value = p
    allUsers.value = u
  } catch (e) {
    console.error("Error cargando datos:", e)
  } finally {
    loading.value = false
  }
}

const resolveAgentName = (id: string) => {
  if (!id) return 'Sin asignar'
  const u = allUsers.value.find(x => x.id === id)
  return u ? u.fullName : 'Cargando...'
}

const prepPriceUpdate = (p: any) => {
  selectedProp.value = p
  newPrice.value = p.price
  showPriceModal.value = true
}

const doPriceUpdate = async () => {
  try {
    await propertyService.updatePrice(selectedProp.value.id, newPrice.value)
    showPriceModal.value = false
    await load()
  } catch (e) { alert("Error al actualizar precio") }
}

const prepAssignment = (p: any) => {
  selectedProp.value = p
  showAssignModal.value = true
}

const doAssign = async (agentId: string) => {
  try {
    await propertyService.assignAgent(selectedProp.value.id, { agentId })
    showAssignModal.value = false
    await load()
  } catch (e: any) {
    alert(e.response?.data?.detail || "Error en la asignación")
  }
}

onMounted(load)
</script>