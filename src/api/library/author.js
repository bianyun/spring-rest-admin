import { BaseApi } from '@/api/_base/base-api'

const URL_PREFIX = '/lib/authors'

/**
 * 作者管理接口
 */
class AuthorApi extends BaseApi {
  constructor() {
    super(URL_PREFIX);
  }

}

export const authorApi = new AuthorApi()
