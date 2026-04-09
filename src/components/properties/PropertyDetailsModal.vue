<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="4xl">
    <template #header>
      <div class="flex items-center space-x-4">
        <h3 class="text-2xl font-bold dark:text-white">{{ property.title }}</h3>
        <fwb-badge :color="getStatusColor(property.status)">{{ property.status }}</fwb-badge>
      </div>
    </template>

    <template #body>
      <div class="grid grid-cols-1 gap-8" :class="{ 'lg:grid-cols-2': !isClientView }">
        
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
             <h4 class="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Ficha Técnica</h4>
             <div class="grid grid-cols-2 gap-y-3 text-sm">
               <span class="text-gray-500 font-medium">Ubicación:</span> 
               <span class="dark:text-white text-right">{{ property.address }}</span>
               
               <span class="text-gray-500 font-medium">Área:</span> 
               <span class="dark:text-white text-right">{{ property.m2 }} m²</span>
               
               <span class="text-gray-500 font-medium">Dormitorios:</span> 
               <span class="dark:text-white text-right">{{ property.rooms }}</span>
               
               <span class="text-gray-500 font-medium">Tipo:</span> 
               <span class="dark:text-white text-right">{{ property.type }}</span>
               
               <span class="text-gray-500 font-medium">Estado actual:</span> 
               <div class="flex justify-end">
                 <select 
                   v-if="!isClientView"
                   v-model="localStatus" 
                   @change="handleStatusChange"
                   :disabled="updatingStatus || (property.status === 'VENDIDO' && !isAdmin)"
                   class="text-xs font-bold rounded-lg border-gray-300 py-1 px-2 dark:bg-gray-700 dark:text-white"
                   :class="statusColorClass(localStatus)"
                 >
                   <option value="DISPONIBLE">DISPONIBLE</option>
                   <option value="RESERVADO">RESERVADO</option>
                   <option value="EN_NEGOCIACION">EN NEGOCIACIÓN</option>
                   <option value="VENDIDO">VENDIDO</option>
                 </select>
                 <span v-else class="dark:text-white text-right" :class="statusTextClass(property.status)">
                   {{ property.status }}
                 </span>
               </div>
             </div>
          </div>
          
          <!-- Imagen principal de la propiedad -->
          <div v-if="property.imageUrls?.length" class="rounded-xl overflow-hidden bg-gray-200 shadow-sm">
            <img :src="property.imageUrls[0]" class="w-full h-64 object-cover" alt="Imagen principal de la propiedad">
          </div>
          <div v-else class="h-64 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <div class="text-center">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="text-gray-500 dark:text-gray-400 text-sm">No hay fotos disponibles</p>
            </div>
          </div>
          
          <!-- Tarjeta del Responsable (Propietario) -->
          <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h4 class="text-xs font-black text-green-600 uppercase tracking-widest mb-3">Responsable de la Propiedad</h4>
            
            <div v-if="loadingOwner" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span class="ml-2 text-sm text-gray-500">Cargando...</span>
            </div>
            
            <div v-else-if="owner" class="flex items-start space-x-3">
              <!-- Avatar del propietario -->
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-lg">
                    {{ owner.firstName?.charAt(0) }}{{ owner.lastName?.charAt(0) }}
                  </span>
                </div>
              </div>
              
              <!-- Información del propietario -->
              <div class="flex-1 min-w-0">
                <h5 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ owner.firstName }} {{ owner.lastName }}
                </h5>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Propietario</p>
                
                <!-- Información de contacto -->
                <div class="space-y-1">
                  <div v-if="owner.email" class="flex items-center text-xs text-gray-600 dark:text-gray-300">
                    <svg class="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span class="truncate">{{ owner.email }}</span>
                  </div>
                  
                  <div v-if="owner.phone" class="flex items-center text-xs text-gray-600 dark:text-gray-300">
                    <svg class="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span>{{ owner.phone }}</span>
                  </div>
                </div>
                
                <!-- Botones de contacto directo -->
                <div class="flex gap-2 mt-3">
                  <fwb-button 
                    v-if="owner.phone" 
                    @click="contactViaWhatsApp" 
                    size="xs" 
                    color="green"
                    class="flex-1"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </fwb-button>
                  <!--
                  <fwb-button 
                    v-if="owner.email" 
                    @click="contactViaEmail" 
                    size="xs" 
                    color="blue"
                    class="flex-1"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    Email
                  </fwb-button>-->
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-6">
              <svg class="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <p class="text-xs text-gray-500 dark:text-gray-400">No hay propietario asignado</p>
            </div>
          </div>
        </div>

        <div v-if="!isClientView" class="space-y-6">
          <div class="relative pl-6 border-l-2 border-yellow-400">
            <div class="absolute -left-[9px] top-0 w-4 h-4 bg-yellow-400 rounded-full border-4 border-white dark:border-gray-900"></div>
            <h4 class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4">Evolución de Precio</h4>
            
            <div v-if="property.priceHistory?.length" class="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="(h, i) in property.priceHistory" :key="i" class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-400 line-through">${{ h.oldPrice.toLocaleString() }}</span>
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    <span class="text-sm font-bold text-green-600">${{ h.newPrice.toLocaleString() }}</span>
                  </div>
                  <span class="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 font-mono">{{ formatDate(h.changedAt) }}</span>
                </div>
                <p class="text-[10px] text-gray-400">Modificado por: <span class="text-gray-600 dark:text-gray-300 font-medium">{{ h.changedBy }}</span></p>
              </div>
            </div>
            <div v-else class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic">
              Precio original sin modificaciones.
            </div>
          </div>

          <div class="relative pl-6 border-l-2 border-blue-500">
            <div class="absolute -left-[9px] top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900"></div>
            <h4 class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4">Registro de Asignaciones</h4>

            <div v-if="property.assignmentHistory?.length" class="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="(ah, i) in property.assignmentHistory" :key="i" class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                <p class="text-xs dark:text-gray-200">Agente previo: <span class="font-bold text-blue-600">{{ ah.agentId }}</span></p>
                <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                  <p class="text-[10px] text-gray-400">Asignado por: {{ ah.assignedBy }}</p>
                  <span class="text-[10px] text-gray-400 font-mono">{{ formatDate(ah.assignedAt) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic">
              Se mantiene el asesor inicial.
            </div>
          </div>

          <!-- Historial de Estados (PA2) -->
          <div class="relative pl-6 border-l-2 border-red-500">
            <div class="absolute -left-[9px] top-0 w-4 h-4 bg-red-500 rounded-full border-4 border-white dark:border-gray-900"></div>
            <h4 class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4">Historial de Estados</h4>
            
            <div v-if="property.statusHistory?.length" class="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="(h, i) in [...property.statusHistory].reverse()" :key="i" class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center space-x-1">
                    <span class="text-[10px] font-bold text-gray-400">{{ h.oldStatus }}</span>
                    <svg class="w-2 h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                    <span class="text-[10px] font-bold" :class="statusTextClass(h.newStatus)">{{ h.newStatus }}</span>
                  </div>
                  <span class="text-[9px] text-gray-400 font-mono">{{ formatDate(h.changedAt) }}</span>
                </div>
                <p class="text-[9px] text-gray-500">Cambiado por: {{ h.changedBy }}</p>
              </div>
            </div>
            <div v-else class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic">
              Sin cambios de estado registrados.
            </div>
          </div>
        </div>
      </div>

    </template>
    <template #footer>
      <div class="flex justify-end">
        <fwb-button color="alternative" @click="$emit('close')">Cerrar</fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { FwbModal, FwbBadge, FwbButton } from 'flowbite-vue'
import { propertyService } from '../../services/propertyService'
import { personService } from '../../services/personService'
import { useAuth } from '../../composables/useAuth'

const props = defineProps<{ 
  show: boolean, 
  property: any,
  isClientView?: boolean
}>()

const emit = defineEmits(['close', 'status-updated'])
const { user } = useAuth()

const localStatus = ref(props.property.status)
const updatingStatus = ref(false)
const owner = ref<any>(null)
const loadingOwner = ref(false)

const isAdmin = computed(() => user.value?.roles?.includes('ADMIN') || user.value?.userType === 'ADMIN')

const loadOwnerInfo = async () => {
  if (!props.property?.ownerId) {
    owner.value = null
    return
  }

  loadingOwner.value = true
  try {
    owner.value = await personService.getPersonByAuthUserId(props.property.ownerId)
  } catch (error) {
    console.error('Error loading owner info:', error)
    owner.value = null
  } finally {
    loadingOwner.value = false
  }
}

// Watch for property changes to load owner info
watch(() => props.property, (newProperty) => {
  if (newProperty) {
    localStatus.value = newProperty.status
    loadOwnerInfo()
  }
}, { immediate: true })

const handleStatusChange = async () => {
  if (localStatus.value === props.property.status) return
  
  updatingStatus.value = true
  try {
    await propertyService.updateStatus(props.property.id, localStatus.value)
    alert('Estado actualizado correctamente')
    emit('status-updated') // Para refrescar la lista en el dashboard
  } catch (error: any) {
    localStatus.value = props.property.status // Revertir
    alert(error.response?.data?.detail || 'No tienes permisos para realizar este cambio')
  } finally {
    updatingStatus.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DISPONIBLE': return 'green'
    case 'RESERVADO': return 'yellow'
    case 'VENDIDO': return 'red'
    case 'EN_NEGOCIACION': return 'blue'
    default: return 'gray'
  }
}

const statusColorClass = (status: string) => {
  const map: any = {
    DISPONIBLE: 'text-green-600 border-green-200 bg-green-50',
    RESERVADO: 'text-yellow-600 border-yellow-200 bg-yellow-50',
    VENDIDO: 'text-red-600 border-red-200 bg-red-50',
    EN_NEGOCIACION: 'text-blue-600 border-blue-200 bg-blue-50'
  }
  return map[status] || ''
}

const statusTextClass = (status: string) => {
  const map: any = {
    DISPONIBLE: 'text-green-600',
    RESERVADO: 'text-yellow-600',
    VENDIDO: 'text-red-600',
    EN_NEGOCIACION: 'text-blue-600'
  }
  return map[status] || ''
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const contactViaWhatsApp = () => {
  if (!owner.value?.phone) return
  
  // Limpiar el número de teléfono (remover espacios, guiones, etc.)
  const cleanPhone = owner.value.phone.replace(/\D/g, '')
  
  // Crear mensaje predeterminado sobre la propiedad
  const message = encodeURIComponent(
    `Hola ${owner.value.firstName}, me contacto por la propiedad "${props.property.title}" ubicada en ${props.property.address}. ¿Podríamos coordinar una visita?`
  )
  
  // Abrir WhatsApp con el mensaje
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`
  window.open(whatsappUrl, '_blank')
}

const contactViaEmail = () => {
  if (!owner.value?.email) return
  
  // Crear asunto y cuerpo del email
  const subject = encodeURIComponent(`Consulta sobre propiedad: ${props.property.title}`)
  const body = encodeURIComponent(
    `Hola ${owner.value.firstName},\n\n` +
    `Me contacto por la propiedad "${props.property.title}" ubicada en ${props.property.address}.\n\n` +
    `Detalles de la propiedad:\n` +
    `- Área: ${props.property.m2} m²\n` +
    `- Dormitorios: ${props.property.rooms}\n` +
    `- Tipo: ${props.property.type}\n\n` +
    `¿Podríamos coordinar una visita?\n\n` +
    `Saludos,\n` +
    `${user.value?.firstName || ''} ${user.value?.lastName || ''}`
  )
  
  // Abrir cliente de email
  const emailUrl = `mailto:${owner.value.email}?subject=${subject}&body=${body}`
  window.open(emailUrl, '_blank')
}

// Watch para mantener localStatus sincronizado cuando cambia la propiedad
watch(() => props.property.status, (newStatus) => {
  localStatus.value = newStatus
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
}
</style>