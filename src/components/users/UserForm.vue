<!-- FILE: Frontend/Frontend/src/components/users/UserForm.vue -->

<template>
  <form @submit.prevent="submit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <fwb-input
          v-model="form.firstName"
          :label="t.users.form.firstName"
          placeholder="Juan"
          required
          :validation-status="errors.firstName ? 'error' : undefined"
          :validation-message="errors.firstName"
          :class="{ 'border-blue-500 ring-2 ring-blue-200': isFieldModified('firstName') }"
          @blur="validateField('firstName')"
        />
        <p v-if="isFieldModified('firstName')" class="text-xs text-blue-600 mt-1">✏️ Modificando nombre</p>
      </div>

      <div>
        <fwb-input
          v-model="form.lastName"
          :label="t.users.form.lastName"
          placeholder="Pérez"
          required
          :validation-status="errors.lastName ? 'error' : undefined"
          :validation-message="errors.lastName"
          :class="{ 'border-blue-500 ring-2 ring-blue-200': isFieldModified('lastName') }"
          @blur="validateField('lastName')"
        />
        <p v-if="isFieldModified('lastName')" class="text-xs text-blue-600 mt-1">✏️ Modificando apellido</p>
      </div>

      <div>
        <fwb-input
          v-model="form.email"
          :label="t.users.form.email"
          type="email"
          placeholder="juan@gmail.com"
          :disabled="isEditing"
          required
          :validation-status="emailValidationStatus"
          :validation-message="emailErrorMessage"
          @input="onEmailInput"
          @blur="validateEmailOnBlur"
        />
        <p v-if="isFieldModified('email') && !isEditing" class="text-xs text-blue-600 mt-1">✏️ Modificando email</p>
        <p v-if="emailChecking" class="text-xs text-gray-500 mt-1">Verificando disponibilidad...</p>
      </div>

      <div>
        <fwb-input
          v-model="form.phone"
          :label="t.users.form.phone"
          placeholder="+591 ..."
          required
          :validation-status="errors.phone ? 'error' : undefined"
          :validation-message="errors.phone"
          :class="{ 'border-blue-500 ring-2 ring-blue-200': isFieldModified('phone') }"
          @blur="validateField('phone')"
        />
        <p v-if="isFieldModified('phone')" class="text-xs text-blue-600 mt-1">✏️ Modificando teléfono</p>
      </div>

      <div>
        <fwb-input
          v-model="form.birthDate"
          label="Fecha de Nacimiento"
          type="date"
          required
          :validation-status="errors.birthDate ? 'error' : undefined"
          :validation-message="errors.birthDate"
          :class="{ 'border-blue-500 ring-2 ring-blue-200': isFieldModified('birthDate') }"
          @blur="validateField('birthDate')"
        />
        <p v-if="isFieldModified('birthDate')" class="text-xs text-blue-600 mt-1">✏️ Modificando fecha</p>
      </div>
    </div>

    <div>
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de Usuario / Rol</label>
      <select
        v-model="form.userType"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        :disabled="isEditing"
        required
      >
        <option value="ADMIN">Administrador</option>
        <option value="EMPLOYEE">Empleado / Agente</option>
        <option value="OWNER">Propietario</option>
        <option value="INTERESTED_CLIENT">Cliente Interesado</option>
      </select>
    </div>

    <div v-if="form.userType === 'EMPLOYEE'" class="space-y-4 border-t pt-4">
      <h3 class="text-md font-semibold">Información Laboral</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <fwb-input
            v-model="form.department"
            label="Departamento"
            :class="{ 'border-blue-500 ring-2': isFieldModified('department') }"
          />
          <p v-if="isFieldModified('department')" class="text-xs text-blue-600">✏️ Modificando departamento</p>
        </div>
        <div>
          <fwb-input
            v-model="form.position"
            label="Cargo"
            :class="{ 'border-blue-500 ring-2': isFieldModified('position') }"
          />
          <p v-if="isFieldModified('position')" class="text-xs text-blue-600">✏️ Modificando cargo</p>
        </div>
        <div>
          <fwb-input
            v-model="form.hireDate"
            type="date"
            label="Fecha Contratación"
            :class="{ 'border-blue-500 ring-2': isFieldModified('hireDate') }"
          />
          <p v-if="isFieldModified('hireDate')" class="text-xs text-blue-600">✏️ Modificando contratación</p>
        </div>
      </div>
    </div>

    <div v-if="form.userType === 'OWNER'" class="space-y-4 border-t pt-4">
      <h3 class="text-md font-semibold">Información Fiscal</h3>
      <div>
        <fwb-input
          v-model="form.taxId"
          label="CI / NIT"
          placeholder="1234567"
          :validation-status="errors.taxId ? 'error' : undefined"
          :validation-message="errors.taxId"
          :class="{ 'border-blue-500 ring-2': isFieldModified('taxId') }"
          @blur="validateField('taxId')"
        />
        <p v-if="isFieldModified('taxId')" class="text-xs text-blue-600">✏️ Modificando CI/NIT</p>
      </div>
    </div>

    <div v-if="form.userType === 'INTERESTED_CLIENT'" class="space-y-4 border-t pt-4">
      <h3 class="text-md font-semibold">Preferencias</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Método de Contacto</label>
          <select
            v-model="form.preferredContactMethod"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="EMAIL">Email</option>
            <option value="PHONE">Teléfono</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>
        <fwb-input v-model="form.budget" type="number" label="Presupuesto ($)" />
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t">
      <fwb-button color="alternative" @click="$emit('cancel')">{{ t.users.form.cancel }}</fwb-button>
      <fwb-button 
        type="submit" 
        gradient="blue"
        :disabled="!isFormValid || emailChecking"
      >
        {{ isEditing ? t.users.form.update : t.users.form.create }}
      </fwb-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { FwbInput, FwbButton } from 'flowbite-vue'
