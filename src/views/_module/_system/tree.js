import { MenuType, PermType } from '@/utils/enums'
import { asyncRoutes } from '@/router'
import store from '@/store'
import { ROLE_SUPERADMIN } from '@/utils/consts'
import { SysPerms } from '@/utils/enums/perms/system'

export default {
  /**
   * 递归生成菜单权限 和 按钮权限 合并之后的树
   *
   * @param btnPermMap 菜单权限值 到 按钮权限列表的MAP
   * @param menuPermTree 菜单权限树
   * @returns {*}
   */
  buildMenuBtnPermTree(btnPermMap, menuPermTree) {
    return this.mapToMenuBtnPermTree(btnPermMap, menuPermTree)
  },

  /**
   * 根据前端定义的路由表，生成菜单权限列表
   */
  buildMenuPermTree() {
    // 预处理
    let routeArr = asyncRoutes.map((route) => {
      let temp = Object.assign({}, route)
      if (!temp['alwaysShow'] && temp.children && temp.children.length === 1) {
        // 如果是只有一个子菜单的顶级菜单，把子级的菜单meta复制到父级用于生成菜单树时显示菜单名称
        temp.meta = temp.children[0].meta
        temp.children = []
      }
      return temp
    })
    //过滤路由表，得到需要进行权限控制的菜单树
    let permissionControlRoutes = this.filterPermControlRouter(routeArr)
    //递归形成菜单树
    return this.mapToMenuPermTree(permissionControlRoutes, null)
  },

  /**
   * 根据输入的路由表过滤出一个需要进行权限控制的路由表
   * @param routeArr
   */
  filterPermControlRouter(routeArr) {
    const { roleValueSet } = store.getters

    return routeArr.filter((route) => {
      if (route.meta && route.meta.perm) {
        if (!roleValueSet.has(ROLE_SUPERADMIN) &&
                route.meta.perm.startsWith(SysPerms.menu_sys_perm)) {
          return false
        }
        if (route.children && route.children.length) {
          route.children = this.filterPermControlRouter(route.children)
        }
        return true
      }
      return false
    })
  },

  /**
   * 根据输入的路由表，生成菜单权限树
   *
   * @param routeArr {array} 路由表
   * @param parentValue {string} 父亲节点权限值
   */
  mapToMenuPermTree(routeArr, parentValue) {
    return routeArr.map((route) => {
      let obj = {}
      if (route.meta && route.meta.perm) {
        obj.value = route.meta.perm
        obj.name = route.meta.title
        obj.permType = PermType.MENU
        obj.parentMenuValue = parentValue
      }
      if (route.children) {
        obj.children = this.mapToMenuPermTree(route.children, obj.value)
      }

      if (route['alwaysShow'] || (route.children && route.children.length > 0)) {
        obj.menuType = MenuType.DIR
      } else if (route.path.startsWith('http')) {
        obj.menuType = MenuType.LINK
      } else {
        obj.menuType = MenuType.PAGE
      }

      return obj
    })
  },

  /**
   * 根据菜单树，生成按钮权限树
   * @param btnPermMap 按钮权限，按parent分组
   * @param menuPermTree 菜单树
   */
  mapToMenuBtnPermTree(btnPermMap, menuPermTree) {
    return menuPermTree.map((perm) => {
      if (perm) {
        if (!perm.children) {
          perm.children = []
        }
        if (perm.permType === PermType.MENU) {
          let btnPerms = btnPermMap[perm.value]
          if (btnPerms) {
            btnPerms.forEach((p) => {
              perm.children.push(p)
            })
          }
        }
        if (perm.children && perm.children.length > 0) {
          this.mapToMenuBtnPermTree(btnPermMap, perm.children)
        }
      }
      return perm
    })
  },
}
