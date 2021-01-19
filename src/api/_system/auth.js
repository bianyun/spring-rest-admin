
import CoreApi from '@/api/_base/core-api'

const URL_PREFIX = '/sys/auth'

/**
 * 登录接口
 */
class AuthApi extends CoreApi {
  constructor() {
    super(URL_PREFIX);
  }

  login(data) {
    return super.$_post('/login', data)
  }

  logout() {
    return super.$_post('/logout')
  }
}

export default new AuthApi()