import { t } from '../../locales/i18n'
import type { UserFormPayload } from '../../types/user'
import { userService } from '../../services/userService'

const props = defineProps<{
  initialData?: any
  isEditing?: boolean
}>()

const emit = defineEmits(['submit', 'cancel'])
const errors = ref<Record<string, string>>({})
const modifiedFields = ref<Set<string>>(new Set())

// Estados específicos para email
const emailFormatError = ref('')
const emailDuplicateError = ref('')
const emailChecking = ref(false)
let emailDebounceTimer: ReturnType<typeof setTimeout>
let lastValidatedEmail = ''

const toDateString = (val: any): string => {
  if (!val) return ''
  return String(val).split('T')[0]
}

const mapData = (d: any): UserFormPayload => {
  if (!d) {
    return {
      firstName: '', lastName: '', email: '', phone: '', userType: 'EMPLOYEE', birthDate: '',
      department: '', position: '', hireDate: '', taxId: '',
      preferredContactMethod: '', budget: ''
    }
  }

  return {
    firstName: d.firstName || '',
    lastName: d.lastName || '',
    email: d.email || '',
    phone: d.phone || '',
    userType: d.userType || 'EMPLOYEE',
    birthDate: toDateString(d.birthDate),
    department: d.department || '',
    position: d.position || '',
    hireDate: toDateString(d.hireDate),
    taxId: d.taxId || '',
    preferredContactMethod: d.preferredContactMethod || '',
    budget: d.budget || ''
  }
}

const initialValues = mapData(props.initialData)
const form = reactive<UserFormPayload>({ ...initialValues })
const originalValues = reactive<UserFormPayload>({ ...initialValues })

// Validación de formato de email (solo verifica @)
const validateEmailFormat = (email: string): boolean => {
  if (!email) {
    emailFormatError.value = 'Email requerido'
    return false
  }
  
  if (!email.includes('@')) {
    emailFormatError.value = 'Email inválido: debe contener @'
    return false
  }
  
  emailFormatError.value = ''
  return true
}

