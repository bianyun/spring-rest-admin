<template>
  <div class="app-container dashboard-editor-container">
    <div class=" clearfix">
      <el-card class="outer-card-box">
        <div class="pan-item">
          <div class="pan-info"></div>
          <img class="pan-thumb" :src="avatar" alt="avatar">
        </div>
        <div class="info-container">
          <div class="user-info">
            {{ resolvedDisplayName }}
            <el-tag :type="resolveTagType(role)" size="mini" effect="dark" v-for="role in roles" :key="role.name">
              {{ role.name }}
            </el-tag>
          </div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="perms-card" header="菜单按钮权限">
                <el-scrollbar-fix :vertical="true">
                  <el-tree
                      :ref="menuBtnTreeRef"
                      :data="menuBtnTreeData"
                      :props="menuBtnTreePropsConfig"
                      node-key="value"
                      show-checkbox
                      check-strictly
                      :default-expanded-keys="menuBtnTreeDefaultExpandedKeys"
                      :default-checked-keys="menuBtnTreeDefaultCheckedKeys"
                      :expand-on-click-node="true"
                  >
                  <span class="custom-tree-node" slot-scope="{ data: { name, value, permType, menuType } }">
                    <span>
                      <el-tag class="node-type" type="info" size="mini"
                              v-if="permType === MENU && menuType === DIR">目录</el-tag>
                      <el-tag class="node-type" type="success" size="mini"
                              v-else-if="permType === MENU && menuType === PAGE">菜单</el-tag>
                      <el-tag class="node-type" type="primary" size="mini"
                              v-else-if="permType === MENU && menuType === LINK">外链</el-tag>
                      <el-tag class="node-type" type="warning" size="mini" v-else-if="permType === BUTTON">按钮</el-tag>
                      <span class="node-label">{{ name }}</span>
                      <el-tag class="sync-status" type="danger" size="mini"
                              v-if="permType === MENU && unsyncedMenuPermValueSet.has(value)">未同步</el-tag>
                    </span>
                  </span>
                  </el-tree>
                </el-scrollbar-fix>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="perms-card" header="接口权限">
                <el-scrollbar-fix :vertical="true">
                  <el-tree
                      :ref="apiPermTreeRef"
                      :data="apiPermTreeData"
                      :props="apiPermTreePropsConfig"
                      node-key="value"
                      show-checkbox
                      :default-expanded-keys="apiPermTreeDefaultExpandedKeys"
                      :default-checked-keys="apiPermTreeDefaultCheckedKeys"
                      :expand-on-click-node="true"
                  >
                    <span class="custom-tree-node" slot-scope="{ data: { name, value, permLevel } }">
                      <span>
                        <el-tag class="node-type" v-if="permLevel === GROUP" size="mini" type="info">目录</el-tag>
                        <el-tag class="node-type" v-else-if="permLevel === CLASS" type="warning" size="mini">分组</el-tag>
                        <el-tag class="node-type" v-else type="primary" size="mini">接口</el-tag>
                        <span class="node-label">{{ name }}</span>
                        <el-tag v-if="unsyncedApiPermValueSet.has(value)" class="sync-status" type="danger" size="mini">未同步</el-tag>
                      </span>
                    </span>
                  </el-tree>
                </el-scrollbar-fix>
              </el-card>

            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>
  </div>
</template>


<script>
import { mapGetters } from 'vuex'
import { MenuType, PermLevel, PermType } from '@/utils/enums'
import treeUtil from '@/views/_module/_system/tree'
import permApi from '@/api/_system/perm'
import ElScrollbarFix from '@/components/ElScrollBarFix'

