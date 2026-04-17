<template>
  <div>
    <PageHeader :title="t('audit.title')" :subtitle="t('audit.subtitle')">
      <template #actions>
        <fwb-badge type="indigo" class="px-3 py-1">
          {{ t('common.adminMode') }}
        </fwb-badge>
      </template>
    </PageHeader>

    <PageContainer>
      <fwb-tabs v-model="activeTab" variant="underline">
        <fwb-tab name="identity" :title="t('auditLogs.actions.all')">
          <IdentityAuditTab />
        </fwb-tab>
        <fwb-tab name="properties" :title="t('nav.properties')">
          <PropertyAuditTab />
        </fwb-tab>
        <fwb-tab name="profiles" :title="t('users.view.detailsTitle')">
          <ProfileAuditTab />
        </fwb-tab>
      </fwb-tabs>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbTabs, FwbTab, FwbBadge } from 'flowbite-vue';
  import PageHeader from '@/shared/components/ui/PageHeader.vue';
  import PageContainer from '@/shared/components/ui/PageContainer.vue';
  import IdentityAuditTab from '@/modules/audit/components/IdentityAuditTab.vue';
  import PropertyAuditTab from '@/modules/audit/components/PropertyAuditTab.vue';
  import ProfileAuditTab from '@/modules/audit/components/ProfileAuditTab.vue';

  const { t } = useI18n();
  const activeTab = ref('identity');
</script>
