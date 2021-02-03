<template>
  <div class="app-container">
    <div class="filter-container">
      <div>
        <el-input placeholder="用户名" class="filter-item" size="small" v-model="listQuery.roleName"
                  :clearable="true"></el-input>
        <el-input placeholder="昵称" class="filter-item" size="small" v-model="listQuery.roleValue"
                  :clearable="true"></el-input>
        <el-button type="primary" class="filter-item" size="small" icon="el-icon-search">
          搜索
        </el-button>
      </div>
    </div>
    <div class="table-level-buttons">
      <el-button type="success" class="filter-item" icon="el-icon-plus"
                 v-if="hasPerm(button_sys_user_add)" size="small" @click="onAddBtnClick">
        添加
      </el-button>
      <el-button type="danger" class="filter-item" icon="el-icon-delete" size="small" @click="onBatchDeleteBtnClick($event)"
                 v-if="hasPerm(button_sys_user_batch_delete)" :disabled="multipleSelection.length === 0">
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
      <el-table-column prop="sys_user__username" label="用户名"></el-table-column>
      <el-table-column prop="sys_user__nickname" label="昵称"></el-table-column>
      <el-table-column prop="sys_user__realname" label="姓名"></el-table-column>
      <el-table-column prop="sys_user__email" label="Email"></el-table-column>
      <el-table-column prop="roles__name" label="角色"></el-table-column>
      <el-table-column label="用户状态" align="center">
        <template slot-scope="{ row: {sys_user__active: isActive} }">
          <el-tag effect="plain" v-if="isActive" type="success" size="small">已启用</el-tag>
          <el-tag effect="plain" v-else type="info" size="small">已停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="showActionColumn" label="操作" align="center" width="250"
                       class-name="small-padding fixed-width">
        <template slot-scope="{row: {sys_user__active: isActive}, row}">
          <el-tooltip :hide-after="600" :enterable="false" content="编辑" placement="top">
            <el-button @click="onEditBtnClick(row)" size="small" type="primary" icon="el-icon-edit"
                       v-if="hasPerm(button_sys_user_update)" circle plain></el-button>
          </el-tooltip>
          <el-tooltip :hide-after="600" :enterable="false" content="分配角色" placement="top">
            <el-button @click="onAssignRoleBtnClick(row)" size="small" type="warning"
                       v-if="hasPerm(button_sys_user_assign_role)" icon="el-icon-user-solid" circle plain></el-button>

          </el-tooltip>
          <el-tooltip :hide-after="600" :enterable="false" content="删除" placement="top">
            <el-button @click="onDeleteBtnClick(row, $event)" size="small" type="danger" icon="el-icon-delete"
                       v-if="hasPerm(button_sys_user_delete)" circle plain></el-button>
          </el-tooltip>
          <el-button v-if="hasPerm(button_sys_user_active_on_off) && isActive"
                     @click="onDeactivateBtnClick(row, $event)" size="mini" type="warning" plain>停用
          </el-button>
          <el-button v-if="hasPerm(button_sys_user_active_on_off) && !isActive" @click="onActivateBtnClick(row, $event)"
                     size="mini" type="success" plain>启用
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQueryParam.pageNumber"
                :page-sizes="pageSizes" :limit.sync="pageQueryParam.pageSize" @pagination="onPagination" />

    <el-dialog :title="editDialogStatus + '用户'" :visible.sync="showEditDialog"
               :width="resolveDialogWidth('50%')" :top="resolveDialogMarginTop('5vh')"
               @close="resetDataForm(dataFormRef)" :close-on-click-modal="false">
      <el-form :rules="rules" :ref="dataFormRef" :model="tempFormModel"
               :label-width="editDialogStatus === ADD ? '80px' : '70px'">
        <el-row>
          <el-col :span="12" :xs="24" style="padding-right: 15px;">
            <el-form-item label="用户名" prop="username">
              <el-input v-model.trim="tempFormModel.username"
                        placeholder="长度在 3 到 20 个字符"></el-input>
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model.trim="tempFormModel.nickname"
                        placeholder="长度在 2 到 8 个字符"></el-input>
            </el-form-item>
            <el-form-item label="姓名" prop="realname">
              <el-input v-model.trim="tempFormModel.realname"
                        placeholder="长度在 2 到 6 个字符"></el-input>
            </el-form-item>
            <el-form-item label="Email" prop="email">
              <el-input v-model.trim="tempFormModel.email"
                        placeholder="Email"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model.trim="tempFormModel.mobile"
                        placeholder="请输入手机号码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24" style="padding-left: 10px; padding-right: 5px">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="tempFormModel.gender">
                <el-radio v-for="item in enumLabelNameMap[ENUM_CLASS_NAME_GENDER]"
                          :key="item.label" :label="item.label">{{ item.name }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="头像" prop="pictureUrl">
              <el-input v-model.trim="tempFormModel.pictureUrl"
                        placeholder="头像地址"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password" v-if="editDialogStatus === ADD">
              <el-input v-model.trim="tempFormModel.password" show-password :clearable="true"
                        placeholder="长度为 6 到 20 位"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword" v-if="editDialogStatus === ADD">
              <el-input v-model.trim="tempFormModel.confirmPassword" show-password :clearable="true"
                        placeholder="长度为 6 到 20 位"></el-input>
            </el-form-item>
            <el-form-item label="是否启用" prop="active">
              <el-switch v-model="tempFormModel.active"
                         active-color="#13ce66" inactive-color="#909399">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="onEditDialogConfirm()">确定</el-button>
      </div>
    </el-dialog>

    <!-- 弹窗：用户分配角色 -->
    <el-dialog :width="resolveDialogWidth('30%')" :top="resolveDialogMarginTop('25vh')"
               class="assign-role-dialog" :visible.sync="showAssignRoleDialog" :close-on-click-modal="true">
      <template slot="title">
        <span class="el-dialog__title">用户分配角色（{{ tempAssignRoleObj.nickname || tempAssignRoleObj.username }}）</span>
      </template>
      <el-form>
        <el-scrollbar>
          <el-form-item>
            <el-checkbox-group v-model="checkedRoleIds">
              <el-checkbox class="role-checkbox" v-for="role in allRoles" :label="role.id" :key="role.id">
                {{ role.name }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-scrollbar>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="checkedRoleIds = []" :disabled="checkedRoleIds.length === 0"
                   style="float:left" type="danger" plain>清空全部
        </el-button>
        <el-button @click="showAssignRoleDialog = false">取消</el-button>
        <el-button @click="onAssignRoleDialogConfirm" type="primary">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import userApi from '@/api/_system/user'
import roleApi from '@/api/_system/role'
import Pagination from '@/components/Pagination'
import { DialogStatus, MenuType, PermType } from '@/utils/enums'
import baseMixin from '@/views/_module/_mixins/base-mixin'
import { SysPerms } from '@/utils/enums/perms/system'
import { hasPerm, isCurrentUser } from '@/utils/permission'
import rules from 'element-ui-validation'

export default {
  username: 'SystemUserManage',
  components: { Pagination },
  mixins: [baseMixin],
  data() {
    const initTempModel = {
      id: null,
      username: '',
      nickname: null,
      realname: null,
      password: '',
      confirmPassword: '',
      gender: 'UNSPECIFIED',
      email: null,
      mobile: null,
      pictureUrl: null,
      active: true,
    }
    const validatePassword = (rule, value, callback) => {
      if (this.tempFormModel.confirmPassword) {
        this.$refs[this.dataFormRef].validateField('confirmPassword')
      }
      callback()
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (this.tempFormModel.password && value !== this.tempFormModel.password) {
        callback(new Error('两次输入的密码不一致!'))
      } else {
        callback()
      }
    }

    return {
      ...PermType,
      ...MenuType,
      ...SysPerms,
      ...DialogStatus,

      showAssignRoleDialog: false,
      dataFormRef: 'dataFormRef',
      initTempModel,
      tempFormModel: Object.assign({}, initTempModel),
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
        username: rules.string('用户名', 20, 3, 'change'),
        nickname: rules.string('昵称', 8, 2, 'change'),
        realname: rules.string('姓名', 6, 2, 'change'),
        email: rules.email('电子邮箱'),
        mobile: rules.phone('手机号', false),
        password: [
          ...rules.string('密码', 20, 6, 'change'),
          { validator: validatePassword, trigger: 'change' },
        ],
        confirmPassword: [
          ...rules.string('密码', 20, 6, 'change'),
          { validator: validateConfirmPassword, trigger: 'change' },
        ],
      },

      tempAssignRoleObj: {
        id: null,
        username: null,
        nickname: null,
      },
      checkAllRoles: false,
      rolesPartiallyChecked: false,
      allRoles: [],
      checkedRoleIds: [],
    }
  },
  computed: {
    showActionColumn() {
      return hasPerm(this.button_sys_user_active_on_off) ||
        hasPerm(this.button_sys_user_update) ||
        hasPerm(this.button_sys_user_delete)
    },
    showSelectionColumn() {
      return hasPerm(this.button_sys_user_batch_delete)
    },
  },
  created() {
    this.fetchTableData()
  },
  methods: {
    async fetchTableData() {
      this.tableDataLoading = true
      const { list, totalElements } = await userApi.$pageFlatQuery(this.pageQueryParam)
      this.tableData = list
      this.total = totalElements
      this.tableDataLoading = false
    },

    async onAssignRoleBtnClick({ sys_user__id: id, sys_user__name, sys_user__nickname }) {
      this.allRoles = await roleApi.$getAll()

      this.tempAssignRoleObj.id = id
      this.tempAssignRoleObj.username = sys_user__name
      this.tempAssignRoleObj.nickname = sys_user__nickname

      const roles = await userApi.getRolesByUserId(id)
      this.checkedRoleIds = [...roles].map(role => role.id)
      this.showAssignRoleDialog = true
    },
    onAssignRoleDialogConfirm() {
      const userId = this.tempAssignRoleObj.id
      userApi.saveAssignedRolesByUserId(userId, this.checkedRoleIds).then(() => {
        this.showAssignRoleDialog = false
        if (isCurrentUser(userId)) {
          this.refreshUserProfileAndRoutes().then(() => this.fetchTableData())
        } else {
          this.fetchTableData()
        }
        this.$notify.success('用户分配角色成功')
      })
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
          userApi.$create(this.tempFormModel).then(() => {
            this.fetchTableData()
            this.showEditDialog = false
            this.$notify.success('用户添加成功')
          })
        } else if (this.editDialogStatus === DialogStatus.EDIT) {
          userApi.$update(this.tempFormModel).then(() => {
            this.fetchTableData()
            this.showEditDialog = false
            this.$notify.success('用户更新成功')
          })
        }
      })
    },

    resetDataForm() {
      this.$refs[this.dataFormRef].resetFields()
      Object.assign(this.tempFormModel, this.initTempModel)
    },

    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    onAddBtnClick() {
      this.editDialogStatus = DialogStatus.ADD
      Object.assign(this.tempFormModel, this.initTempModel)
      this.showEditDialog = true
    },

    async onEditBtnClick(row) {
      this.tempFormModel = await userApi.$findById(this.getIdValueOfFlatQueryObj(row))
      this.editDialogStatus = DialogStatus.EDIT
      this.showEditDialog = true
    },

    onDeleteBtnClick(row, event) {
      const { sys_user__username: username } = row
      this.$confirm(`您确定要删除用户【${username}】吗？`, '提示').then(() => {
        userApi.$deleteById(this.getIdValueOfFlatQueryObj(row)).then(() => {
          this.fetchTableData()
          this.$notify.success('用户删除成功')
        })
      }).finally(() => this.blurTargetButton(event))
    },

    onBatchDeleteBtnClick(event) {
      if (this.multipleSelection.length === 0) {
        return false
      }
      this.$confirm(`您确定要批量删除选中的所有用户吗？`, '提示').then(() => {
        const toBeDeletedIds = this.multipleSelection.map(row => this.getIdValueOfFlatQueryObj(row))
        userApi.$batchDeleteByIdSet(toBeDeletedIds).then(() => {
          this.fetchTableData()
          this.$notify.success('用户批量删除成功')
        })
      }).finally(() => this.blurTargetButton(event))
    },

    onActivateBtnClick(row, event) {
      this.blurTargetButton(event)

      const { sys_user__username: username, sys_user__id: userId } = row
      this.$confirm(`您确定要启用用户【${username}】吗？`, '提示').then(() => {
        userApi.activateUserById(userId).then(() => {
          this.fetchTableData()
          this.$notify.success('用户启用成功')
        })
      }).finally(() => this.blurTargetButton(event))
    },

    onDeactivateBtnClick(row, event) {
      this.blurTargetButton(event)

      const { sys_user__username: username, sys_user__id: userId } = row
      this.$confirm(`您确定要停用用户【${username}】吗？`, '提示').then(() => {
        userApi.deactivateUserById(userId).then(() => {
          this.fetchTableData()
          this.$notify.success('用户停用成功')
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
}

.role-checkbox {
  margin-left: 0;
  margin-right: 15px;
}


::v-deep .el-scrollbar__wrap {
  overflow-x: hidden !important;
}

::v-deep .assign-role-dialog .el-dialog__body {
  padding-right: 5px;
  .el-scrollbar {
    .el-scrollbar__wrap {
      max-height: 200px;
    }
  }
}

</style>
