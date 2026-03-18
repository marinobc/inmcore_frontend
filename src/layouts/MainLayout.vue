<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <fwb-navbar class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <template #logo>
        <div class="flex items-center gap-2">
          <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">{{ t.nav.brand }}</span>
        </div>
      </template>
      <template #default>
        <fwb-navbar-collapse>
          <fwb-navbar-link is-active href="#">{{ t.nav.users }}</fwb-navbar-link>
          <fwb-navbar-link href="#">{{ t.nav.properties }}</fwb-navbar-link>
          <fwb-navbar-link href="#">{{ t.nav.reports }}</fwb-navbar-link>
        </fwb-navbar-collapse>
      </template>
      <template #right-side>
        <div class="flex items-center md:order-2 space-x-3">
          <theme-toggle />
          <fwb-dropdown align-to-end>
            <template #trigger>
              <button type="button" class="flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600">
                <span class="sr-only">{{ t.nav.openUserMenu }}</span>
                <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase">
                  {{ user?.sub?.[0] || 'U' }}
                </div>
              </button>
            </template>
            <fwb-list-group>
              <div class="px-4 py-3">
                <span class="block text-sm text-gray-900 dark:text-white">{{ user?.userType || 'User' }}</span>
                <span class="block text-sm font-medium text-gray-500 truncate dark:text-gray-400">{{ user?.sub }}</span>
              </div>
              <fwb-list-group-item @click="handleLogout" class="text-red-600 hover:bg-red-50 cursor-pointer">{{ t.nav.logout }}</fwb-list-group-item>
            </fwb-list-group>
          </fwb-dropdown>
        </div>
      </template>
    </fwb-navbar>

    <main class="p-4 md:p-8 max-w-7xl mx-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { 
  FwbNavbar, 
  FwbNavbarCollapse, 
  FwbNavbarLink, 
  FwbDropdown, 
  FwbListGroup, 
  FwbListGroupItem 
} from 'flowbite-vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { t } from '../locales/i18n'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const { user, logout } = useAuth()

const handleLogout = async () => {
  await logout()
  router.push({ name: 'Login' })
}
</script>
