
export type Role = { id: number; name: string }

export type User = {
  id: number
  name: string
  email: string
  phone: string
  password: string
  roleId: number
  roleName: string
  createdAt: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type UserFormPayload = {
  name: string
  email: string
  phone: string
  password: string
  roleId: number | null
}
