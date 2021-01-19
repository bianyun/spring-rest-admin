
import Vue from 'vue'
import Element from 'element-ui'
import * as Consts from '@/utils/consts'

const DEFAULT_CONFIG = {
  'success': {
    defaultDuration: Consts.DEFUALT_DURATION_SUCCESS
  },
  'warning': {
    defaultDuration: Consts.DEFUALT_DURATION_WARNING
  },
  'error': {
    defaultDuration: Consts.DEFUALT_DURATION_ERROR
  },
  'info': {
    defaultDuration: Consts.DEFUALT_DURATION_INFO
  },
}

function doInit(type, defaultDuration) {
  Vue.prototype.$message[type] = function(message) {
    const duration = defaultDuration

    if (typeof message === 'string') {
      Element.Message({ message, duration, type })
    } else if (typeof message === 'object') {
      Element.Message(Object.assign({ duration }, message, { type }))
    }
  }
}

export const VueNotifyInitializer = {
  init() {
    Object.keys(DEFAULT_CONFIG).forEach((key) => {
      const { defaultDuration } = DEFAULT_CONFIG[key]
      doInit(key, defaultDuration)
    })
  },
}