// Validación de unicidad de email
const validateEmailUniqueness = async (email: string, skipIfSameAsOriginal: boolean = true): Promise<boolean> => {
  const trimmedEmail = email?.trim().toLowerCase()
  
  if (!trimmedEmail) {
    emailDuplicateError.value = ''
    return true
  }
  
  // Si estamos en modo edición y el email no ha cambiado, no validamos unicidad
  if (skipIfSameAsOriginal && props.isEditing && props.initialData?.email?.toLowerCase() === trimmedEmail) {
    emailDuplicateError.value = ''
    return true
  }
  
  emailChecking.value = true
  
  try {
    const users = await userService.getUsers()
    const emailExists = users.some((user: any) => 
      user.email?.toLowerCase() === trimmedEmail && 
      (!props.isEditing || user.id !== props.initialData?.id)
    )
    
    if (emailExists) {
      emailDuplicateError.value = 'Este correo electrónico ya está registrado. Por favor, use otro email.'
      return false
    }
    
    emailDuplicateError.value = ''
    return true
  } catch (error) {
    console.error('Error verificando email:', error)
    emailDuplicateError.value = ''
    return true
  } finally {
    emailChecking.value = false
  }
}

// Validación completa de email (formato + unicidad)
const validateEmail = async (email: string, skipUniquenessCheck: boolean = false): Promise<boolean> => {
  // Primero validar formato
  const isFormatValid = validateEmailFormat(email)
  if (!isFormatValid) {
    return false
  }
  
  // Luego validar unicidad si no se omite
  if (!skipUniquenessCheck) {
    const isUnique = await validateEmailUniqueness(email, true)
    return isUnique
  }
  
  return true
}

// Manejar input de email con debounce
const onEmailInput = () => {
  const email = form.email
  
  // Validar formato inmediatamente
  validateEmailFormat(email)
  
  // Limpiar error de duplicado mientras escribe
  emailDuplicateError.value = ''
  
  // Debounce para validación de unicidad
  clearTimeout(emailDebounceTimer)
  emailDebounceTimer = setTimeout(async () => {
    if (email && email !== lastValidatedEmail) {
      lastValidatedEmail = email
      await validateEmailUniqueness(email, true)
    }
  }, 800)
}

// Validar email al perder foco
const validateEmailOnBlur = async () => {
  if (form.email) {
    await validateEmail(form.email, false)
  }
}

// Validar un campo específico
const validateField = (field: keyof UserFormPayload) => {
  const value = form[field]
  
  switch (field) {
    case 'firstName':
      if (!value || value.trim().length < 2) {
        errors.value.firstName = 'Mínimo 2 caracteres'
      } else {
        delete errors.value.firstName
      }
      break
      
    case 'lastName':
      if (!value || value.trim().length < 2) {
        errors.value.lastName = 'Mínimo 2 caracteres'
      } else {
        delete errors.value.lastName
      }
      break
      
    case 'phone':
      if (!value) {
        errors.value.phone = 'Teléfono requerido'
      } else {
        delete errors.value.phone
      }
      break
      
    case 'birthDate':
      if (!value) {
        errors.value.birthDate = 'Requerido'
      } else {
        delete errors.value.birthDate
      }
      break
      
    case 'taxId':
      if (form.userType === 'OWNER') {
        if (!value || value.trim().length < 7) {
          errors.value.taxId = 'CI/NIT debe tener al menos 7 dígitos'
        } else if (!/^\d{7,10}$/.test(value.trim())) {
          errors.value.taxId = 'CI/NIT debe contener solo números (7-10 dígitos)'
        } else {
          delete errors.value.taxId
        }
      }
      break
  }
}

watch(
  () => props.initialData,
  (newData) => {
    if (!newData) return
    const mapped = mapData(newData)
    Object.assign(form, mapped)
    Object.assign(originalValues, mapped)
    modifiedFields.value.clear()
    errors.value = {}
    emailFormatError.value = ''
    emailDuplicateError.value = ''
    lastValidatedEmail = mapped.email || ''
  }
)

const isFieldModified = (field: string) => modifiedFields.value.has(field)

watch(
  form,
  () => {
    (Object.keys(form) as (keyof UserFormPayload)[]).forEach((k) => {
      if (String(form[k]) !== String(originalValues[k])) {
        modifiedFields.value.add(k)
      } else {
        modifiedFields.value.delete(k)
      }
    })
  },
  { deep: true }
)

