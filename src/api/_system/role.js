import { BaseApi } from '@/api/_base/base-api'

const URL_PREFIX = '/sys/roles'

/**
 * 角色管理接口
 */
class RoleApi extends BaseApi {
   constructor() {
     super(URL_PREFIX);
   }

  /**
   * 获取角色分配的权限
   * @param roleId {number} 角色ID
   * @returns {Promise}
   */
  fetchAssignedPermsByRoleId(roleId) {
    return super.$_get(`/${roleId}/assigned-perms`)
  }

  /**
   * 保存角色分配的权限
   *
   * @param roleId {number} 角色ID
   * @param data 权限数据
   * @returns {Promise}
   */
  saveAssignedPermsByRoleId(roleId, data) {
    return super.$_put(`/${roleId}/assigned-perms`, data)
  }
}

export const roleApi = new RoleApi()
