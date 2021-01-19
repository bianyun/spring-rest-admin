import Vue from 'vue'
import Cookies from 'js-cookie'
import 'normalize.css/normalize.css' // a modern alternative to CSS resets
import Element from 'element-ui'
import '@/styles/element-variables.scss'
import '@/styles/index.scss' // global css
import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log
import * as filters from './filters'
import { VueLuxonInitializer } from '@/utils/initializers/vue-luxon-init'
import { VueNotifyInitializer } from '@/utils/initializers/vue-notify-init'


Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  //locale: enLang // 如果使用中文，无需设置，请删除
})
Vue.config.productionTip = false

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

VueLuxonInitializer.init()
VueNotifyInitializer.init()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
