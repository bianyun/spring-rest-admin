<template>
  <div class="app-container">
    <div class="filter-container">
      <div style="float: left">
        <el-input placeholder="角色名" class="filter-item" size="small" v-model="listQuery.roleName"
                  :clearable="true"></el-input>
        <el-input placeholder="角色值" class="filter-item" size="small" v-model="listQuery.roleValue"
                  :clearable="true"></el-input>
        <el-button type="primary" class="filter-item" size="small" icon="el-icon-search">
          搜索
        </el-button>
      </div>
    </div>
    <div class="table-level-buttons">
      <el-button type="success" class="filter-item" icon="el-icon-plus"
                 v-if="hasPerm(button_sys_role_add)" size="small" @click="onAddBtnClick">
        添加
      </el-button>
      <el-button type="danger" class="filter-item" icon="el-icon-delete" size="small" @click="onBatchDeleteBtnClick($event)"
                 v-if="hasPerm(button_sys_role_batch_delete)" :disabled="multipleSelection.length === 0">
        删除
      </el-button>
    </div>

    <el-table
      :ref="tableName"
      style="width: 100%"
      :data="tableData"
      v-loading="tableDataLoading"
      @selection-change="handleSelectionChange"
      border
      fit
      highlight-current-row>
      <el-table-column v-if="showSelectionColumn" type="selection" width="50" align="center"></el-table-column>
      <el-table-column prop="sys_role__name" label="角色名"></el-table-column>
      <el-table-column prop="sys_role__description" label="角色描述"></el-table-column>
      <el-table-column prop="sys_role__value" label="角色值"></el-table-column>
<!--      <el-table-column prop="sys_role__created_time" :formatter="tableColumnDateTimeFormatter"-->
<!--                       label="创建时间" align="center"></el-table-column>-->
      <el-table-column prop="sys_role__last_modified_time" :formatter="tableColumnDateTimeFormatter"
                       label="最后修改时间" align="center"></el-table-column>
      <el-table-column v-if="showActionColumn" label="操作" align="center" width="200"
                       class-value="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-tooltip :hide-after="600" :enterable="false" content="编辑" placement="top">
            <el-button @click="onEditBtnClick(row)" size="small" type="primary" icon="el-icon-edit"
                       v-if="hasPerm(button_sys_role_update)" circle plain></el-button>
          </el-tooltip>
          <el-tooltip :hide-after='600' :enterable='false' content='分配权限' placement='top'>
            <el-button @click='onAssignPermBtnClick(row)' size='small' type='warning'
                       v-if='hasPerm(button_sys_role_assign_perm)' icon='el-icon-view' circle plain></el-button>

          </el-tooltip>
          <el-tooltip :hide-after="600" :enterable="false" content="删除" placement="top">
            <el-button @click="onDeleteBtnClick(row, $event)" size="small" type="danger" icon="el-icon-delete"
                       v-if="hasPerm(button_sys_role_delete)" circle plain></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQueryParam.pageNumber"
                :page-sizes="pageSizes" :limit.sync="pageQueryParam.pageSize" @pagination="onPagination" />

    <el-dialog :title="editDialogStatus + '角色'" :visible.sync='showEditDialog' width='30%'
               @close='resetDataForm(dataFormRef)' :close-on-click-modal='false'>
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
    <el-dialog width="30%"
               :visible.sync="showAssignPermDialog"
               :close-on-click-modal="true">
      <template slot="title">
        <span>角色分配权限（{{ tempFormModel.name }}）</span>
        <span style="float: right; margin-right: 28px">
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
import roleApi from '@/api/_system/role'
import Pagination from '@/components/Pagination'
import { DialogStatus, LowerPermType, MenuType, PermType } from '@/utils/enums'
import { isEmpty } from 'lodash-es/lang'
import treeUtil from '@/views/_module/_system/tree'
import permApi from '@/api/_system/perm'
import baseMixin from '@/views/_module/_mixins/base-mixin'
import { SysPerms } from '@/utils/enums/perms/system'
import { hasPerm, isCurrentUserHasRole, isCurrentUserSuperAdmin } from '@/utils/permission'
import rules from 'element-ui-validation'

