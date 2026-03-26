<!-- FILE: Frontend/Frontend/src/views/UsersView.vue -->

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Gestión de Usuarios</h1>
    </div>

    <!-- Barra de búsqueda por CI -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              v-model="searchCI"
              type="text"
              class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Buscar por CI/NIT (ej: 1234567)"
              @input="handleSearch"
            />
          </div>
          <p v-if="searchCI && filteredUsers.length === 0 && users.length > 0" class="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ No se encontraron usuarios con CI: "{{ searchCI }}"
          </p>
          <p v-if="searchCI && filteredUsers.length > 0" class="mt-2 text-sm text-green-600 dark:text-green-400">
            ✓ Se encontraron {{ filteredUsers.length }} usuario(s) con CI que contiene "{{ searchCI }}"
          </p>
        </div>
        <div class="flex gap-2">
          <fwb-button v-if="searchCI" @click="clearSearch" color="alternative" size="sm">
            Limpiar búsqueda
          </fwb-button>
          <fwb-button @click="openCreateModal" gradient="blue">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Agregar Nuevo Usuario
            </div>
          </fwb-button>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios con datos filtrados -->
    <users-table
      :users="filteredUsers"
      :roles="roles"
      @create="openCreateModal"
      @edit="openEditModal"
      @delete="handleDeactivate"
      @resend="handleResend"
      @reactivate="handleReactivate"
    />

    <fwb-modal v-if="showModal" @close="closeModal">
      <template #header>
        <div class="text-lg font-semibold">
          {{ isEditing ? 'Editar Perfil de Usuario' : 'Registrar Nuevo Usuario' }}
        </div>
      </template>
      <template #body>
        <user-form
          :key="formKey"
          :initial-data="editingUser"
          :is-editing="isEditing"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </fwb-modal>

    <!-- Toast/Alert for feedback -->
    <div
      v-if="toast.visible"
      :class="[
        'fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all max-w-md',
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      ]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { FwbModal, FwbButton } from 'flowbite-vue'
import { useUsers } from '../composables/useUsers'
import UserForm from '../components/users/UserForm.vue'
import UsersTable from '../components/users/UsersTable.vue'

const { users, roles, load, create, deactivate, reactivate, resendPassword, update } = useUsers()
const showModal = ref(false)
const isEditing = ref(false)
const editingUser = ref<any>(null)
const formKey = ref(0)

//Estado para búsqueda por CI
const searchCI = ref('')
const searchTimeout = ref<ReturnType<typeof setTimeout>>()

const toast = ref({ visible: false, message: '', type: 'success' })

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { visible: true, message, type }
  setTimeout(() => { toast.value.visible = false }, 5000)
}

// ✅ NUEVO: Filtrar usuarios por CI (taxId)
const filteredUsers = computed(() => {
  if (!searchCI.value || searchCI.value.trim() === '') {
    return users.value
  }
  
  const searchTerm = searchCI.value.trim().toLowerCase()
  
  return users.value.filter(user => {
    // Buscar en taxId (CI) del usuario
    const taxId = user.taxId?.toLowerCase() || ''
    return taxId.includes(searchTerm)
  })
})

// ✅ NUEVO: Manejar búsqueda con debounce
const handleSearch = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    // La búsqueda ya se maneja con el computed filteredUsers
    // Solo mostramos feedback visual
    if (searchCI.value && filteredUsers.value.length === 0 && users.value.length > 0) {
      // El mensaje ya se muestra en el template
    }
  }, 300)
}

// ✅ NUEVO: Limpiar búsqueda
const clearSearch = () => {
  searchCI.value = ''
}

const openCreateModal = () => {
  editingUser.value = null
  isEditing.value = false
  formKey.value++
  showModal.value = true
}

const openEditModal = (user: any) => {
  editingUser.value = { ...user }
  isEditing.value = true
  formKey.value++
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async (formData: any) => {
  try {
    if (isEditing.value && editingUser.value) {
      await update(editingUser.value.id, formData)
      showToast('Usuario actualizado correctamente')
    } else {
      await create(formData)
      showToast('Usuario creado correctamente')
    }
    closeModal()
    // Limpiar búsqueda al crear/editar para mostrar la lista completa actualizada
    clearSearch()
  } catch (e: any) {
    let errorMessage = 'Error al guardar el usuario'
    
    if (e.response?.data) {
      const errorData = e.response.data
      
      if (errorData.detail?.includes('An owner with CI') || 
          errorData.detail?.includes('taxId already exists') ||
          errorData.detail?.includes('already exists')) {
        errorMessage = '⚠️ El número de CI/NIT ya está registrado en el sistema. Un propietario no puede tener el mismo CI que otro.'
      }
      else if (errorData.detail?.includes('Email already exists') || 
               errorData.detail?.includes('email already exists') ||
               errorData.message?.includes('Email already exists')) {
        errorMessage = '⚠️ El correo electrónico ya está registrado. Por favor, use otro email.'
      }
      else if (errorData.detail) {
        errorMessage = errorData.detail
      } else if (errorData.message) {
        errorMessage = errorData.message
      }
    }
    
    showToast(errorMessage, 'error')
    console.error('Error submitting user:', e)
  }
}

const handleDeactivate = async (user: any) => {
  if (!confirm(`¿Desactivar al usuario "${user.fullName || user.email}"? El usuario no podrá iniciar sesión.`)) return
  try {
    await deactivate(user.id)
    showToast('Usuario desactivado correctamente')
  } catch (e: any) {
    showToast(e.response?.data?.detail || 'Error al desactivar', 'error')
  }
}

const handleReactivate = async (user: any) => {
  try {
    await reactivate(user.id)
    showToast('Usuario reactivado correctamente')
  } catch (e: any) {
    showToast(e.response?.data?.detail || 'Error al reactivar', 'error')
  }
}

const handleResend = async (user: any) => {
  try {
    await resendPassword(user.email)
    showToast(`Contraseña temporal reenviada a ${user.email}`)
  } catch (e: any) {
    showToast(e.response?.data?.detail || 'Error al reenviar correo', 'error')
  }
}

onMounted(load)
</script>