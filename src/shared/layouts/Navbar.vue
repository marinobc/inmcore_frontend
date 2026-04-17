<template>
  <fwb-navbar class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <template #logo>
      <span class="self-center whitespace-nowrap text-xl font-bold dark:text-white">
        {{ t('nav.brand') }}
      </span>
    </template>
    <template #default>
      <fwb-navbar-collapse>
        <router-link
          v-for="link in filteredLinks"
          :key="link.to"
          :to="link.to"
          class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:text-blue-700 dark:text-gray-400 dark:hover:text-white"
          :class="{
            'text-blue-700 dark:text-white font-bold':
              $route.path === link.to || (link.name && $route.name === link.name),
          }"
        >
          {{ t(link.label) }}
          <NotificationBadge v-if="link.to.includes('reassignments')" />
        </router-link>

        <!-- Always visible or semi-common links -->
        <router-link
          v-if="isAdmin || isAgent"
          to="/calendar"
          class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:text-blue-700 dark:text-gray-400 dark:hover:text-white"
          :class="{
            'text-blue-700 dark:text-white font-bold': $route.name === 'Calendar',
          }"
        >
          {{ t('nav.calendar') }}
          <VisitRequestNotificationBadge v-if="isAgent" />
        </router-link>
      </fwb-navbar-collapse>
    </template>
    <template #right-side>
      <div class="flex items-center md:order-2 space-x-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <fwb-dropdown align-to-end>
          <template #trigger>
            <button
              class="flex mr-3 text-sm bg-blue-600 rounded-full w-8 h-8 items-center justify-center text-white font-bold uppercase focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              {{ userInitial }}
            </button>
          </template>
          <fwb-list-group>
            <div class="px-4 py-3">
              <span class="block text-sm text-gray-900 dark:text-white font-medium">
                {{ userDisplayName }}
              </span>
              <span class="block text-sm text-gray-500 truncate dark:text-gray-400">
                {{ userEmail }}
              </span>
            </div>
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-600 dark:text-red-500 border-t border-gray-100 dark:border-gray-700"
            >
              {{ t('nav.logout') }}
            </button>
          </fwb-list-group>
        </fwb-dropdown>
      </div>
    </template>
  </fwb-navbar>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbNavbar, FwbNavbarCollapse, FwbDropdown, FwbListGroup } from 'flowbite-vue';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { navigationLinks } from './navigation';
  import ThemeToggle from '../components/common/ThemeToggle.vue';
  import LanguageSwitcher from '../components/common/LanguageSwitcher.vue';
  import NotificationBadge from '@/modules/visits/components/reassignment/NotificationBadge.vue';
  import VisitRequestNotificationBadge from '@/modules/visits/components/requests/VisitRequestNotificationBadge.vue';

  const { t } = useI18n();
  const authStore = useAuthStore();
  const user = computed(() => authStore.user as UserClaims | null);

  const isAdmin = computed(
    () => user.value?.roles?.includes('ADMIN') || user.value?.userType === 'ADMIN'
  );
  const isAgent = computed(
    () => user.value?.roles?.includes('AGENT') || user.value?.userType === 'EMPLOYEE'
  );

  const filteredLinks = computed(() =>
    navigationLinks.filter((link) => {
      const hasRole = !link.roles || link.roles.some((r) => user.value?.roles?.includes(r));
      const hasType = !link.userTypes || link.userTypes.includes(user.value?.userType || '');
      return hasRole || hasType;
    })
  );

  const userDisplayName = computed(
    () =>
      user.value?.name ||
      user.value?.fullName ||
      user.value?.email?.split('@')[0] ||
      t('common.user')
  );
  const userEmail = computed(() => user.value?.email || '');
  const userInitial = computed(() => userDisplayName.value.charAt(0).toUpperCase());

  const handleLogout = async () => {
    await authStore.logout();
    window.location.href = '/login';
  };
</script>
