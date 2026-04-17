<template>
  <div>
    <PageHeader :title="t('clientDashboard.title')" :subtitle="t('clientDashboard.welcome')" />
    <PageContainer>
      <!-- Content will be added here as needed -->
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';

  const { t } = useI18n();
</script>
