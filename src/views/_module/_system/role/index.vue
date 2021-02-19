<template>
  <div class="app-container">
    <filter-container :no-table-level-buttons="!hasPermAdd && !hasPermBatchDelete"
                      :flat-table-prfix="flatTablePrefix" :data-query-func="fetchTableData"
                      :filter-items="filterItems"></filter-container>
    <table-level-buttons
        :has-perm-add="hasPermAdd"
        :has-perm-batch-delete="hasPermBatchDelete"
        :multiple-selection-array="multipleSelection"
        :add-btn-click-handler="onAddBtnClick"
        :batch-delete-btn-click-handler="onBatchDeleteBtnClick">
    </table-level-buttons>

    <el-table
      :ref="tableName"
      style="width: 100%"
      :data="tableData"
      v-loading="tableDataLoading"
      @selection-change="handleSelectionChange"
      border
      fit
      highlight-current-row>
      <el-table-column v-if="hasPermBatchDelete" type="selection" width="50" align="center"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('id')" label="ID" min-width="50" align="center"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('name')" label="角色名" min-width="100" align="center"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('value')" label="角色值" min-width="100" align="center"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('description')" label="角色描述" min-width="250"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('created_time')" label="创建时间" min-width="155" align="center" :formatter="tableColumnDateTimeFormatter"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('last_modified_time')" label="更新时间" min-width="155" align="center" :formatter="tableColumnDateTimeFormatter"></el-table-column>

      <table-operation-column :show-action-column="showActionColumn" :operation-items="tableOperationItems" :width="180"></table-operation-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQueryParam.pageNumber"
                :page-sizes="pageSizes" :limit.sync="pageQueryParam.pageSize" @pagination="onPagination" />

    <el-dialog :title="editDialogStatus + label" :visible.sync='showEditDialog' :width="resolveDynamicRatioWidth('460px')"
               :top="resolveDialogMarginTop('25vh')" @close='resetDataForm(dataFormRef)' :close-on-click-modal='false'>
      <el-form :rules="rules" :ref="dataFormRef" :model="tempFormModel" label-width="70px">
        <el-form-item label="角色名" prop="name">
          <el-input  v-model.trim="tempFormModel.name"
                    placeholder="长度在 2 到 8 个字符"></el-input>
        </el-form-item>
        <el-form-item label="角色值" prop="value">
          <el-input v-model.trim="tempFormModel.value"
                    placeholder="长度在 3 到 20 个字符"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input maxlength="100" v-model="tempFormModel.description"
                     type="textarea" :autosize="{ minRows: 2, maxRows: 6}"
                    placeholder="角色描述最多不能超过100个字符">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="onEditDialogConfirm()">确定</el-button>
      </div>
    </el-dialog>

    <!-- 弹窗：角色关联菜单按钮权限 -->
    <el-dialog :width="resolveDynamicRatioWidth('460px')" :top="resolveDialogMarginTop('15vh')"
               :visible.sync="showAssignPermDialog"
               :close-on-click-modal="true">
      <template slot="title">
        <span class="el-dialog__title">角色分配权限（{{ tempFormModel.name }}）</span>
        <span style="display: block; margin-top: 5px">
          <el-tag size="mini">
            <span style="font-size: x-small; font-weight: normal">已选</span>
          </el-tag>
          <el-tag size="mini" type="success" style="margin-left: 5px">
            <span style="font-size: x-small; font-weight: normal">
              菜单 {{checkedCountOfMenuPerm}} 项
            </span>
          </el-tag>
          <el-tag size="mini" type="warning" style="margin-left: 5px">
            <span style="font-size: x-small; font-weight: normal">
              按钮 {{checkedCountOfBtnPerm}} 项
            </span>
          </el-tag>
        </span>
      </template>
      <el-scrollbar style="height:300px;">
        <el-tree
            v-if="showMenuBtnTree"
            :ref="menuBtnTreeRef"
            :data="menuBtnTreeData"
            :props="menuBtnTreePropsConfig"
            node-key="value"
            :check-strictly="true"
            check-on-click-node
            @check="onMenuBtnTreeNodeCheck"
            show-checkbox
            :default-expanded-keys="menuBtnTreeDefaultExpandedKeys"
            :expand-on-click-node="false"
        >
          <span class="custom-tree-node" slot-scope="{ data: { name, value, permType, menuType } }">
            <span>
              <el-tag class="node-type" type="info" size="mini" v-if="permType === MENU && menuType === DIR">目录</el-tag>
              <el-tag class="node-type" type="success" size="mini" v-else-if="permType === MENU && menuType === PAGE">菜单</el-tag>
              <el-tag class="node-type" type="primary" size="mini" v-else-if="permType === MENU && menuType === LINK">外链</el-tag>
              <el-tag class="node-type" type="warning" size="mini" v-else-if="permType === BUTTON">按钮</el-tag>
              <span class="node-label">{{ name }}</span>
              <el-tag class="sync-status" type="danger" size="mini"
                      v-if="permType === MENU && unsyncedMenuPermValueSet.has(value)">未同步</el-tag>
            </span>
          </span>
        </el-tree>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deCheckAllMenuBtnPermTreeNodes" :disabled="checkedCountOfMenuBtnPermTree === 0"
                   style="float:left" type="danger" plain>清空全部</el-button>
        <el-button @click="showAssignPermDialog = false">取消</el-button>
        <el-button @click="onAssignPermDialogConfirm" type="primary">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { roleApi } from '@/api/_system/role'
