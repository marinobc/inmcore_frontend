<template>
  <div class="h-screen flex items-center justify-center p-4 relative bg-gray-50 dark:bg-gray-900">
    <div class="absolute top-4 right-4 flex gap-2">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>

    <LoginForm v-if="!showChangePassword" ref="loginFormRef" @submit="handleLogin" />

    <DevLogin v-if="!showChangePassword" @login="handleDevLogin" />

    <fwb-modal v-if="showChangePassword" @close="handleCancelChange">
      <template #header>
        <div class="text-lg font-bold">{{ t('auth.changePasswordTitle') }}</div>
      </template>
      <template #body>
        <form @submit.prevent="onPasswordSubmit" class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('auth.changePasswordInfo') }}
          </p>
          <FormField
            v-model="currentPassword"
            :label="t('auth.currentPassword')"
            type="password"
            :error="errors.currentPassword"
            required
          />
          <FormField
            v-model="newPassword"
            :label="t('auth.newPassword')"
            type="password"
            :error="errors.newPassword"
            required
          />
          <FormField
            v-model="confirmPassword"
            :label="t('auth.confirmPassword')"
            type="password"
            :error="errors.confirmPassword"
            required
          />
          <div
            class="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <fwb-button color="alternative" @click="handleCancelChange">
              {{ t('auth.cancel') }}
            </fwb-button>
            <fwb-button type="submit" gradient="blue">{{ t('auth.changePassword') }}</fwb-button>
          </div>
        </form>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import { useI18n } from 'vue-i18n';
  import { FwbModal, FwbButton } from 'flowbite-vue';

  import { useAuthStore, authService } from '@/modules/auth';
  import { loginSchema, changePasswordSchema } from '../schemas/authSchema';
  import { useToast } from '@/shared/composables/useToast';
  import { handleApiError } from '@/core/api/errorHandler';

  import LoginForm from '../components/LoginForm.vue';
  import DevLogin from '../components/DevLogin.vue';
  import FormField from '@/shared/components/common/FormField.vue';
  import ThemeToggle from '@/shared/components/common/ThemeToggle.vue';
  import LanguageSwitcher from '@/shared/components/common/LanguageSwitcher.vue';

  const { t } = useI18n();
  const router = useRouter();
  const route = useRoute();
  const toast = useToast();
  const authStore = useAuthStore();

  const showChangePassword = ref(false);
  const loginFormRef = ref<InstanceType<typeof LoginForm> | null>(null);

  interface DevUser {
    email: string;
    password: string;
    label?: string;
  }

  onMounted(() => {
    if (route.query.error === 'connection') {
      toast.error((route.query.msg as string) || t('common.connectionError'));
    }
  });

  const {
    defineField,
    handleSubmit: onChangePasswordSubmit,
    setValues: setChangePasswordValues,
    errors,
  } = useForm({
    validationSchema: toTypedSchema(changePasswordSchema),
  });

  const [currentPassword] = defineField('currentPassword');
  const [newPassword] = defineField('newPassword');
  const [confirmPassword] = defineField('confirmPassword');

  const handleLogin = async (payload: { email: string; password: string }) => {
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    try {
      await authStore.login(parsed.data);
      if (localStorage.getItem('must_change_password') === 'true') {
        showChangePassword.value = true;
        setChangePasswordValues({
          currentPassword: parsed.data.password,
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        router.push({ name: 'Dashboard' });
      }
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      toast.error(apiErr.status === 401 ? t('auth.invalidCredentials') : apiErr.message);
    }
  };

  const handleDevLogin = (user: DevUser) => {
    if (loginFormRef.value) {
      loginFormRef.value.email = user.email;
      loginFormRef.value.password = user.password;
      loginFormRef.value.submit();
    }
  };

  const onPasswordSubmit = onChangePasswordSubmit(async (values) => {
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      localStorage.removeItem('must_change_password');
      showChangePassword.value = false;
      router.push({ name: 'Dashboard' });
      toast.success(t('auth.passwordChangedSuccess'));
    } catch (err: unknown) {
      toast.error(handleApiError(err).message || t('auth.changePasswordError'));
    }
  });

  const handleCancelChange = () => {
    showChangePassword.value = false;
    authStore.logout();
    router.push({ name: 'Login' });
  };
</script>
