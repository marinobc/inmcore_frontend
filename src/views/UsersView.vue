
<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between py-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t.users.title }}</h1>
        <p class="text-gray-500 dark:text-gray-400">{{ t.users.subtitle }}</p>
      </div>
    </div>

    <users-table 
      :users="users" 
      :roles="roles"
      @create="openCreateModal" 
      @edit="openEditModal" 
      @delete="remove"
    />

    <fwb-modal v-if="showModal" @close="closeModal">
      <template #header>
        <div class="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
          {{ isEditing ? t.users.editUser : t.users.createTitle }}
        </div>
      </template>
      <template #body>
        <user-form 
          :roles="roles" 
          :initial-data="editingUser"
          :is-editing="isEditing"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FwbModal } from 'flowbite-vue'
import { useUsers } from '../composables/useUsers'
import { t } from '../locales/i18n'
import UserForm from '../components/users/UserForm.vue'
import UsersTable from '../components/users/UsersTable.vue'

const { users, roles, load, create, remove, update } = useUsers()

const showModal = ref(false)
const isEditing = ref(false)
const editingUser = ref<any>(null)

const openCreateModal = () => {
  editingUser.value = null
  isEditing.value = false
  showModal.value = true
}

const openEditModal = (user: any) => {
  editingUser.value = user
  isEditing.value = true
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async (formData: any) => {
  if (isEditing.value) {
    if (editingUser.value) {
      await update(editingUser.value.id, formData)
    }
  } else {
    await create(formData)
  }
  closeModal()
}

onMounted(load)
</script>