import { permApi } from '@/api/_system/perm'
import { LowerPermType, MenuType, PermType } from '@/utils/enums'
import treeUtil from '@/views/_module/_system/tree'
import { SysPerms } from '@/utils/enums/perms/system'
import { hasPerm, isCurrentUserHasRole, isCurrentUserSuperAdmin } from '@/utils/permission'
import rules from 'element-ui-validation'
import baseListPageMixin from '@/views/_module/_mixins/base-list-page-mixin'

export default {
  name: 'SystemRoleManage',
  mixins: [baseListPageMixin],
  data() {
    const initTempFormModel = {
      id: null,
      name: '',
      value: '',
      description: '',
    }

    return {
      label: '角色',
      pageId: 'sys_role',
      confirmLabelColumn: 'name',
      api: roleApi,
      pagePerms: SysPerms,
      initTempFormModel,

      ...PermType,
      ...MenuType,

      filterItems: [
        { type: 'input', field: 'name', label: '角色名' },
        { type: 'input', field: 'value', label: '角色值' },
        { type: 'date-range', field: 'created_time', label: '创建时间' },
      ],

      tableOperationItems: [
        { shape: 'circle', label: '编辑', buttonType: 'primary', icon: 'edit', visibleFunc: () => this.hasPermUpdate, clickHandler: this.onEditBtnClick },
        { shape: 'circle', label: '分配权限', buttonType: 'warning', icon: 'view', visibleFunc: () => this.hasPermAssignPermsToRole, clickHandler: this.onAssignPermBtnClick },
        { shape: 'circle', label: '删除', buttonType: 'danger', icon: 'delete', visibleFunc: () => this.hasPermDelete, clickHandler: this.onDeleteBtnClick },
      ],

      tempFormModel: Object.assign({}, initTempFormModel),
      rules: {
        name: rules.string('角色名', 8, 2, 'change'),
        value: rules.string('角色值', 20, 3, 'change'),
        description: rules.string('角色值', 100, null, 'change', false),
      },

      showAssignPermDialog: false,
      showMenuBtnTree: false,
      menuBtnTreeRef: 'menuBtnTreeRef',
      menuBtnTreeData: [],
      unsyncedMenuPermValueSet: [],

      checkedCountOfMenuBtnPermTree: 0,
      checkedCountOfMenuPerm: 0,
      checkedCountOfBtnPerm: 0,
      menuBtnTreeDefaultExpandedKeys: [],
      menuBtnTreePropsConfig: {
        label: 'name',
        children: 'children',
        disabled: function({ menuType, synced }) {
          return menuType === MenuType.DIR || synced === false
        },
      },
    }
  },
  computed: {
    hasPermAssignPermsToRole() {
      return hasPerm(this.pagePerms[`button_${this.pageId}_assign_perm`])
    },
    showActionColumn() {
      return this.hasPermAssignPermsToRole || this.hasPermUpdate || this.hasPermDelete
    },
  },
  methods: {
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
    },

    deCheckAllMenuBtnPermTreeNodes() {
      this.$refs[this.menuBtnTreeRef].setCheckedKeys([])
      this.checkedCountOfMenuBtnPermTree = 0
      this.checkedCountOfMenuPerm = 0
      this.checkedCountOfBtnPerm = 0
    },

    async onAssignPermBtnClick({ sys_role__id: id, sys_role__name: name }) {
      if (this.menuBtnTreeData.length === 0) {
        await this.loadMenuBtnPermTree()
      }

      const { menuPermValues, btnPermValues } = await roleApi.fetchAssignedPermsByRoleId(id)
      this.tempFormModel = Object.assign({}, {id, name})
      const assignedPermValues = [ ...menuPermValues, ...btnPermValues ]
      this.menuBtnTreeDefaultExpandedKeys = [...assignedPermValues]

      this.checkedCountOfMenuPerm = menuPermValues.length
      this.checkedCountOfBtnPerm = btnPermValues.length
      this.checkedCountOfMenuBtnPermTree = this.checkedCountOfMenuPerm + this.checkedCountOfBtnPerm

      if (this.menuBtnTreeDefaultExpandedKeys.length === 0) {
        this.menuBtnTreeDefaultExpandedKeys.push(...this.menuBtnTreeData.map(perm => perm.value))
        this.menuBtnTreeDefaultExpandedKeys.push(this.menuBtnTreeData[0].children[0].value)
      }

      this.showAssignPermDialog = true;
      this.showMenuBtnTree = false
      this.$nextTick(() => {
        this.showMenuBtnTree = true;
        this.$nextTick(() => {
          this.$refs[this.menuBtnTreeRef].setCheckedKeys(assignedPermValues)
        })
      })
    },

    onAssignPermDialogConfirm() {
      const { menu, button } = LowerPermType

      const roleId = this.tempFormModel.id;
      const checkedMenuBtnPermValues = this.$refs[this.menuBtnTreeRef].getCheckedKeys()
      const menuPermValues = checkedMenuBtnPermValues.filter(value => value.startsWith(menu))
      const btnPermValues = checkedMenuBtnPermValues.filter(value => value.startsWith(button))

      roleApi.saveAssignedPermsByRoleId(roleId, { menuPermValues, btnPermValues}).then(() => {
        this.showAssignPermDialog = false
        if (!isCurrentUserSuperAdmin() && isCurrentUserHasRole(roleId)) {
          this.refreshUserProfileAndRoutes().then(() => this.fetchTableData())
        }
        this.$notify.success('角色分配菜单和按钮权限成功')
      })
    },

    onMenuBtnTreeNodeCheck(node) {
      const treeRef = this.$refs[this.menuBtnTreeRef]
      const currentNode = treeRef.getNode(node)
      const parentNode = currentNode.parent
      const currentNodeMenuType = currentNode.data.menuType

      if (currentNode.checked) {
        if (parentNode && !parentNode.checked) {
          treeRef.setChecked(parentNode.data, true)
          const grandNode = parentNode.parent

          if (grandNode && !grandNode.checked) {
            treeRef.setChecked(grandNode.data, true)
          }
        }
      } else {
        if ([MenuType.PAGE, MenuType.LINK].includes(currentNodeMenuType)) {
          if (parentNode) {
            const checkedChildNodeNum = parentNode.childNodes.filter(node => node.checked).length
            if (checkedChildNodeNum === 0) {
              treeRef.setChecked(parentNode.data, false)
            }
          }

          if (currentNodeMenuType === MenuType.PAGE) {
            const childNodes = currentNode.childNodes
            if (childNodes && childNodes.length > 0) {
              childNodes.filter(childNode => childNode.checked)
                .forEach(childNode => treeRef.setChecked(childNode.data, false))
            }
          }
        }
      }

      const checkedNodes = treeRef.getCheckedNodes()
      const checkedMenuNodeNum = checkedNodes.filter(node => node.permType === PermType.MENU).length

      const checkedBtnNodeNum = checkedNodes.filter(node => node.permType === PermType.BUTTON).length
      this.checkedCountOfMenuPerm = checkedMenuNodeNum
      this.checkedCountOfBtnPerm = checkedBtnNodeNum
      this.checkedCountOfMenuBtnPermTree = checkedMenuNodeNum + checkedBtnNodeNum
    },
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
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

::v-deep .el-scrollbar__wrap {
  overflow-x: hidden!important;
}

</style>