export default {
  name: 'Dashboard',
  components: { ElScrollbarFix },
  data() {
    return {
      ...PermType,
      ...MenuType,
      ...PermLevel,

      menuBtnTreeRef: 'menuBtnTreeRef',
      menuBtnTreeData: [],
      unsyncedMenuPermValueSet: [],
      menuBtnTreeDefaultExpandedKeys: [],
      menuBtnTreeDefaultCheckedKeys: [],
      menuBtnTreePropsConfig: {
        label: 'name',
        children: 'children',
        disabled: function() {
          return true
        },
      },

      apiPermTreeRef: 'apiPermTreeRef',
      apiPermTreeData: [],
      unsyncedApiPermValueSet: [],
      apiPermTreeDefaultExpandedKeys: [],
      apiPermTreeDefaultCheckedKeys: [],
      apiPermTreePropsConfig: {
        label: 'name',
        children: 'children',
        disabled: function() {
          return true
        },
      },
    }
  },
  computed: {
    ...mapGetters([
      'username',
      'nickname',
      'realname',
      'avatar',
      'roles',
      'apiPerms',
      'menuPerms',
      'btnPerms',
      'menuBtnPermSet',
    ]),
    resolvedDisplayName() {
      if (this.nickname) {
        return this.realname ? (this.nickname + " · " + this.realname) : this.nickname
      } else {
        return this.realname || this.username
      }
    },
  },
  created() {
    this.loadMenuBtnPermTree()
    this.loadApiPermTreeData()
  },
  methods: {
    resolveTagType(role) {
      if (role.value.toLowerCase().indexOf('admin') > -1) {
        return 'primary'
      } else {
        return 'info'
      }
    },
    async loadMenuBtnPermTree() {
      const menuPermTree = treeUtil.buildMenuPermTree()
      const menuPermMetaData = await permApi.fetchMenuPermMetaData(menuPermTree)

      this.unsyncedMenuPermValueSet = new Set(menuPermMetaData['unsyncedMenuPermValues'])
      this.menuToBtnPermsMap = menuPermMetaData['menuPermValueToButtonPermsMap']
      this.menuToApiPermValuesMap = menuPermMetaData['menuPermValueToApiPermValuesMap']
      this.menuBtnTreeData = treeUtil.buildMenuBtnPermTree(this.menuToBtnPermsMap, menuPermTree)

      this.menuBtnTreeData.forEach(menu => {
        if (this.unsyncedMenuPermValueSet.has(menu.value)) {
          menu.synced = false
        }

        if (menu.children) {
          menu.children.forEach(childMenu => {
            if (this.unsyncedMenuPermValueSet.has(childMenu.value)) {
              childMenu.synced = false
            }
          })
        }
      })
      const assignedTopMenus = this.menuPerms.filter(perm => perm.parentMenuValue === null).map(perm => perm.value)
      this.menuBtnTreeDefaultExpandedKeys = [...this.btnPerms.map(perm => perm.value), ...assignedTopMenus]
      this.menuBtnTreeDefaultCheckedKeys = [...this.menuBtnPermSet]

      console.log(JSON.stringify(this.menuBtnTreeDefaultCheckedKeys))
    },

    async loadApiPermTreeData() {
      const { apiPermTreeData, unsyncedApiPermValues } = await permApi.fetchApiPermMetaData()
      this.apiPermTreeData = apiPermTreeData

      this.unsyncedApiPermValueSet = new Set(unsyncedApiPermValues)
      const assignedApiPermValues = this.apiPerms.map(perm => perm.value)
      this.apiPermTreeDefaultExpandedKeys = [...assignedApiPermValues, ...apiPermTreeData.map(perm => perm.value)]
      this.apiPermTreeDefaultCheckedKeys = [...assignedApiPermValues]
    },
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/styles/variables.scss";

.pan-info {
  position: absolute;
  width: inherit;
  height: inherit;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: inset 0 0 0 5px rgba(0, 0, 0, 0.05);
}

.pan-item {
  float: left;
  z-index: 1;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  cursor: default;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.pan-thumb {
  width: 100%;
  height: 100%;
  background-size: 100%;
  border-radius: 50%;
  overflow: hidden;
  position: absolute;
  transform-origin: 95% 40%;
  transition: all 0.3s ease-in-out;
}

.emptyGif {
  display: block;
  width: 45%;
  margin: 0 auto;
}

.dashboard-editor-container {
  min-height: calc(88vh + #{$tagsViewHeight});
  background-color: #F2F6FC;
}

.hasTagsView {
  .dashboard-editor-container {
    min-height: 88vh;
  }
}

.pan-info-roles {
  font-size: 12px;
  font-weight: 700;
  color: #333;
  display: block;
}

$infoContainerHeight: 100px;
$cardBodyDefaultPadding: 20px;

.info-container {
  position: relative;
  margin-left: 190px;
  height: $infoContainerHeight;

  .user-info {
    font-size: 40px;
    line-height: $infoContainerHeight;
    color: #212121;

    .el-tag {
      margin-right: 5px;
    }
  }

}

$outerCardBoxPaddingTop: 20px;
$outerCardBoxPaddingBottom: 20px;
.outer-card-box {
  padding: $outerCardBoxPaddingTop 0 $outerCardBoxPaddingBottom 20px;
}

$permsCardHeaderHeight: 60px;
$permsCardBodyPaddingTop: 20px;
$permsCardBodyPaddingBottom: 20px;
.perms-card {
  ::v-deep {
    .el-card__header {
      padding-left: 20px;
      font-size: 18px;
    }
    .el-card__body {
      padding-top: $permsCardBodyPaddingTop;
      padding-right: 10px;
      padding-bottom: $permsCardBodyPaddingBottom;
    }
  }
}

$heightExceptScrollBarInContainer: 4px + $navBarHeight + 2*$appContainerPadding + $outerCardBoxPaddingTop +
                                    $outerCardBoxPaddingBottom + $infoContainerHeight + $cardBodyDefaultPadding +
                                    $permsCardHeaderHeight + $permsCardBodyPaddingTop + $permsCardBodyPaddingBottom;

::v-deep {
  .el-scrollbar {
    height: calc(100vh - #{$heightExceptScrollBarInContainer});
    .el-scrollbar__wrap {
      height: calc(100vh - #{$heightExceptScrollBarInContainer});
      margin-bottom: 10px;
      padding-right: 15px;
    }
    .el-scrollbar__bar.is-vertical {
      margin-right: 2px;
      width: 3px;
    }
  }
}

.hasTagsView {
  .el-scrollbar {
    height: calc(100vh - #{$heightExceptScrollBarInContainer + $tagsViewHeight});
    ::v-deep .el-scrollbar__wrap {
      height: calc(100vh - #{$heightExceptScrollBarInContainer + $tagsViewHeight});
    }
  }
}

.hasPageFooter {
  .el-scrollbar {
    height: calc(100vh - #{$heightExceptScrollBarInContainer + 0.5*$pageFooterHeight});
    ::v-deep .el-scrollbar__wrap {
      height: calc(100vh - #{$heightExceptScrollBarInContainer + 0.5*$pageFooterHeight});
    }
  }
}

.hasTagsView.hasPageFooter {
  .el-scrollbar {
    height: calc(100vh - #{$heightExceptScrollBarInContainer + $tagsViewHeight + 0.5*$pageFooterHeight});
    ::v-deep .el-scrollbar__wrap {
      height: calc(100vh - #{$heightExceptScrollBarInContainer + $tagsViewHeight + 0.5*$pageFooterHeight});
    }
  }
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;

  .node-type {
    margin-left: 2px;
  }

  .node-label {
    margin-left: 10px;
  }

  .sync-status {
    margin-left: 8px;
  }
}

::v-deep {
  .el-scrollbar__wrap {
    overflow-x: hidden !important;
  }

  .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
    background-color: #79bbff;
    border-color: #79bbff;
  }

  .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
    border-color: #ffffff;
  }
}

</style>
