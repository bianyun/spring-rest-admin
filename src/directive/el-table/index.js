import adaptive from './adaptive'

const install = function(Vue) {
  Vue.directive('el-height-adaptive-table', adaptive)
}

if (window.Vue) {
  window['el-height-adaptive-table'] = adaptive
  window.Vue.use(install); // eslint-disable-line
}

adaptive.install = install
export default adaptive
