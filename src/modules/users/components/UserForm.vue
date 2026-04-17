<template>
  <form @submit.prevent="onFormSubmit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        v-model="firstName"
        :label="t('users.form.firstName')"
        :error="errors.firstName"
        :modified="isFieldModified('firstName')"
        :modification-message="t('userForm.modifyingName')"
        required
      />

      <FormField
        v-model="lastName"
        :label="t('users.form.lastName')"
        :error="errors.lastName"
        :modified="isFieldModified('lastName')"
        :modification-message="t('userForm.modifyingLastName')"
        required
      />

      <FormField
        v-model="email"
        :label="t('users.form.email')"
        type="email"
        :disabled="isEditing"
        :error="emailError"
        :modified="isFieldModified('email') && !isEditing"
        :modification-message="t('userForm.modifyingEmail')"
        required
        @input="handleEmailInput"
        @blur="handleEmailBlur"
      >
        <template #footer>
          <p v-if="emailState.checking.value" class="text-xs text-gray-500 mt-1">
            {{ t('userForm.checkingAvailability') }}
          </p>
        </template>
      </FormField>

      <FormField
        v-model="phone"
        :label="t('users.form.phone')"
        :error="errors.phone"
        :modified="isFieldModified('phone')"
        :modification-message="t('userForm.modifyingPhone')"
        required
      />

      <FormField
        v-model="birthDate"
        :label="t('users.form.birthDate')"
        type="date"
        :error="errors.birthDate"
        :modified="isFieldModified('birthDate')"
        :modification-message="t('userForm.modifyingName')"
        required
      />
    </div>

    <!-- Role Selection -->
    <div v-if="!clientOnly && !ownerOnly">
      <FormSelect v-model="userType" :label="t('users.form.role')" :disabled="isEditing">
        <option v-for="opt in availableUserTypes" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </FormSelect>
    </div>

    <!-- Modular Sections -->
    <EmployeeFields
      v-if="userType === 'EMPLOYEE'"
      v-model:department="department"
      v-model:position="position"
      v-model:hireDate="hireDate"
      :errors="errors"
      :is-modified="isFieldModified"
    />

    <OwnerFields
      v-if="userType === 'OWNER'"
      v-model:taxId="taxId"
      v-model:address="address"
      :errors="errors"
      :is-modified="isFieldModified"
    />

    <ClientFields
      v-if="userType === 'INTERESTED_CLIENT'"
      v-model:preferredContactMethod="preferredContactMethod"
      v-model:budget="budget!"
      v-model:preferredZone="preferredZone"
      v-model:preferredPropertyType="preferredPropertyType"
      v-model:preferredRooms="preferredRooms!"
      :errors="errors"
      :is-modified="isFieldModified"
    />

    <div class="flex justify-end space-x-3 pt-4 border-t">
      <fwb-button color="alternative" @click="$emit('cancel')">
        {{ t('users.form.cancel') }}
      </fwb-button>
      <fwb-button
        type="submit"
        gradient="blue"
        :disabled="!meta.valid || emailState.checking.value"
      >
        {{ isEditing ? t('users.form.update') : t('users.form.create') }}
      </fwb-button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbButton } from 'flowbite-vue';
  import FormField from '@/shared/components/common/FormField.vue';
  import FormSelect from '@/shared/components/common/FormSelect.vue';
  import EmployeeFields from './form/EmployeeFields.vue';
  import OwnerFields from './form/OwnerFields.vue';
  import ClientFields from './form/ClientFields.vue';

  import { useUserForm } from '../composables/useUserForm';
  import { useToast } from '@/shared/composables/useToast';
  import type { UserFormValues } from '../schemas/userSchema';
  import type { User, UserFormPayload, UserType } from '../types/user';

  const { t } = useI18n();
  const toast = useToast();
  const props = defineProps<{
    initialData?: Partial<User>;
    isEditing?: boolean;
    clientOnly?: boolean;
    ownerOnly?: boolean;
  }>();

  const emit = defineEmits(['submit', 'cancel']);

  const {
    defineField,
    handleSubmit,
    errors,
    meta,
    isFieldModified,
    emailState,
    validateEmailUniqueness,
    onEmailInput,
    currentUser,
    modifiedFields,
  } = useUserForm(props);

  const [firstName] = defineField('firstName');
  const [lastName] = defineField('lastName');
  const [email] = defineField('email');
  const [phone] = defineField('phone');
  const [birthDate] = defineField('birthDate');
  const [userType] = defineField('userType');
  const [department] = defineField('department');
  const [position] = defineField('position');
  const [hireDate] = defineField('hireDate');
  const [taxId] = defineField('taxId');
  const [address] = defineField('address');
  const [preferredContactMethod] = defineField('preferredContactMethod');
  const [budget] = defineField('budget');
  const [preferredZone] = defineField('preferredZone');
  const [preferredPropertyType] = defineField('preferredPropertyType');
  const [preferredRooms] = defineField('preferredRooms');

  const emailError = computed(
    () => emailState.formatError.value || emailState.duplicateError.value || errors.value.email
  );

  const handleEmailInput = () => onEmailInput(email.value || '');
  const handleEmailBlur = async () => {
    const val = email.value || '';
    if (val) {
      const original = props.initialData?.email || '';
      await validateEmailUniqueness(val, undefined, original);
    }
  };

  const availableUserTypes = computed(() => {
    const roles = (currentUser.value?.roles as string[]) || [];
    if (roles.includes('AGENT') && !roles.includes('ADMIN')) {
      return [
        { value: 'OWNER', label: t('users.roles.owner') },
        { value: 'INTERESTED_CLIENT', label: t('users.roles.client') },
      ];
    }
    return [
      { value: 'ADMIN', label: t('users.roles.admin') },
      { value: 'EMPLOYEE', label: t('users.roles.agent') },
      { value: 'OWNER', label: t('users.roles.owner') },
      { value: 'INTERESTED_CLIENT', label: t('users.roles.client') },
    ];
  });

  const getRoleId = (type: UserType) => {
    const map: Record<UserType, string> = {
      ADMIN: 'rol_admin',
      EMPLOYEE: 'rol_agent',
      OWNER: 'rol_owner',
      INTERESTED_CLIENT: 'rol_interested_client',
    };
    return map[type] || 'rol_interested_client';
  };

  const onFormSubmit = handleSubmit(
    async (formValues: UserFormValues) => {
      if (emailError.value) {
        toast.error(t('common.validationError'));
        return;
      }

      const payload: Partial<UserFormPayload> & {
        roleIds?: string[];
        sendTemporaryCredentials?: boolean;
      } = {};
      if (props.isEditing) {
        modifiedFields.value.forEach((field) => {
          (payload as Record<string, unknown>)[field] = (formValues as Record<string, unknown>)[
            field
          ];
        });
        if (payload.userType) payload.roleIds = [getRoleId(payload.userType)];
        if (payload.preferredRooms) payload.preferredRooms = Number(payload.preferredRooms);
        if (payload.budget) payload.budget = Number(payload.budget);
      } else {
        Object.assign(payload, formValues);
        payload.roleIds = [getRoleId(formValues.userType)];
        if (payload.preferredRooms) payload.preferredRooms = Number(payload.preferredRooms);
        if (payload.budget) payload.budget = Number(payload.budget);
        payload.sendTemporaryCredentials = true;
      }

      emit('submit', payload);
    },
    () => {
      toast.error(t('common.validationError'));
    }
  );
</script>
