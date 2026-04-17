export type UserType = 'ADMIN' | 'EMPLOYEE' | 'OWNER' | 'INTERESTED_CLIENT';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  userType: UserType;
  status: string;
  primaryRoleIds: string[];
  birthDate?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  taxId?: string;
  preferredContactMethod?: string;
  budget?: string | number | null;
  assignedAgentId?: string;
  preferredZone?: string;
  preferredPropertyType?: string;
  preferredRooms?: number | string | null;
  nit?: string;
  address?: string;
  authUserId?: string;
};

export type UserFormPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: UserType;
  birthDate: string;
  department?: string;
  position?: string;
  hireDate?: string;
  taxId?: string;
  preferredContactMethod?: string;
  budget?: string | number | null;
  preferredZone?: string;
  preferredPropertyType?: string;
  preferredRooms?: string | number | null;
  address?: string;
  nit?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