export default {
  value: 'SystemRoleManage',
  components: { Pagination },
  mixins: [baseMixin],
  data() {
    // const pageSizes = [10, 20, 30, 50, 100]
    const initTempFormModel = {
      id: null,
      name: '',
      value: '',
      description: '',
    }

    return {
      ...PermType,
      ...MenuType,
      ...SysPerms,

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

      dataFormRef: 'dataFormRef',
      tempFormModel: Object.assign({}, initTempFormModel),
      initTempFormModel,

      tableName: 'dataTable',
      multipleSelection: [],

      listQuery: {
        roleName: '',
        roleValue: '',
      },
      total: 0,
      tableDataLoading: false,
      tableData: [],
      showEditDialog: false,
      editDialogStatus: '',
      rules: {
        name: rules.string('角色名', 8, 2, 'change'),
        value: rules.string('角色值', 20, 3, 'change'),
        description: rules.string('角色值', 100, null, 'change', false),
      },
    }
  },
  computed: {
    showActionColumn() {
      return hasPerm(this.button_sys_role_assign_perm) ||
                hasPerm(this.button_sys_role_update) ||
                hasPerm(this.button_sys_role_delete)
    },
    showSelectionColumn() {
      return hasPerm(this.button_sys_role_batch_delete)
    },
  },
  created() {
    this.fetchTableData()
  },
  methods: {
    async fetchTableData() {
      this.tableDataLoading = true
      const { list, totalElements } = await roleApi.$pageFlatQuery(this.pageQueryParam)
      this.tableData = list
      this.total = totalElements
      this.tableDataLoading = false
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

    onPagination({ page, limit }) {
      this.pageQueryParam.pageNumber = page
      this.pageQueryParam.pageSize = limit
      this.fetchTableData()
    },
    onEditDialogConfirm() {
      this.$refs[this.dataFormRef].validate((valid) => {
        if (!valid) return false

        if (this.editDialogStatus === DialogStatus.ADD) {
          roleApi.$create(this.tempFormModel).then(() => {
            this.fetchTableData()
            this.showEditDialog = false
            this.$notify.success('角色添加成功')
          })
        } else if (this.editDialogStatus === DialogStatus.EDIT) {
          roleApi.$update(this.tempFormModel).then(() => {
            this.fetchTableData()
            this.showEditDialog = false
            this.$notify.success('角色更新成功')
          })
        }
      })
    },
    resetDataForm() {
      this.$refs[this.dataFormRef].resetFields()
      Object.assign(this.tempFormModel, this.initTempFormModel)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onAddBtnClick() {
      this.editDialogStatus = DialogStatus.ADD
      Object.assign(this.tempFormModel, this.initTempFormModel)
      this.showEditDialog = true
    },
    async onEditBtnClick(row) {
      this.tempFormModel = await roleApi.$findById(this.getIdValueOfFlatQueryObj(row))
      this.editDialogStatus = DialogStatus.EDIT
      this.showEditDialog = true
    },
    onDeleteBtnClick(row, event) {
      const { sys_role__name: roleName } = row
      this.$confirm(`您确定要删除角色【${roleName}】？`, '提示').then(() => {
        roleApi.$deleteById(this.getIdValueOfFlatQueryObj(row)).then(() => {
          this.fetchTableData()
          this.$notify.success('角色删除成功')
        })
      }).finally(() => this.blurTargetButton(event))
    },
    onBatchDeleteBtnClick(event) {
      if (isEmpty(this.multipleSelection)) {
        return false
      }
      this.$confirm(`您确定要批量删除选中的所有角色吗？`, '提示').then(() => {
        const toBeDeletedIds = this.multipleSelection.map(row => this.getIdValueOfFlatQueryObj(row))
        roleApi.$batchDeleteByIdSet(toBeDeletedIds).then(() => {
          this.fetchTableData()
          this.$notify.success('角色批量删除成功')
        })
      }).finally(() => this.blurTargetButton(event))
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
