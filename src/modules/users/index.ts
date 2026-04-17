/**
 * Users Module
 *
 * User management and profile functionality
 */

export { userService } from './services/userService';
export { personService } from './services/personService';

export { useUsers } from './composables/useUsers';
export { useAgentClients } from './composables/useAgentClients';
export { useAgentOwners } from './composables/useAgentOwners';
export { useEmailValidation } from './composables/useEmailValidation';

export {
  userSchema,
  employeeFields,
  ownerFields,
  clientPreferencesSchema,
} from './schemas/userSchema';
export type {
  UserFormValues,
  EmployeeFormValues,
  OwnerFormValues,
  ClientPreferencesValues,
} from './schemas/userSchema';

export type { User, UserType } from './types/user';
