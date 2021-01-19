import perm from './perm'

const install = function (Vue) {
  Vue.directive('perm', perm)
}

if (window.Vue) {
  window['perm'] = perm
  window.Vue.use(install) // eslint-disable-line
}

perm.install = install
export default perm
