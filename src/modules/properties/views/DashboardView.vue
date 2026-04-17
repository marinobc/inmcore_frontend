<template>
  <div>
    <PageHeader :title="t('dashboard.title')" :subtitle="t('dashboard.welcome')" />

    <PageContainer>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <h3 class="font-bold text-gray-900 dark:text-white">
            {{ t('dashboard.systemStatus') }}
          </h3>
          <p class="text-sm text-green-500 font-bold mt-1 uppercase tracking-wider">
            {{ t('dashboard.allServicesOperational') }}
          </p>
        </div>
      </div>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';

  const { t } = useI18n();
</script>
