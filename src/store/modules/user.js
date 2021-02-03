import authApi from '@/api/_system/auth'
import userApi from '@/api/_system/user'
import { getToken, removeToken, setToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import avatarDefault from '@/assets/image/avatar-default.jpg'
import { ROLE_SUPERADMIN } from '@/utils/consts'

const state = {
  token: getToken(),
  userId: null,
  username: '',
  nickname: '',
  realname: '',
  avatar: '',
  introduction: '',
  roles: [],
  menuPerms: [],
  btnPerms: [],
  apiPerms: [],
  roleNameSet: new Set(),
  roleValueSet: new Set(),
  menuBtnPermSet: new Set(),
  demoModeEnabled: false,
  demoPreservedUsers: [],
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_USER_ID: (state, userId) => {
    state.userId = userId
  },
  SET_USERNAME: (state, username) => {
    state.username = username
  },
  SET_NICKNAME: (state, nickname) => {
    state.nickname = nickname
  },
  SET_REALNAME: (state, realname) => {
    state.realname = realname
  },
  SET_AVATAR: (state, avatar) => {
    if (!avatar) {
      state.avatar = avatarDefault
    } else {
      state.avatar = avatar
    }
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
    state.roleNameSet = new Set(roles.map(role => role.name))
    state.roleValueSet = new Set(roles.map(role => role.value))
  },
  SET_MENU_PERMS: (state, menuPerms) => {
    state.menuPerms = menuPerms
  },
  SET_BUTTON_PERMS: (state, btnPerms) => {
    state.btnPerms = btnPerms
  },
  SET_API_PERMS: (state, apiPerms) => {
    state.apiPerms = apiPerms
  },
  SET_MENU_BUTTON_PERM_SET: (state, menuBtnPermSet) => {
    state.menuBtnPermSet = menuBtnPermSet
  },
  SET_DEMO_MODE_ENABLED: (state, demoModeEnabled) => {
    state.demoModeEnabled = demoModeEnabled
  },
  SET_DEMO_PRESERVED_USERS: (state, demoPreservedUsers) => {
    state.demoPreservedUsers = demoPreservedUsers
  },
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      authApi
        .login({ username: username.trim(), password: password })
        .then(response => {
          const { token } = response
          commit('SET_TOKEN', token)
          setToken(token)
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },


  // get user info
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      userApi.getCurrentUserProfile()
        .then(response => {
          if (!response) {
            reject('获取用户资料出错')
          }

          const { user, roles, menuPerms, btnPerms, apiPerms, demoModeEnabled, demoPreservedUsers } = response
          const { id, username, realname, nickname, pictureUrl } = user
          commit('SET_ROLES', roles)
          commit('SET_DEMO_MODE_ENABLED', demoModeEnabled)
          commit('SET_DEMO_PRESERVED_USERS', demoPreservedUsers)

          if (!roles.some(role => role.value === ROLE_SUPERADMIN)) {
            commit('SET_MENU_PERMS', menuPerms)
            commit('SET_BUTTON_PERMS', btnPerms)
            commit('SET_API_PERMS', apiPerms)

            const menuPermValues = menuPerms.map(perm => perm.value)
            const btnPermValues = btnPerms.map(perm => perm.value)
            commit('SET_MENU_BUTTON_PERM_SET', new Set([...menuPermValues, ...btnPermValues]))
          } else {
            commit('SET_MENU_BUTTON_PERM_SET', new Set(['*']))
          }

          commit('SET_USER_ID', id)
          commit('SET_USERNAME', username)
          commit('SET_REALNAME', realname)
          commit('SET_NICKNAME', nickname)
          commit('SET_AVATAR', pictureUrl)
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      authApi
        .logout(state.token)
        .then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_MENU_BUTTON_PERM_SET', new Set())
          removeToken()
          resetRouter()

          // reset visited views and cached views
          // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
          dispatch('tagsView/delAllViews', null, { root: true })

          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async refreshRoutes({ dispatch }) {
    await dispatch('getInfo')
    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', null, {
      root: true,
    })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
