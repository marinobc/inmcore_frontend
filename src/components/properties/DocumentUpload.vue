<template>
  <div class="space-y-4">
    <!-- Upload Button -->
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Documentos</h4>
      <fwb-button 
        v-if="canUpload" 
        size="xs" 
        gradient="blue"
        @click="triggerFileInput"
        :disabled="uploading"
      >
        <div class="flex items-center gap-1">
          <svg v-if="!uploading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ uploading ? 'Subiendo...' : 'Subir Contrato de Exclusividad' }}
        </div>
      </fwb-button>
    </div>

    <!-- Document List -->
    <div v-if="documents.length > 0" class="space-y-2">
      <div 
        v-for="doc in documents" 
        :key="doc.id"
        class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <!-- Document Icon -->
          <svg class="w-8 h-8 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ doc.originalFileName }}
            </p>
            <div class="flex items-center gap-2 mt-0.5">
              <span :class="statusBadge(doc.status)" class="text-xs px-2 py-0.5 rounded-full">
                {{ statusLabel(doc.status) }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatFileSize(doc.fileSize) }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatDate(doc.uploadedAt) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <!-- Download Button (US1 AC1) with 10-second expiration and permanent consumption via localStorage -->
          <button
            @click="downloadDocument(doc)"
            :disabled="!isAdmin && (isDownloadExpired(doc.id) || isDocumentDownloaded(doc.id))"
            :title="isAdmin ? 'Descargar' : (isDocumentDownloaded(doc.id) ? 'Descarga ya utilizada' : (isDownloadExpired(doc.id) ? 'Link expirado. Haz click para obtener uno nuevo' : 'Descargar (expira en ' + (getDownloadTimeRemaining(doc.id) || '10') + 's)'))"
            :class="[
              'p-2 rounded-lg transition-colors relative',
              (!isAdmin && (isDownloadExpired(doc.id) || isDocumentDownloaded(doc.id)))
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
            ]"
          >
            <div class="flex items-center gap-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              <span v-if="!isAdmin && getDownloadTimeRemaining(doc.id)" class="text-xs font-semibold">{{ getDownloadTimeRemaining(doc.id) }}s</span>
            </div>
          </button>

          <!-- Permission Settings (Admin only - US2) -->
          <!-- <button
            v-if="isAdmin"
            @click="openPermissionModal(doc)"
            class="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title="Configurar permisos"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </button> -->

          <!-- Delete Button -->
          <button
            v-if="isAdmin"
            @click="deleteDocument(doc)"
            class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Eliminar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed">
      <p class="text-sm text-gray-500">No hay documentos subidos</p>
      <p v-if="canUpload" class="text-xs text-gray-400 mt-1">
        Sube el contrato de exclusividad para legalizar la propiedad
      </p>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept=".pdf,.doc,.docx"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Permission Modal (US2) -->
    <fwb-modal v-if="showPermissionModal" @close="showPermissionModal = false">
      <template #header>
        <div class="text-lg font-bold">Configurar Permisos de Documento</div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Documento: <span class="font-bold">{{ selectedDoc?.originalFileName }}</span>
          </p>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Roles con acceso
            </label>
            <div class="space-y-2">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="permissionForm.roles.ADMIN" value="ROLE_ADMIN">
                <span>Administradores</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="permissionForm.roles.AGENT" value="ROLE_AGENT">
                <span>Agentes Generales</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agentes específicos (por ID)
            </label>
            <div class="flex gap-2">
              <input 
                v-model="newAgentId"
                type="text"
                placeholder="authUserId del agente"
                class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
              >
              <fwb-button size="sm" @click="addAgentPermission">Agregar</fwb-button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <span 
                v-for="agent in permissionForm.specificAgents" 
                :key="agent"
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
              >
                {{ agent }}
                <button @click="removeAgentPermission(agent)" class="hover:text-red-600">×</button>
              </span>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <fwb-button color="alternative" @click="showPermissionModal = false">Cancelar</fwb-button>
          <fwb-button gradient="blue" @click="savePermissions">Guardar</fwb-button>
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FwbButton, FwbModal } from 'flowbite-vue'
import { propertyService } from '../../services/propertyService'
import type { DocumentResponse } from '../../services/propertyService'
import { useAuth } from '../../composables/useAuth'

