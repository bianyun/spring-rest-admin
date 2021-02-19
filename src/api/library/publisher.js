import { BaseApi } from '@/api/_base/base-api'

const URL_PREFIX = '/lib/publishers'

/**
 * 出版社管理接口
 */
class PublisherApi extends BaseApi {
  constructor() {
    super(URL_PREFIX);
  }

}

export const publisherApi = new PublisherApi()
