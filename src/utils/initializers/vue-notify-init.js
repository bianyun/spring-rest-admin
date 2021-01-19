
import Vue from 'vue'
import Element from 'element-ui'
import * as Consts from '@/utils/consts'

const DEFAULT_CONFIG = {
  'success': {
    defaultTitle: '操作成功',
    defaultDuration: Consts.DEFUALT_DURATION_SUCCESS
  },
  'warning': {
    defaultTitle: '警告',
    defaultDuration: Consts.DEFUALT_DURATION_WARNING
  },
  'error': {
    defaultTitle: '错误',
    defaultDuration: Consts.DEFUALT_DURATION_ERROR
  },
  'info': {
    defaultTitle: '提示',
    defaultDuration: Consts.DEFUALT_DURATION_INFO
  },
}

function doInit(type, defaultTitle, defaultDuration) {
  Vue.prototype.$notify[type] = function(message) {
    const duration = defaultDuration
    const title = defaultTitle

    if (typeof message === 'string') {
      Element.Notification({ title, message, duration, type })
    } else if (typeof message === 'object') {
      Element.Notification(Object.assign({ title, duration }, message, { type }))
    }
  }
}

export const VueNotifyInitializer = {
  init() {
    Object.keys(DEFAULT_CONFIG).forEach((key) => {
      const { defaultTitle, defaultDuration } = DEFAULT_CONFIG[key]
      doInit(key, defaultTitle, defaultDuration)
    })
  },
}

