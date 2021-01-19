import store from '@/store'
import { ALL_PERMS, ROLE_SUPERADMIN } from '@/utils/consts'

export function hasPerm(perm) {
  const { menuBtnPermSet } = store.getters
  return !perm || isCurrentUserSuperAdmin() || menuBtnPermSet.has(perm)
}

export function isCurrentUserSuperAdmin() {
  const { roleValueSet, menuBtnPermSet } = store.getters
  return menuBtnPermSet.has(ALL_PERMS) && roleValueSet.has(ROLE_SUPERADMIN)
}

export function isCurrentUser(userId) {
  return userId === store.getters.userId
}

export function isCurrentUserHasRole(roleId) {
  return store.getters.roles.map(role => role.id).includes(roleId)
}
