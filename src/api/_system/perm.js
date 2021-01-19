
import CoreApi from '@/api/_base/core-api'

const URL_PREFIX = '/sys/perms'

/**
 * 权限管理接口
 */
class PermApi extends CoreApi {
  constructor() {
    super(URL_PREFIX);
  }

  /**
   * 获取接口权限元数据
   *
   * @returns {Promise}
   */
  fetchApiPermMetaData() {
    return super.$_get('/meta/api')
  }

  /**
   * 获取菜单权限元数据
   * @param {Object} data 菜单权限数据
   *
   * @returns {Promise}
   */
  fetchMenuPermMetaData(data) {
    return super.$_post('/meta/menu', data)
  }

  /**
   * 同步菜单权限数据
   *
   * @param {Object} data 菜单权限数据
   * @returns {Promise}
   */
  syncMenuPerms(data) {
    return super.$_post('/sync-menu-perms-to-db', data)
  }

  /**
   * 同步接口权限数据
   *
   * @param {Object} data 菜单权限数据
   * @returns {Promise}
   */
  syncApiPerms(data) {
    return super.$_post('/sync-api-perms-to-db', data)
  }

  /**
   * 添加按钮权限
   *
   * @param {Object} data 按钮权限数据
   * @returns {Promise}
   */
  addButtonPerm(data) {
    return super.$_post('/buttons', data)
  }

  /**
   * 更新按钮权限
   *
   * @param {Object} data 按钮权限数据
   * @returns {Promise}
   */
  updateButtonPerm(data) {
    return super.$_put(`/buttons/${data.id}`, data)
  }

  /**
   * 删除按钮权限
   *
   * @param {number} id 要删除的按钮权限ID
   * @returns {Promise}
   */
  deleteButtonPermById(id) {
    return super.$_delete(`/buttons/${id}`)
  }

  /**
   * 菜单关联接口权限
   *
   * @param {string} menuPermValue 菜单权限值
   * @param {array} apiPermValues 接口权限值集合
   * @returns {Promise}
   */
  linkApiPermValuesToMenu(menuPermValue, apiPermValues) {
    return super.$_post(`/link-api-perms-to-menu`, { menuPermValue, apiPermValues })
  }
}

export default new PermApi()
