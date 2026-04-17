import { ref, watch, computed } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { userSchema, type UserFormValues } from '../schemas/userSchema';
import { useEmailValidation } from './useEmailValidation';
import { useAuthStore, type UserClaims } from '@/modules/auth';
import type { User, UserType } from '../types/user';

export function useUserForm(props: {
  initialData?: Partial<User> | null;
  isEditing?: boolean;
  clientOnly?: boolean;
  ownerOnly?: boolean;
}) {
  const modifiedFields = ref<Set<string>>(new Set());
  const authStore = useAuthStore();
  const currentUser = computed(() => authStore.user as UserClaims | null);

  const {
    emailFormatError,
    emailDuplicateError,
    emailChecking,
    validateEmailFormat,
    validateEmailUniqueness,
    onEmailInput,
  } = useEmailValidation();

  const initialValues = mapInitialData(props.initialData, props.ownerOnly, props.clientOnly);

  const { defineField, handleSubmit, values, setValues, errors, resetForm, meta } =
    useForm<UserFormValues>({
      validationSchema: toTypedSchema(userSchema),
      initialValues,
    });

  const originalValues = ref<UserFormValues>({ ...initialValues });

  // Track modifications
  watch(
    values,
    (currentValues) => {
      const original = originalValues.value;
      (Object.keys(currentValues) as (keyof UserFormValues)[]).forEach((key) => {
        if (String(currentValues[key] ?? '') !== String(original[key] ?? '')) {
          modifiedFields.value.add(key);
        } else {
          modifiedFields.value.delete(key);
        }
      });
    },
    { deep: true }
  );

  // Reset form when initialData changes
  watch(
    () => props.initialData,
    (newData) => {
      const mapped = mapInitialData(newData, props.ownerOnly, props.clientOnly);
      setValues(mapped);
      originalValues.value = { ...mapped };
      modifiedFields.value.clear();
      resetForm({ values: mapped });
    },
    { deep: true }
  );

  const isFieldModified = (field: string) => modifiedFields.value.has(field);

  return {
    defineField,
    handleSubmit,
    values,
    errors,
    meta,
    isFieldModified,
    emailState: {
      formatError: emailFormatError,
      duplicateError: emailDuplicateError,
      checking: emailChecking,
    },
    validateEmailFormat,
    validateEmailUniqueness,
    onEmailInput,
    currentUser,
    modifiedFields,
  };
}

function mapInitialData(
  d: (Partial<User> & { personType?: string; nit?: string }) | null | undefined,
  ownerOnly?: boolean,
  clientOnly?: boolean
): UserFormValues {
  const toDateString = (val: string | undefined | null): string =>
    val ? String(val).split('T')[0] : '';

  if (!d) {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      userType: ownerOnly ? 'OWNER' : clientOnly ? 'INTERESTED_CLIENT' : 'EMPLOYEE',
      birthDate: '',
      department: '',
      position: '',
      hireDate: '',
      taxId: '',
      address: '',
      preferredContactMethod: undefined,
      budget: '',
      preferredZone: '',
      preferredPropertyType: '',
      preferredRooms: '',
      assignedAgentId: '',
    };
  }

  return {
    firstName: String(d.firstName || ''),
    lastName: String(d.lastName || ''),
    email: String(d.email || ''),
    phone: String(d.phone || ''),
    userType: (d.userType ||
      d.personType ||
      (ownerOnly ? 'OWNER' : clientOnly ? 'INTERESTED_CLIENT' : 'EMPLOYEE')) as UserType,
    birthDate: toDateString(d.birthDate),
    department: String(d.department || ''),
    position: String(d.position || ''),
    hireDate: toDateString(d.hireDate),
    taxId: String(d.taxId || d.nit || ''),
    address: String(d.address || ''),
    preferredContactMethod:
      (d.preferredContactMethod as 'EMAIL' | 'PHONE' | 'WHATSAPP') || undefined,
    budget: String(d.budget || ''),
    preferredZone: String(d.preferredZone || ''),
    preferredPropertyType: String(d.preferredPropertyType || ''),
    preferredRooms: d.preferredRooms || '',
    assignedAgentId: d.assignedAgentId || '',
  };
}
