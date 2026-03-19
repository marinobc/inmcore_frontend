export type Role = { 
  id: string;
  name: string;
  code: string; 
}

export type User = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  userType: 'ADMIN' | 'EMPLOYEE' | 'OWNER' | 'INTERESTED_CLIENT'
  status: string
  primaryRoleIds: string[]
}

export type LoginPayload = {
  email: string
  password: string
}

export type UserFormPayload = {
  name: string
  email: string
  phone: string
  roleId: string | null
  userType: 'ADMIN' | 'EMPLOYEE' | 'OWNER' | 'INTERESTED_CLIENT'
  birthDate: string
}