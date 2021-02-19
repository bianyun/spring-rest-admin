
import { CoreApi } from '@/api/_base/core-api'

// noinspection JSUnusedGlobalSymbols
/**
 * 基础接口，对应后台 AbstractBaseController 中包含的接口方法
 */
export class BaseApi extends CoreApi {
  constructor(urlPrefix) {
    super(urlPrefix)
  }

  /**
   * 获取所有对象
   *
   * @returns {Promise}
   */
  $getAll() {
    return super.$_get('')
  }

  /**
   * 新增对象
   *
   * @param {Object} data 对象数据
   * @returns {Promise}
   */
  $create(data) {
    return super.$_post('', data)
  }

  /**
   * 更新对象
   *
   * @param {Object} data 对象数据
   * @returns {Promise}
   */
  $update(data) {
    return super.$_put(`/${data.id}`, data)
  }

  /**
   * 根据 ID 查找对象
   *
   * @param {number} id 对象ID
   * @returns {Promise}
   */
  $findById(id) {
    return super.$_get(`/${id}`)
  }

  /**
   * 根据 ID 删除对象
   *
   * @param {number} id 对象ID
   * @returns {Promise}
   */
  $deleteById(id) {
    return super.$_delete(`/${id}`)
  }

  /**
   * 根据 ID集合 批量删除对象
   *
   * @param {[number]} idSet ID集合
   * @returns {Promise}
   */
  $batchDeleteByIdSet(idSet) {
    return super.$_batch_delete('/batch', idSet)
  }

  /**
   * 分页扁平查询
   *
   * @param {Object} pageQueryParam 分页查询参数
   * @returns {Promise}
   */
  $pageFlatQuery(pageQueryParam) {
    return super.$_get('/page-query-flat', pageQueryParam)
  }
}
