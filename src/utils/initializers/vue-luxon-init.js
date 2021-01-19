import Vue from 'vue'

import VueLuxon from 'vue-luxon'

const defaultVueLuxonOption = {
  input: {
    zone: "local",
    format: "iso"
  },
  output: {
    zone: "local",
    format: "yyyy-MM-dd HH:mm:ss"
  }
}

export const VueLuxonInitializer = {
  init() {
    const vueluxon = VueLuxon.vueluxon(defaultVueLuxonOption)
    Vue.prototype.$luxon = vueluxon
    Vue.filter("luxon", function () {
      if (typeof arguments[1] === 'string') {
        return vueluxon(arguments[0], arguments[2], {
          output: {
            format: arguments[1]
          }
        });
      }
      return vueluxon(arguments[0], arguments[1]);
    });
  },
}


