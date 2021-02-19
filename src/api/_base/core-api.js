import axiosInstance from '@/utils/request'

/**
 * 核心HTTP请求
 */
export class CoreApi {
  /**
   * 构造方法
   *
   * @param {string} urlPrefix 请求路径前缀（对应后台类映射配置路径）
   */
  constructor(urlPrefix) {
    this.urlPrefix = urlPrefix
  }

  /**
   * 将不带类请求路径前缀的路径补齐
   *
   * @param {string} urlWithOutPrefix 未加类映射路径前缀的URL（对应后台方法的相对映射路径）
   * @returns {string} 补齐后的 URL
   */
  $_prependPrefix(urlWithOutPrefix) {
    return `${this.urlPrefix}${urlWithOutPrefix}`
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * 发起 HTTP 请求
   *
   * @param {string} urlWithOutPrefix 未加类映射路径前缀的URL（对应后台方法的相对映射路径）
   * @param {Object} axiosConfig axios配置对象
   * @returns {Promise}
   */
  $_request(urlWithOutPrefix, axiosConfig) {
    const mergedConfig = Object.assign(axiosConfig, { url: this.$_prependPrefix(urlWithOutPrefix) })
    return axiosInstance.request(mergedConfig)
  }

  /**
   * 发起 GET 请求
   *
   * @param {string} urlWithOutPrefix 未加类映射路径前缀的URL（对应后台方法的相对映射路径）
   * @param {Object} [data={}] 请求数据
   * @returns {Promise}
   */
  $_get(urlWithOutPrefix, data = {}) {
    return axiosInstance.get(this.$_prependPrefix(urlWithOutPrefix), { params: {...data}})
  }

  /**
   * 发起 POST 请求
   *
   * @param {string} urlWithOutPrefix 未加类映射路径前缀的 URL（对应后台方法的相对映射路径）
   * @param {Object} [data={}] 请求数据
   * @returns {Promise}
   */
  $_post(urlWithOutPrefix, data = {}) {
    return axiosInstance.post(this.$_prependPrefix(urlWithOutPrefix), data)
  }

  /**
   * 发起 PUT 请求
   *
   * @param {string} urlWithOutPrefix 未加类映射路径前缀的 URL（对应后台方法的相对映射路径）
   * @param {Object} data 请求数据
   * @returns {Promise}
   */
  $_put(urlWithOutPrefix, data) {
    return axiosInstance.put(this.$_prependPrefix(urlWithOutPrefix), data)
  }

  /**
   * 发起 DELETE 请求
   *
   * @param {string} urlWithOutPrefix 未加类映射路径前缀的 URL（对应后台方法的相对映射路径）
   * @returns {Promise}
   */
  $_delete(urlWithOutPrefix) {
    return axiosInstance.delete(this.$_prependPrefix(urlWithOutPrefix))
  }

  /**
   * 发起 Batch DELETE 请求
   *
   * @param {string} urlWithOutPrefix 未加类映射路径前缀的 URL（对应后台方法的相对映射路径）
   * @param {[number]} idSet 待删除的ID 集合
   * @returns {Promise}
   */
  $_batch_delete(urlWithOutPrefix, idSet) {
    return axiosInstance.delete(this.$_prependPrefix(urlWithOutPrefix), { data: [...new Set(idSet)] })
  }

}
