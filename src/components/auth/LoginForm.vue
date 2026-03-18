
<template>
  <fwb-card class="max-w-md w-full p-6 shadow-xl border-gray-100 dark:border-gray-700">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ t.auth.welcome }}</h1>
      <p class="text-gray-500 dark:text-gray-400">{{ t.auth.subtitle }}</p>
    </div>

    <form @submit.prevent="submit" class="space-y-6">
      <fwb-input 
        v-model="email" 
        :label="t.auth.emailLabel" 
        :placeholder="t.auth.emailPlaceholder"
        type="email"
        required
      />
      <fwb-input 
        v-model="password" 
        :label="t.auth.passwordLabel" 
        type="password" 
        :placeholder="t.auth.passwordPlaceholder"
        required
      />
      
      <div class="flex items-center justify-between">
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input id="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800">
          </div>
          <label for="remember" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{{ t.auth.rememberMe }}</label>
        </div>
        <a href="#" class="text-sm text-blue-700 hover:underline dark:text-blue-500">{{ t.auth.forgotPassword }}</a>
      </div>

      <fwb-button 
        type="submit" 
        class="w-full py-3 text-base font-medium"
        gradient="blue"
      >
        {{ t.auth.signIn }}
      </fwb-button>
    </form>

    <div class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      {{ t.auth.notRegistered }} <a href="#" class="text-blue-700 hover:underline dark:text-blue-500 text-medium">{{ t.auth.createAccount }}</a>
    </div>
  </fwb-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FwbInput, FwbButton, FwbCard } from 'flowbite-vue'
import { t } from '../../locales/i18n'

const emit = defineEmits(['submit'])

const email = ref('')
const password = ref('')

const submit = ()=>{
  emit('submit',{email:email.value,password:password.value})
}
</script>
