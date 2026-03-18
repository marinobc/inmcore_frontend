
import { ref } from 'vue'
import { userService } from '../services/userService'

const users = ref<any[]>([])
const roles = ref<any[]>([])

export function useUsers(){
  const load = async ()=>{
    users.value = await userService.getUsers()
    roles.value = await userService.getRoles()
  }

  const create = async (p:any)=>{
    const u = await userService.createUser(p)
    users.value.unshift(u)
  }

  const remove = async (id:number)=>{
    await userService.deleteUser(id)
    users.value = users.value.filter(u=>u.id!==id)
  }

  return { users, roles, load, create, remove }
}