const props = defineProps<{
  propertyId: string
  agentId?: string
}>()

const { user } = useAuth()
const fileInput = ref<HTMLInputElement>()
const documents = ref<DocumentResponse[]>([])
const uploading = ref(false)
const showPermissionModal = ref(false)
const selectedDoc = ref<DocumentResponse | null>(null)

// Download expiration tracking (10 seconds per download)
const downloadTimers = ref<Record<string, { expiresAt: number, timerId: number | null }>>({})

const permissionForm = ref({
  roles: {
    ADMIN: false,
    AGENT: false
  },
  specificAgents: [] as string[]
})
const newAgentId = ref('')

const isAdmin = computed(() => {
  const roles = user.value?.roles || []
  return roles.includes('ADMIN') || user.value?.userType === 'ADMIN'
})

const canUpload = computed(() => isAdmin.value || props.agentId === user.value?.sub)

const loadDocuments = async () => {
  try {
    documents.value = await propertyService.getPropertyDocuments(props.propertyId)
  } catch (error) {
    console.error('Error loading documents:', error)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  const file = files[0]
  
  // Validate file type (US1 AC2)
  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  const fileExt = file.name.split('.').pop()?.toLowerCase()
  const isValidExt = fileExt === 'pdf' || fileExt === 'doc' || fileExt === 'docx'
  
  if (!validTypes.includes(file.type) && !isValidExt) {
    alert('Solo se permiten archivos PDF, DOC o DOCX')
    return
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('El archivo no debe exceder 10MB')
    return
  }

  uploading.value = true
  try {
    // US1: Upload contract
    await propertyService.uploadExclusivityContract(props.propertyId, file)
    await loadDocuments()
    
    // US1 AC3: Property status automatically updates to "CONTRACTED" on backend
    alert('Contrato subido exitosamente. La propiedad ahora tiene documentación de exclusividad.')
  } catch (error: any) {
    console.error('Error uploading document:', error)
    alert(error.response?.data?.detail || error.response?.data?.message || 'Error al subir el documento')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

// Get time remaining for download (10 seconds)
const getDownloadTimeRemaining = (docId: string): number | null => {
  if (isAdmin.value) return null
  const timer = downloadTimers.value[docId]
  if (!timer) return null
  
  const now = Date.now()
  const remaining = Math.ceil((timer.expiresAt - now) / 1000)
  
  return remaining > 0 ? remaining : null
}

// Check if download link is expired
const isDownloadExpired = (docId: string): boolean => {
  if (isAdmin.value) return false
  const timer = downloadTimers.value[docId]
  if (!timer) return false
  
  return Date.now() >= timer.expiresAt
}

// Check if document was already downloaded (permanently consumed via localStorage)
const isDocumentDownloaded = (docId: string): boolean => {
  if (isAdmin.value) return false
  if (!user.value?.sub) return false
  const key = `downloaded_${user.value.sub}_${docId}`
  return localStorage.getItem(key) === 'true'
}

// Mark document as downloaded permanently in localStorage
const markDocumentAsDownloaded = (docId: string) => {
  if (isAdmin.value) return
  if (!user.value?.sub) return
  const key = `downloaded_${user.value.sub}_${docId}`
  localStorage.setItem(key, 'true')
}

// Set 10-second download expiration timer
const setDownloadExpiration = (docId: string) => {
  if (isAdmin.value) return
  // Clear existing timer if any
  const existingTimer = downloadTimers.value[docId]
  if (existingTimer && existingTimer.timerId !== null) {
    clearInterval(existingTimer.timerId)
  }
  
  const expiresAt = Date.now() + 10000 // 10 seconds
  const timerId = window.setInterval(() => {
    // Force re-render by updating the reactive object
    if (downloadTimers.value[docId]) {
      downloadTimers.value[docId] = { ...downloadTimers.value[docId], expiresAt }
    }
  }, 100)
  
  downloadTimers.value[docId] = { expiresAt, timerId }
  
  // After 10 seconds: mark as downloaded permanently and clear timer
  setTimeout(() => {
    // Mark as downloaded in localStorage (permanent, survives page reload)
    markDocumentAsDownloaded(docId)
    
    const timer = downloadTimers.value[docId]
    if (timer && timer.timerId !== null) {
      clearInterval(timer.timerId)
    }
  }, 10000)
}

// PA: US1 AC1 & AC4: Download with temporary URL - Requires user action to request new URL after expiration
const downloadDocument = async (doc: DocumentResponse) => {
  try {
    let downloadUrl = doc.temporaryDownloadUrl
    
    // Request new URL if:
    // 1. No URL exists
    // 2. Server URL is expired
    // 3. Local 10-second timer expired (prevents reusing old links)
    if (!downloadUrl || doc.expiresInSeconds === 0 || isDownloadExpired(doc.id)) {
      const result = await propertyService.refreshDownloadUrl(doc.id)
      downloadUrl = result.temporaryDownloadUrl
    }
    
    // Set 10-second local expiration for UI feedback
    if (!isAdmin.value) {
      setDownloadExpiration(doc.id)
    }
    
    // Open in new tab
    window.open(downloadUrl, '_blank')
  } catch (error) {
    console.error('Error downloading document:', error)
    alert('No se pudo descargar el documento. Verifica tus permisos.')
  }
}

const deleteDocument = async (doc: DocumentResponse) => {
  if (!confirm('¿Eliminar este documento permanentemente?')) return
  
  try {
    await propertyService.deleteDocument(doc.id)
    await loadDocuments()
    alert('Documento eliminado exitosamente')
  } catch (error) {
    console.error('Error deleting document:', error)
    alert('Error al eliminar el documento')
  }
}

const openPermissionModal = (doc: DocumentResponse) => {
  selectedDoc.value = doc
  permissionForm.value = {
    roles: {
      ADMIN: doc.accessPolicy?.includes('ROLE_ADMIN') || false,
      AGENT: doc.accessPolicy?.includes('ROLE_AGENT') || false
    },
    specificAgents: doc.accessPolicy?.filter(p => !p.startsWith('ROLE_')) || []
  }
  showPermissionModal.value = true
}

const addAgentPermission = () => {
  if (newAgentId.value && !permissionForm.value.specificAgents.includes(newAgentId.value)) {
    permissionForm.value.specificAgents.push(newAgentId.value)
    newAgentId.value = ''
  }
}

const removeAgentPermission = (agentId: string) => {
  permissionForm.value.specificAgents = permissionForm.value.specificAgents.filter(a => a !== agentId)
}

const savePermissions = async () => {
  if (!selectedDoc.value) return
  
  const accessPolicy: string[] = []
  if (permissionForm.value.roles.ADMIN) accessPolicy.push('ROLE_ADMIN')
  if (permissionForm.value.roles.AGENT) accessPolicy.push('ROLE_AGENT')
  accessPolicy.push(...permissionForm.value.specificAgents)
  
  try {
    await propertyService.updateDocumentPermissions(selectedDoc.value.id, accessPolicy)
    await loadDocuments()
    showPermissionModal.value = false
    alert('Permisos actualizados exitosamente')
  } catch (error) {
    console.error('Error updating permissions:', error)
    alert('Error al actualizar permisos')
  }
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'EXPIRED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    ACTIVE: 'Activo',
    EXPIRED: 'Expirado',
    REJECTED: 'Rechazado'
  }
  return labels[status] || status
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-BO')
}

onMounted(loadDocuments)
</script>