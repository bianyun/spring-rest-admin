import store from '@/store'
import { asyncRoutes, constantRoutes } from '@/router'
import { ALL_PERMS, ROLE_SUPERADMIN } from '@/utils/consts'

/**
 * 检查用户对某路由是否有权访问
 *
 * @param route 路由
 */
function hasPermission(route) {
  if (route.meta && route.meta.perm) {
    return store.getters.menuBtnPermSet.has(route.meta.perm)
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 */
export function filterAsyncRoutes(routes) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    // state.routes = constantRoutes.concat(routes)
    state.routes = [...constantRoutes, ...routes]
  }
}

const actions = {
  generateRoutes({ commit }) {
    return new Promise(resolve => {
      const { roleValueSet, menuBtnPermSet } = store.getters

      let accessedRoutes = []
      if (roleValueSet.has(ROLE_SUPERADMIN) && menuBtnPermSet.has(ALL_PERMS)) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
