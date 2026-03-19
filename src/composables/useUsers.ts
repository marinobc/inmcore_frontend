
import { ref } from 'vue'
import { userService } from '../services/userService'

const users = ref<any[]>([])
const roles = ref<any[]>([])

export function useUsers(){
  const load = async ()=>{
    try {
      users.value = await userService.getUsers()
      roles.value = await userService.getRoles()
    } catch (e) {
      console.error('Failed to load data:', e)
    }
  }

  const create = async (p:any)=>{
    const u = await userService.createUser(p)
    users.value.unshift(u)
  }

  const remove = async (id: string | number) => {
    await userService.deleteUser(id)
    users.value = users.value.filter(u => u.id !== id)
  }

  const update = async (id: string | number, payload: any) => {
    const updated = await userService.updateUser(id, payload)
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updated }
    }
  }

  return { users, roles, load, create, remove, update }
}
