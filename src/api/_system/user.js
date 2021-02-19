import { BaseApi } from '@/api/_base/base-api'

const URL_PREFIX = '/sys/users'

/**
 * 用户管理接口
 */
class UserApi extends BaseApi {
  constructor() {
    super(URL_PREFIX);
  }

  /**
   * 启用用户
   *
   * @returns {Promise}
   */
  activateUserById(userId) {
    return super.$_post(`/${userId}/activate`)
  }

  /**
   * 停用用户
   *
   * @returns {Promise}
   */
  deactivateUserById(userId) {
    return super.$_post(`/${userId}/deactivate`)
  }

  /**
   * 获取当前登录用户的资料
   *
   * @returns {Promise}
   */
  getCurrentUserProfile() {
    return super.$_get('/current-user-profile')
  }

  /**
   * 更新当前用户的密码
   *
   * @returns {Promise}
   */
  updatePasswordForCurrentUser(data) {
    return super.$_post('/update-password-for-current-user', data)
  }

  /**
   * 获取用户的角色列表
   *
   * @param {number} userId 用户ID
   * @returns {Promise}
   */
  getRolesByUserId(userId) {
    return super.$_get(`/${userId}/roles`)
  }

  /**
   * 保存用户分配的角色
   *
   * @param userId {number} 用户ID
   * @param roleIds {array} 角色ID集合
   */
  saveAssignedRolesByUserId(userId, roleIds) {
    return super.$_put(`/${userId}/roles`, roleIds)
  }
}

export const userApi = new UserApi()
