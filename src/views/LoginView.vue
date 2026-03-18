
<template>
  <div class="h-screen flex items-center justify-center p-4">
    <login-form @submit="handleLogin"/>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import LoginForm from '../components/auth/LoginForm.vue'

const router = useRouter()
const { login } = useAuth()

const handleLogin = async (payload: any) => {
  try {
    await login(payload)
    router.push({ name: 'Dashboard' })
  } catch (error) {
    // Error is handled inside useAuth or LoginForm based on setup, but we could add an alert here
  }
}
</script>
