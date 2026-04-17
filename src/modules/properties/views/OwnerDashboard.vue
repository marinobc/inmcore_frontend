<template>
  <div>
    <PageHeader :title="t('ownerDashboard.title')" :subtitle="t('ownerDashboard.subtitle')" />

    <PageContainer class="space-y-6">
      <div v-if="loading" class="flex justify-center py-20">
        <IconLucideLoader class="animate-spin h-10 w-10 text-blue-600" />
      </div>

      <FwbAlert v-else-if="error" type="danger" class="rounded-xl shadow-sm">
        {{ error }}
      </FwbAlert>

      <div
        v-else-if="properties.length === 0"
        class="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
      >
        <p class="text-gray-500 dark:text-gray-400">{{ t('ownerDashboard.emptyTitle') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PropertyCard v-for="prop in properties" :key="prop.id" :property="prop">
          <template #action>
            <div
              class="bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 shadow-lg"
            >
              <IconLucideEye class="w-3 h-3" />
              {{ prop.visitCount || 0 }}
              {{ t('ownerDashboard.visits', prop.visitCount || 0) }}
            </div>
          </template>
          <template #footer-extra>
            <div
              class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500"
            >
              <div class="flex items-center gap-1">
                <span>👤</span>
                {{ t('common.agent') }}
                <span class="font-bold text-gray-700 dark:text-gray-300 ml-1">
                  {{ prop.agentName || t('common.unassigned') }}
                </span>
              </div>
            </div>
          </template>
        </PropertyCard>
      </div>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbAlert } from 'flowbite-vue';
  import IconLucideEye from '~icons/lucide/eye';
  import IconLucideLoader from '~icons/lucide/loader';

  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';

  import { useOwnerDashboard } from '../composables/useOwnerDashboard';
  import PropertyCard from '../components/PropertyCard.vue';

  const { t } = useI18n();
  const { properties, loading, error, load } = useOwnerDashboard();

  onMounted(load);
</script>
