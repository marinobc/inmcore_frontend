<template>
  <form @submit.prevent="submit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        v-model="titleModel"
        :label="t('propertyForm.title')"
        :error="errors.title"
        required
      />
      <FormField
        v-model="addressModel"
        :label="t('propertyForm.address')"
        :error="errors.address"
        required
      />
      <FormField
        v-model="zoneModel"
        :label="t('clientProperties.zoneLabel').replace(':', '')"
        :error="errors.zone"
        required
      />

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ t('propertyForm.operationType') }}
        </label>
        <select
          v-model="operationTypeModel"
          class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
          :class="{ 'border-red-500': errors.operationType }"
        >
          <option value="" disabled>
            {{ t('propertyForm.selectOption') }}
          </option>
          <option v-for="key in ['VENTA', 'ALQUILER', 'ANTICRETICO']" :key="key" :value="key">
            {{ t('propertyOperations.' + key) }}
          </option>
        </select>
        <p
          v-if="errors.operationType"
          class="mt-1 text-xs text-red-600 dark:text-red-500 font-medium"
        >
          {{ errors.operationType }}
        </p>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ t('propertyForm.propertyType') }}
        </label>
        <select
          v-model="typeModel"
          class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option
            v-for="key in [
              'CASA',
              'DEPARTAMENTO',
              'TERRENO',
              'COMERCIAL',
              'OFICINA',
              'INDUSTRIAL',
              'OTROS',
            ]"
            :key="key"
            :value="key"
          >
            {{ t('propertyTypes.' + key) }}
          </option>
        </select>
      </div>

      <div>
        <FormField
          v-model.number="priceModel"
          type="number"
          :label="t('common.price') + ' ($)'"
          :disabled="isPriceDisabled"
          :error="errors.price"
          required
        />
        <p v-if="isPriceDisabled" class="text-xs text-yellow-600 mt-1">
          {{ t('propertyForm.priceWarning') }}
        </p>
      </div>

      <FormField
        v-model.number="m2Model"
        type="number"
        :label="t('common.m2')"
        :error="errors.m2"
        required
      />
      <FormField
        v-model.number="roomsModel"
        type="number"
        :label="t('propertyForm.rooms')"
        :error="errors.rooms"
        required
      />

      <div class="col-span-2">
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ t('propertyForm.owner') }}
        </label>
        <select
          v-model="ownerIdModel"
          class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option value="">{{ t('propertyForm.noOwnerAssigned') }}</option>
          <option v-for="owner in owners" :key="owner.id" :value="owner.id">
            {{ owner.fullName }} - {{ owner.email }}
          </option>
        </select>
      </div>
    </div>

    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        {{ t('propertyForm.images') }}
      </h3>
      <image-upload
        v-if="props.propertyId"
        :property-id="props.propertyId"
        :existing-images="imageUrlsModel"
        @images-updated="imageUrlsModel = $event"
      />
      <div
        v-else
        class="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed"
      >
        <p class="text-gray-500">{{ t('propertyForm.imagesLater') }}</p>
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-700">
      <fwb-button color="alternative" @click="$emit('cancel')">{{ t('common.cancel') }}</fwb-button>
      <fwb-button type="submit" gradient="blue">{{ t('propertyForm.confirmRegister') }}</fwb-button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import { propertySchema, type PropertyFormValues } from '../schemas/propertySchema';
  import { FwbButton } from 'flowbite-vue';
  import { userService } from '@/modules/users/services/userService';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { useToast } from '@/shared/composables/useToast';
  import ImageUpload from './ImageUpload.vue';
  import FormField from '@/shared/components/common/FormField.vue';
  import type { PropertyFormPayload, OperationType } from '../types/property';
  import { useI18n } from 'vue-i18n';

  import type { User } from '@/modules/users/types/user';

  const { t } = useI18n();
  const toast = useToast();
  const props = defineProps<{
    initialData?: Record<string, unknown>;
    propertyId?: string;
  }>();
  const emit = defineEmits(['submit', 'cancel']);

  const owners = ref<User[]>([]);
  const authStore = useAuthStore();
  const isAgent = computed(() => {
    const u = authStore.user as UserClaims | null;
    return (
      (u?.roles?.includes('AGENT') || u?.userType === 'EMPLOYEE') &&
      !(u?.roles?.includes('ADMIN') || u?.userType === 'ADMIN')
    );
  });
  const isPriceDisabled = computed(() => isAgent.value && !!props.propertyId);

  const { defineField, errors, handleSubmit, setValues } = useForm<PropertyFormValues>({
    validationSchema: toTypedSchema(propertySchema),
    initialValues: {
      title: '',
      address: '',
      zone: '',
      price: 0,
      type: 'APARTAMENTO',
      operationType: undefined as unknown as OperationType,
      m2: 0,
      rooms: 0,
      ownerId: '',
      imageUrls: [],
    },
  });

  const [titleModel] = defineField('title');
  const [addressModel] = defineField('address');
  const [zoneModel] = defineField('zone');
  const [priceModel] = defineField('price');
  const [typeModel] = defineField('type');
  const [operationTypeModel] = defineField('operationType');
  const [m2Model] = defineField('m2');
  const [roomsModel] = defineField('rooms');
  const [ownerIdModel] = defineField('ownerId');
  const [imageUrlsModel] = defineField('imageUrls');

  const loadOwners = async () => {
    try {
      const res = await userService.getUsers(0, 1000);
      owners.value = (res.data || []).filter(
        (u: User) => u.userType === 'OWNER' && u.status === 'ACTIVE'
      );
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const submit = handleSubmit(
    (values) => {
      emit('submit', {
        ...values,
        price: !isAgent.value || !props.propertyId ? values.price : 0,
        ownerId: values.ownerId || null,
        operationType: values.operationType as OperationType,
      } as PropertyFormPayload);
    },
    () => {
      toast.error(t('common.validationError'));
    }
  );

  watch(
    () => props.initialData,
    (data) => {
      if (data)
        setValues({
          title: String(data.title || ''),
          address: String(data.address || ''),
          zone: String(data.zone || ''),
          price: Number(data.price || 0),
          type: String(data.type || 'APARTAMENTO'),
          operationType: (data.operationType || '') as OperationType,
          m2: Number(data.m2 || 0),
          rooms: Number(data.rooms || 0),
          ownerId: String(data.ownerId || ''),
          imageUrls: (data.imageUrls as string[]) || [],
        });
    },
    { immediate: true }
  );

  onMounted(loadOwners);
</script>
