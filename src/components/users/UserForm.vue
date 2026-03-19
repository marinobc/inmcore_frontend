<template>
  <form @submit.prevent="submit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <fwb-input v-model="form.name" :label="t.users.form.fullName" placeholder="Juan Pérez" required />
      <fwb-input v-model="form.email" :label="t.users.form.email" type="email" placeholder="juan@gmail.com" required />
      <fwb-input v-model="form.phone" :label="t.users.form.phone" placeholder="+591 ..." />
      
      <fwb-input v-model="form.birthDate" :label="'Fecha de Nacimiento'" type="date" required />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de Usuario</label>
        <select v-model="form.userType" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
          <option value="EMPLOYEE">Empleado / Agente</option>
          <option value="ADMIN">Administrador</option>
          <option value="OWNER">Propietario</option>
          <option value="INTERESTED_CLIENT">Cliente Interesado</option>
        </select>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ t.users.form.role }}</label>
        <select v-model="form.roleId" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
          <option :value="null" disabled>{{ t.users.form.selectRole }}</option>
          <option v-for="r in roles" :key="r.id" :value="r.id">{{r.name}}</option>
        </select>
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
      <fwb-button color="alternative" @click="$emit('cancel')">{{ t.users.form.cancel }}</fwb-button>
      <fwb-button type="submit" gradient="blue">
        {{ isEditing ? t.users.form.update : t.users.form.create }}
      </fwb-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { FwbInput, FwbButton } from 'flowbite-vue'
import { t } from '../../locales/i18n'
import type { UserFormPayload } from '../../types/user'

const props = defineProps<{
  roles: any[],
  initialData?: any,
  isEditing?: boolean
}>()

const emit = defineEmits(['submit', 'cancel'])

const form = reactive<UserFormPayload>({
  name: '',
  email: '',
  phone: '',
  roleId: null,
  userType: 'EMPLOYEE',
  birthDate: ''
})

watch(() => props.initialData, (newData) => {
  if (newData) {
    Object.assign(form, {
      name: newData.fullName || '',
      email: newData.email || '',
      phone: newData.phone || '',
      roleId: newData.primaryRoleIds?.[0] || null,
      userType: newData.userType || 'EMPLOYEE',
      birthDate: newData.birthDate || ''
    })
  }
}, { immediate: true })

const submit = () => emit('submit', { ...form })
</script>