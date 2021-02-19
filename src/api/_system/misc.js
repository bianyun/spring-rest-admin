import { CoreApi } from '@/api/_base/core-api'

const URL_PREFIX = '/sys/misc'

/**
 * 杂项接口
 */
class MiscApi extends CoreApi {
  constructor() {
    super(URL_PREFIX);
  }

  getEnumLabelNameMap() {
    return super.$_get('/enum-label-name-map')
  }

}

export const miscApi = new MiscApi()