// Computed para el estado de validación del email
const emailValidationStatus = computed(() => {
  if (emailFormatError.value) return 'error'
  if (emailDuplicateError.value) return 'error'
  return undefined
})

// Computed para el mensaje de error del email
const emailErrorMessage = computed(() => {
  if (emailFormatError.value) return emailFormatError.value
  if (emailDuplicateError.value) return emailDuplicateError.value
  return ''
})

const isFormValid = computed(() => {
  // Validaciones básicas de campos requeridos
  const hasRequiredFields = form.firstName?.trim() && 
                           form.lastName?.trim() && 
                           form.email?.trim() && 
                           form.birthDate && 
                           form.phone?.trim()
  
  // Validación de email (formato y unicidad)
  const isEmailValid = !emailFormatError.value && !emailDuplicateError.value && form.email?.includes('@')
  
  // Validación específica para OWNER
  let isOwnerValid = true
  if (form.userType === 'OWNER') {
    isOwnerValid = !errors.value.taxId && form.taxId?.trim() && /^\d{7,10}$/.test(form.taxId.trim())
  }
  
  return hasRequiredFields && isEmailValid && isOwnerValid && !emailChecking.value
})

const getRoleIdByUserType = (userType: string): string => {
  const roles: Record<string, string> = {
    'ADMIN': 'rol_admin',
    'EMPLOYEE': 'rol_agent',
    'OWNER': 'rol_owner',
    'INTERESTED_CLIENT': 'rol_interested_client'
  }
  return roles[userType] || 'rol_interested_client'
}

const submit = async () => {
  // Validación final completa antes de enviar
  const isValid = await validateEmail(form.email, false)
  if (!isValid) {
    return
  }
  
  // Validar todos los campos requeridos
  validateField('firstName')
  validateField('lastName')
  validateField('phone')
  validateField('birthDate')
  if (form.userType === 'OWNER') {
    validateField('taxId')
  }
  
  // Verificar si hay errores
  const hasErrors = Object.keys(errors.value).length > 0
  if (hasErrors) {
    return
  }

  let payload: any = {}

  if (props.isEditing) {
    // Modo edición: solo enviar campos modificados
    if (modifiedFields.value.has('firstName')) payload.firstName = form.firstName.trim()
    if (modifiedFields.value.has('lastName')) payload.lastName = form.lastName.trim()
    if (modifiedFields.value.has('userType')) {
      payload.userType = form.userType
      payload.roleIds = [getRoleIdByUserType(form.userType)]
    }
    if (modifiedFields.value.has('phone')) payload.phone = form.phone.trim()
    if (modifiedFields.value.has('birthDate')) payload.birthDate = form.birthDate
    if (modifiedFields.value.has('department')) payload.department = form.department?.trim()
    if (modifiedFields.value.has('position')) payload.position = form.position?.trim()
    if (modifiedFields.value.has('hireDate')) payload.hireDate = form.hireDate
    if (modifiedFields.value.has('taxId')) payload.taxId = form.taxId?.trim()
    if (modifiedFields.value.has('preferredContactMethod')) payload.preferredContactMethod = form.preferredContactMethod
    if (modifiedFields.value.has('budget')) payload.budget = form.budget
  } else {
    // Modo creación: enviar todos los datos
    payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      userType: form.userType,
      roleIds: [getRoleIdByUserType(form.userType)],
      birthDate: form.birthDate,
      phone: form.phone.trim(),
      sendTemporaryCredentials: true
    }

    // Añadir campos específicos según tipo de usuario
    if (form.userType === 'EMPLOYEE') {
      if (form.department) payload.department = form.department.trim()
      if (form.position) payload.position = form.position.trim()
      if (form.hireDate) payload.hireDate = form.hireDate
    } else if (form.userType === 'OWNER') {
      if (form.taxId) payload.taxId = form.taxId.trim()
    } else if (form.userType === 'INTERESTED_CLIENT') {
      if (form.preferredContactMethod) payload.preferredContactMethod = form.preferredContactMethod
      if (form.budget) payload.budget = form.budget
    }
  }

  emit('submit', payload)
}
</script>