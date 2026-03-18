
<template>
  <form @submit.prevent="submit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <fwb-input v-model="form.name" :label="t.users.form.fullName" :placeholder="t.users.form.fullNamePlaceholder" required />
      <fwb-input v-model="form.email" :label="t.users.form.email" :placeholder="t.users.form.emailPlaceholder" type="email" required />
      <fwb-input v-model="form.phone" :label="t.users.form.phone" :placeholder="t.users.form.phonePlaceholder" />
    </div>

    <div>
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ t.users.form.role }}</label>
      <select 
        v-model="form.roleId" 
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        required
      >
        <option :value="null" disabled>{{ t.users.form.selectRole }}</option>
        <option v-for="r in roles" :key="r.id" :value="r.id">{{r.name}}</option>
      </select>
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

const props = defineProps<{
  roles: any[],
  initialData?: any,
  isEditing?: boolean
}>()

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  name: '',
  email: '',
  phone: '',
  roleId: null as string | null
})

watch(() => props.initialData, (newData) => {
  if (newData) {
    Object.assign(form, {
      ...newData,
      roleId: newData.role?.id || newData.roleId
    })
  }
}, { immediate: true })

const submit = () => emit('submit', { ...form })
</script>
