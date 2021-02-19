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
        :batch-delete-btn-click-handler="onBatchDeleteBtnClick"
    ></table-level-buttons>
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
      <el-table-column label="用户名" min-width="100" align="center">
        <template slot-scope="{ row }">
          {{ row[mainTableFlatKey('username')] }}
          <el-tag class="demo-users" style="margin-left: 5px" type="danger" size="mini" effect="plain"
                  v-if="demoModeEnabled && demoPreservedUsers.includes(row[mainTableFlatKey('username')])">演示用户</el-tag>
        </template>
      </el-table-column>
      <el-table-column :prop="mainTableFlatKey('nickname')" label="昵称" min-width="130" align="center"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('realname')" label="姓名" min-width="100" align="center"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('email')" label="Email" min-width="160" align="center"></el-table-column>
      <el-table-column :prop="derivedTableFlatKey('roles', 'name')" label="角色" min-width="100" align="center"></el-table-column>
      <el-table-column label="用户状态"  min-width="100" align="center">
        <template slot-scope="{ row }">
          <el-tag effect="plain" v-if="isBooleanTrue(row[mainTableFlatKey('active')])" type="success" size="small">已启用</el-tag>
          <el-tag effect="plain" v-if="isBooleanFalse(row[mainTableFlatKey('active')])" type="info" size="small">已停用</el-tag>
        </template>
      </el-table-column>

      <table-operation-column :show-action-column="showActionColumn" :operation-items="tableOperationItems" :width="250"></table-operation-column>
    </el-table>

    <div v-if="demoModeEnabled" class="demo-mode-tips">
      <strong>提示</strong>：当前处于 <em>演示模式</em>，不能对内置演示用户进行 <em>修改、删除、启用停用、角色分配</em> 等操作
    </div>

    <pagination v-show="total>0" :total="total" :page.sync="pageQueryParam.pageNumber"
                :page-sizes="pageSizes" :limit.sync="pageQueryParam.pageSize" @pagination="onPagination" />

    <el-dialog :title="editDialogStatus + label" :visible.sync="showEditDialog"
               :width="resolveDynamicRatioWidth('768px')" :top="resolveDialogMarginTop('5vh')"
               @close="resetDataForm(dataFormRef)" :close-on-click-modal="false">
      <el-form :rules="rules" :ref="dataFormRef" :model="tempFormModel"
               :label-width="editDialogStatus === ADD ? '90px' : '80px'">
        <el-row>
          <el-col :span="12" :xs="24">
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
            <el-form-item label="密码" prop="password" v-if="editDialogStatus === ADD">
              <el-input v-model.trim="tempFormModel.password" show-password :clearable="true"
                        placeholder="长度为 6 到 20 位"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="确认密码" prop="confirmPassword" v-if="editDialogStatus === ADD">
              <el-input v-model.trim="tempFormModel.confirmPassword" show-password :clearable="true"
                        placeholder="长度为 6 到 20 位"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model.trim="tempFormModel.mobile"
                        placeholder="请输入手机号码"></el-input>
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="tempFormModel.gender">
                <el-radio v-for="item in genderOptions"
                          :key="item.label" :label="item.name">{{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="头像" prop="pictureUrl">
              <el-input v-model.trim="tempFormModel.pictureUrl"
                        placeholder="头像地址"></el-input>
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
    <el-dialog :width="resolveDynamicRatioWidth('460px')" :top="resolveDialogMarginTop('25vh')"
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
import { userApi } from '@/api/_system/user'
import { roleApi } from '@/api/_system/role'
import { DialogStatus } from '@/utils/enums'
import baseListPageMixin from '@/views/_module/_mixins/base-list-page-mixin'
import { SysPerms } from '@/utils/enums/perms/system'
import { hasPerm, isCurrentUser } from '@/utils/permission'
import rules from 'element-ui-validation'
import { mapGetters } from 'vuex'
import { isBooleanFalse, isBooleanTrue } from '@/utils/validator'

export default {
  name: 'SystemUserManage',
  mixins: [baseListPageMixin],
  data() {
    const initTempFormModel = {
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
      label: '用户',
      pageId: 'sys_user',
      confirmLabelColumn: 'username',
      api: userApi,
      pagePerms: SysPerms,
      initTempFormModel,

      ...DialogStatus,
      isBooleanTrue,
      isBooleanFalse,

      filterItems: [
        { type: 'input', field: 'username', label: '用户名' },
        { type: 'input', field: 'realname,nickname', label: '姓名 或 昵称' },
        { type: 'select', field: 'gender', label: '性别', optionsFunc: () => this.genderOptions, optionLabelProp: 'label', optionValueProp: 'id' },
      ],

      tableOperationItems: [
        { shape: 'circle', label: '编辑', buttonType: 'primary', icon: 'edit', visibleFunc: () => this.hasPermUpdate, clickHandler: this.onEditBtnClick },
        { shape: 'circle', label: '分配角色', buttonType: 'warning', icon: 'user-solid', visibleFunc: () => this.hasPermAssignRole, clickHandler: this.onAssignRoleBtnClick },
        { shape: 'circle', label: '删除', buttonType: 'danger', icon: 'delete', visibleFunc: () => this.hasPermDelete, clickHandler: this.onDeleteBtnClick },
        { shape: 'normal', label: '启用', buttonType: 'success', icon: 'circle-check', visibleFunc: row => this.hasPermActiveOnOff && !this.isFlatRowActive(row), clickHandler: this.onActivateBtnClick },
        { shape: 'normal', label: '停用', buttonType: 'warning', icon: 'circle-close', visibleFunc: row => this.hasPermActiveOnOff && this.isFlatRowActive(row), clickHandler: this.onDeactivateBtnClick },
      ],

      tempFormModel: Object.assign({}, initTempFormModel),
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

      showAssignRoleDialog: false,
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
    hasPermAssignRole() {
      return hasPerm(this.pagePerms[`button_${this.pageId}_assign_role`])
    },
    showActionColumn() {
      return this.hasPermAssignRole || this.hasPermActiveOnOff || this.hasPermUpdate || this.hasPermDelete
    },
    ...mapGetters([
      'demoModeEnabled',
      'demoPreservedUsers'
    ])
  },
  methods: {
    async onAssignRoleBtnClick({ sys_user__id: id, sys_user__username, sys_user__nickname }) {
      this.allRoles = await roleApi.$getAll()

      this.tempAssignRoleObj.id = id
      this.tempAssignRoleObj.username = sys_user__username
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
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/styles/variables.scss";

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

.demo-users {
  @media screen and (max-width: 1200px) {
    display: block;
    margin-left: 0!important;
  }
}

.demo-mode-tips {
  @media screen and (min-width: 1200px) {
    text-align: right;
  }
  @media screen and (max-width: 1200px) {
    text-align: left;
  }
  margin-top: 10px;
  font-size: 1.3rem;
  line-height: 1.8rem;
  strong {
    color: #409EFF;
  }
  em {
    color: #f04444;
    font-style: normal;
  }
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
