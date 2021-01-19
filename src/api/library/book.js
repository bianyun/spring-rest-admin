import BaseApi from '@/api/_base/base-api'

const URL_PREFIX = '/lib/books'

/**
 * 图书管理接口
 */
class BookApi extends BaseApi {
  constructor() {
    super(URL_PREFIX);
  }

}

export default new BookApi()
