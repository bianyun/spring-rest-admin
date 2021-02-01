<template>
  <div class="app-container">
    <el-row :gutter="20">

      <!--菜单按钮权限树-->
      <el-col :span="14">
        <el-card class="box-card">
          <div slot="header">
            <div class="title-box">
              <span class="header">
                <el-tag type="success" class="header">菜单</el-tag>&nbsp;
                <el-tag type="warning" class="header">按钮</el-tag> 权限元数据
                <el-tag class="sync-status" v-if="unsyncedMenuPermValueSet.size === 0"  type="success" size="mini">已同步</el-tag>
                <el-tag class="sync-status" v-else type="danger" size="mini">待同步</el-tag>
              </span>
              <el-tooltip content="同步菜单权限元数据" placement="top">
                <el-button v-if="hasPerm(button_sys_perm_sync_menu)" class="sync-button" :disabled="unsyncedMenuPermValueSet.size === 0" type="text" @click="onMenuPermsSyncBtnClick($event)" icon="el-icon-refresh"></el-button>
              </el-tooltip>
            </div>
            <p class="tips"><span class="emphasize">提示：</span>菜单权限由前端页面路由定义，不提供任何编辑功能，只能执行将权限数据同步到数据库的操作。
              已同步的菜单可以关联接口权限，以及在该菜单下添加、修改和删除按钮权限。</p>
          </div>
          <el-input class="filter-input" :clearable="true" :placeholder="menuBtnTreeFilterPlaceholder"
                    v-model="menuBtnTreeFilterInput"></el-input>
          <el-scrollbar-fix :vertical="true">
            <el-tree
              :ref="menuButtonTreeRef"
              :filter-node-method="filterNode"
              :data="menuBtnPermTreeData"
              :props="menuBtnTreePropsConfig"
              node-key="value"
              :default-expanded-keys="menuBtnTreeDefaultExpandedKeys"
              :expand-on-click-node="true"
            >
              <span class="custom-tree-node" slot-scope="{ data: { name, value, permType, menuType }, data }">
                <span>
                  <el-tag class="node-type" type="info" size="mini" v-if="permType === MENU && menuType === DIR">目录</el-tag>
                  <el-tag class="node-type" type="success" size="mini" v-else-if="permType === MENU && menuType === PAGE">菜单</el-tag>
                  <el-tag class="node-type" type="primary" size="mini" v-else-if="permType === MENU && menuType === LINK">外链</el-tag>
                  <el-tag class="node-type" type="warning" size="mini" v-else-if="permType === BUTTON">按钮</el-tag>
                  <el-tag class="node-link-num" type="primary" size="mini" v-if="(permType === MENU && menuType === PAGE)
                                                || permType === BUTTON"><i class="el-icon-link" /> {{calcLinkedApiPermNum(data)}}</el-tag>

                  <el-tag class="node-link-num" type="warning" size="mini" v-if="(permType === MENU && menuType === PAGE)">
                    <i class="el-icon-mouse" /> {{calcChildrenButtonNum(data)}}</el-tag>
                  <span class="node-label">{{ name }}</span>


                  <el-tag class="node-value perm-value" size="mini" type="info">{{ value }}</el-tag>
                  <el-tag class="sync-status" type="danger" size="mini"
                          v-if="permType === MENU && unsyncedMenuPermValueSet.has(value)">未同步</el-tag>
                </span>
                <span v-if="!unsyncedMenuPermValueSet.has(value) && permType === MENU && menuType === PAGE">
                  <el-tooltip :hide-after="600" :enterable="false" content="添加按钮权限" placement="top">
                  <el-button v-if="hasPerm(button_sys_perm_add_button)" class="add-btn" type="text" size="mini" icon="el-icon-plus"
                             @click.stop="onButtonPermAddBtnClick(data, $event)"></el-button>
                  </el-tooltip>
                  <el-tooltip :hide-after="600" :enterable="false" content="关联接口权限" placement="top">
                    <el-button v-if="hasPerm(button_sys_perm_menu_link_api)" class="menu-link-api" type="text" size="mini" icon="el-icon-link"
                               @click.stop="onMenuPermLinkApiBtnClick(data, $event)"></el-button>
                  </el-tooltip>
                </span>
                <span v-if="data.permType === BUTTON">
                  <el-button v-if="hasPerm(button_sys_perm_update_button)" class="update-btn" type="text" size="mini" icon="el-icon-edit"
                             @click.stop="onButtonPermEditBtnClick(data, $event)"></el-button>
                  <el-button v-if="hasPerm(button_sys_perm_delete_button)" class="delete-btn" type="text" size="mini" icon="el-icon-delete"
                             @click.stop="onBtnPermDeleteBtnClick(data)"></el-button>
                </span>
              </span>
            </el-tree>
          </el-scrollbar-fix>
        </el-card>
      </el-col>

      <!--接口权限树-->
      <el-col :span="10">
        <el-card class="box-card">
          <div slot="header">
            <div class="title-box">
              <span class="header">
                <el-tag class="header">接口</el-tag>&nbsp;权限元数据
                <el-tag class="sync-status" v-if="unsyncedApiPermValueSet.size > 0" type="danger" size="mini">待同步</el-tag>
                <el-tag class="sync-status" v-else type="success" size="mini">已同步</el-tag>
              </span>
              <el-tooltip content="同步接口权限元数据" placement="top">
                <el-button v-if="hasPerm(button_sys_perm_sync_api)" class="sync-button" type="text"
                           :disabled="unsyncedApiPermValueSet.size === 0"
                           @click="onApiPermsSyncBtnClick($event)" icon="el-icon-refresh"></el-button>
              </el-tooltip>
            </div>
            <p class="tips"><span class="emphasize">提示：</span>接口菜单权限由后台定义，
              并在应用启动时自动生成，不提供任何编辑功能，只能执行将权限数据同步到数据库的操作。</p>
          </div>
          <el-input class="filter-input" :clearable="true" :placeholder="filterPlaceholderForApiPermTree"
                    v-model="apiPermTreeFilterInput"></el-input>
          <el-scrollbar-fix :vertical="true">
            <el-tree
              :ref="apiPermTreeRef"
              v-if="showApiPermTree"
              :filter-node-method="filterNode"
              :data="apiPermTreeData"
              :props="apiPermTreePropsConfig"
              node-key="value"
              :default-expanded-keys="apiPermTreeDefaultExpandedKeys"
              :expand-on-click-node="true"
            >
              <span class="custom-tree-node" slot-scope="{ data: { name, value, permLevel } }">
                <span>
                  <el-tag class="node-type" v-if="permLevel === GROUP" size="mini" type="info">目录</el-tag>
                  <el-tag class="node-type" v-else-if="permLevel === CLASS" type="warning" size="mini">分组</el-tag>
                  <el-tag class="node-type" v-else type="primary" size="mini">接口</el-tag>

                  <span class="node-label">{{ name }}</span>
                  <el-tag class="node-value perm-value" size="mini" type="info">{{ value }}</el-tag>
                  <el-tag v-if="unsyncedApiPermValueSet.has(value)" class="sync-status" type="danger" size="mini">未同步</el-tag>
                </span>
              </span>
            </el-tree>
          </el-scrollbar-fix>
        </el-card>
      </el-col>
    </el-row>

    <!--弹窗：新增或编辑按钮权限-->
    <el-dialog :width="buttonDialogWidthRatioMap[showApiPermValuesInBtnDialog]" :title="btnPermDialogTitle"
               :visible.sync="showBtnPermDialog"
               :close-on-click-modal="false" class="btn-perm-dialog">
      <el-form :rules="btnFormRules" :ref="btnFormRef" :model="btnFormModel" label-width="80px">
        <el-form-item label="权限名" prop="name">
          <el-input :clearable="true" v-model="btnFormModel.name" placeholder="按钮权限的中文描述，例如：添加用户"></el-input>
        </el-form-item>
        <el-form-item label="权限值" prop="value">
          <el-input :clearable="true" v-model="btnFormModel.value" placeholder="只需填除前缀以外的部分">
            <template slot="prepend">{{resolvedBtnPermValuePrefix}}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="父级菜单" class="input-parent-menu">
          <el-input :value="btnFormModel.parentMenuName + ' ' + btnFormModel.parentMenuValue" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item prop="apiPermValues" style="margin-bottom: 0">
          <template slot="label">
            <span class="required-label">接口权限</span><br>
            <el-tag size="mini"><span style="font-size: x-small; font-weight: normal">
              已选 {{checkedCountOfBtnLinkApiTree}} 项</span></el-tag>
          </template>
          <el-scrollbar-fix :vertical="true">
            <el-tree style="margin-left: -8px"
              :ref="btnLinkApiTreeRef"
              v-if="showBtnLinkApiTree"
              :data="apiPermTreeData"
              :props="apiPermTreePropsConfig"
              node-key="value"
              check-on-click-node
              accordion
              show-checkbox
              @check="onBtnLinkApiTreeNodeCheck"
              :default-expanded-keys="btnLinkApiTreeDefaultExpandedKeys"
              :expand-on-click-node="true"
            >
              <span class="custom-tree-node" slot-scope="{ data: { name, value, permLevel } }">
                <span>
                  <el-tag class="node-type" v-if="permLevel === GROUP" size="mini" type="info">目录</el-tag>
                  <el-tag class="node-type" v-else-if="permLevel === CLASS" type="warning" size="mini">分组</el-tag>
                  <el-tag class="node-type" v-else type="primary" size="mini">接口</el-tag>
                  <span class="node-label">{{ name }}</span>
                  <el-tag v-if="showApiPermValuesInBtnDialog" class="node-value perm-value" size="mini" type="info">{{ value }}</el-tag>
                </span>
              </span>
            </el-tree>
          </el-scrollbar-fix>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain style="float: left"
                   @click="onShowApiPermValueBtnClick">{{textOfShowApiPermValueBtn}}</el-button>
        <el-button @click="showBtnPermDialog = false">取消</el-button>
        <el-button type="primary" @click="onButtonDialogConfirm" >确定</el-button>
      </div>
    </el-dialog>

    <!--弹窗：菜单关联接口权限-->
    <el-dialog width="28%"
               :visible.sync="showMenuLinkApiDialog"
               :close-on-click-modal="true" class="menu-link-api-dialog">
      <template slot="title">
        <span>{{menuLinkApiDialogTitle}}
          <el-tag size="mini">
            <span style="font-size: x-small; font-weight: normal">已选 {{checkedCountOfMenuLinkApiTree}} 项</span>
          </el-tag></span>
      </template>
      <el-scrollbar-fix :vertical="true">
        <el-tree
          v-if="showMenuLinkApiTree"
          :ref="menuLinkApiTreeRef"
          :data="apiPermTreeData"
          :props="apiPermTreePropsConfig"
          node-key="value"
          check-on-click-node
          @check="onMenuLinkApiTreeNodeCheck"
          accordion
          show-checkbox
          :default-expanded-keys="menuLinkApiTreeDefaultExpandedKeys"
          :expand-on-click-node="true"
        >
          <span class="custom-tree-node" slot-scope="{ data: { permLevel, name } }">
            <span>
              <el-tag class="node-type" v-if="permLevel === GROUP" size="mini" type="info">目录</el-tag>
              <el-tag class="node-type" v-else-if="permLevel === CLASS" type="warning" size="mini">分组</el-tag>
              <el-tag class="node-type" v-else type="primary" size="mini">接口</el-tag>
              <span class="node-label">{{ name }}</span>
            </span>
          </span>
        </el-tree>
      </el-scrollbar-fix>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deCheckAllMenuLinkApiTreeNodes" :disabled="checkedCountOfMenuLinkApiTree === 0" style="float:left" type="danger" plain>清空全部</el-button>
        <el-button @click="showMenuLinkApiDialog = false">取消</el-button>
        <el-button @click="onMenuLinkApiDialogConfirm" type="primary">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import treeUtil from '../tree'
import { resetAllPropsToNull } from '@/utils'
import permApi from '@/api/_system/perm'
import lodash from 'lodash-es'
import deepdash from 'deepdash-es'

import { DialogStatus, LowerPermType, MenuType, PermLevel, PermType } from '@/utils/enums'
import { replace } from 'lodash-es/string'
import { debounce } from 'lodash-es/function'
import { SysPerms } from '@/utils/enums/perms/system'
import baseMixin from '@/views/_module/_mixins/base-mixin'
import ElScrollbarFix from '@/components/ElScrollBarFix'

const _ = deepdash(lodash);

export default {
  name: 'SystemPermManage',
  mixins: [baseMixin],
  components: { ElScrollbarFix },
  data() {
    const validateApiPermValueSet = (rule, value, callback) => {
      if (this.checkedCountOfBtnLinkApiTree === 0) {
        callback(new Error('请至少选择一项'))
      } else {
        callback()
      }
    };

    // noinspection JSUnusedGlobalSymbols
    return {
      ...MenuType,
      ...PermLevel,
      ...PermType,
      ...SysPerms,

      apiPermTreeRef: 'apiPermTreeRef',
      menuButtonTreeRef: 'menuButtonTreeRef',
      btnFormRef: 'btnFormRef',
      menuLinkApiTreeRef: 'menuLinkApiTreeRef',
      btnLinkApiTreeRef: 'btnLinkApiTreeRef',

      showBtnPermDialog: false,
      showApiPermTree: false,
      showMenuLinkApiDialog: false,
      showMenuLinkApiTree: false,
      showBtnLinkApiTree: false,

      needSyncApiPermsToDb: false,
      apiPermTreeData: [],
      menuBtnPermTreeData: [],
      apiPermTreePropsConfig: {
        label: 'name',
        children: 'children',
        disabled: function({ permLevel }) {
          return permLevel !== PermLevel.METHOD
        },
      },
      menuBtnTreePropsConfig: {
        label: 'name',
        children: 'children',
      },

      showApiPermValuesInBtnDialog: true,
      buttonDialogWidthRatioMap: {
        true: '38%',
        false: '29%'
      },

      resolvedBtnPermValuePrefix: '',

      menuBtnTreeFilterPlaceholder: '输入 菜单 或 按钮 的 权限名称、权限值 进行过滤',
      filterPlaceholderForApiPermTree: '输入 接口 的权限名称、权限值 进行过滤',
      menuBtnTreeFilterInput: '',
      apiPermTreeFilterInput: '',

      unsyncedApiPermValueSet: new Set(),
      unsyncedMenuPermValueSet: new Set(),

      menuToBtnPermsMap: {},   // 菜单权限值 到 属于该菜单的按钮权限列表的MAP
      menuToApiPermValuesMap: {}, // 菜单权限值 到 该菜单关联的接口按钮权限值列表的MAP

      menuBtnTreeDefaultExpandedKeys: [],
      apiPermTreeDefaultExpandedKeys: [],
      menuLinkApiTreeDefaultExpandedKeys: [],
      btnLinkApiTreeDefaultExpandedKeys: [],

      checkedCountOfMenuLinkApiTree: 0,
      checkedCountOfBtnLinkApiTree: 0,

      btnPermDialogStatus: '',
      btnFormModel: {
        name: null,
        permType: null,
        value: null,
        showOrder: null,
        parentMenuId: null,
        parentMenuName: null,
        parentMenuValue: null,
      },
      menuLinkApiTmpObj: {
        type: null,
        name: null,
        value: null
      },
      btnFormRules: {
        name: [{ required: true, message: '请输入权限名', trigger: 'blur' }],
        value: [{ required: true, message: '请输入权限值', trigger: 'blur' }],
        apiPermValues: [{ validator: validateApiPermValueSet, trigger: 'none' }],
      },
    }
  },

  watch: {
    menuBtnTreeFilterInput: debounce(function(val) {
      this.$refs[this.menuButtonTreeRef].filter(val)
    }, 600),
    apiPermTreeFilterInput: debounce(function(val) {
      this.$refs[this.apiPermTreeRef].filter(val)
    }, 600),
  },

  computed: {
    menuLinkApiDialogTitle() {
      return "关联接口权限" + "（菜单：" + this.menuLinkApiTmpObj.name + "）"
    },
    textOfShowApiPermValueBtn() {
      return (this.showApiPermValuesInBtnDialog ? '不' : '') + "显示接口权限值"
    },
    btnPermDialogTitle() {
      return `${this.btnPermDialogStatus}按钮权限`
    },
  },

  created() {
    this.loadApiPermTreeData().then(() => this.loadMenuBtnPermTree(true))
  },

  methods: {
    async loadApiPermTreeData() {
      const { apiPermTreeData, unsyncedApiPermValues } = await permApi.fetchApiPermMetaData()
      this.apiPermTreeData = apiPermTreeData

      this.unsyncedApiPermValueSet = new Set(unsyncedApiPermValues)
      this.needSyncApiPermsToDb = unsyncedApiPermValues.length > 0

      this.apiPermTreeDefaultExpandedKeys = []
      this.apiPermTreeDefaultExpandedKeys.push(...unsyncedApiPermValues)
      if (this.apiPermTreeDefaultExpandedKeys.length < 5) {
        this.apiPermTreeDefaultExpandedKeys.push(apiPermTreeData[0].children[0].value)
        if (apiPermTreeData.length > 1) {
          this.apiPermTreeDefaultExpandedKeys.push(apiPermTreeData[1].value)
        }
      }
      this.$nextTick(() => this.showApiPermTree = true)
    },

    async loadMenuBtnPermTree(needInitExpandedKeys) {
      const menuPermTree = treeUtil.buildMenuPermTree()
      const menuPermMetaData = await permApi.fetchMenuPermMetaData(menuPermTree)

      this.unsyncedMenuPermValueSet = new Set(menuPermMetaData['unsyncedMenuPermValues'])
      this.menuToBtnPermsMap = menuPermMetaData['menuPermValueToButtonPermsMap']
      this.menuToApiPermValuesMap = menuPermMetaData['menuPermValueToApiPermValuesMap']
      this.menuBtnPermTreeData = treeUtil.buildMenuBtnPermTree(this.menuToBtnPermsMap, menuPermTree)

      if (needInitExpandedKeys) {
        this.menuBtnTreeDefaultExpandedKeys = [...this.menuBtnPermTreeData.map(perm => perm.value)]
        this.menuBtnTreeDefaultExpandedKeys.push(this.menuBtnPermTreeData[0].children[0].value)
      }
    },

    filterNode(value, data) {
      return !value || data.name.indexOf(value) !== -1 || data.value.indexOf(value) !== -1
    },

    onShowApiPermValueBtnClick() {
      this.showApiPermValuesInBtnDialog = !this.showApiPermValuesInBtnDialog
    },

    calcLinkedApiPermNum({ permType, value, parentMenuValue }) {
      if (permType === PermType.MENU) {
        if (this.menuToApiPermValuesMap[value]) {
          return this.menuToApiPermValuesMap[value].length
        }
      } else if (permType === PermType.BUTTON) {
        if (this.menuToBtnPermsMap[parentMenuValue]) {
          const { apiPermValues } = this.menuToBtnPermsMap[parentMenuValue].find(btn => btn.value === value)
          return apiPermValues.length
        }
      }
      return 0
    },

    calcChildrenButtonNum({ permType, value }) {
      if (permType === PermType.MENU) {
        if (this.menuToBtnPermsMap[value]) {
          return this.menuToBtnPermsMap[value].length
        }
      }
      return 0
    },

    /**
     * 添加按钮权限
     */
    onButtonPermAddBtnClick(data, event) {
      if (this.needSyncApiPermsToDb) {
        event.preventDefault()
        this.$message.warning("请先同步接口权限数据，然后再添加按钮权限")
        return false
      }

      this.btnPermDialogStatus = DialogStatus.ADD
      resetAllPropsToNull(this.btnFormModel)
      this.btnFormModel.parentMenuId = data.id
      this.btnFormModel.parentMenuValue = data.value
      this.btnFormModel.parentMenuName = data.name
      this.btnFormModel.showOrder = data.children.length + 1
      this.resolvedBtnPermValuePrefix = replace(this.btnFormModel.parentMenuValue,
                  LowerPermType.menu, LowerPermType.button) + ':'

      this.checkedCountOfBtnLinkApiTree = 0
      this.btnLinkApiTreeDefaultExpandedKeys = this.resolveApiTreeDefaultExpandedKeys(data.value)

      this.showApiPermValuesInBtnDialog = true
      this.showBtnPermDialog = true
      this.showBtnLinkApiTree = false

      this.$nextTick(() => {
        this.$refs[this.btnFormRef].clearValidate()
        this.showBtnLinkApiTree = true
        this.$nextTick(() => {
          this.$refs[this.btnLinkApiTreeRef].setCheckedNodes([])
        })
      })
    },

    /**
     * 更新按钮权限
     */
    onButtonPermEditBtnClick(data, event) {
      if (this.needSyncApiPermsToDb) {
        event.preventDefault()
        this.$message.warning("请先同步接口权限数据，然后再更新按钮权限")
        return false
      }

      this.btnPermDialogStatus = DialogStatus.EDIT
      this.btnFormModel = Object.assign({}, data)
      const { apiPermValues } = data

      this.resolvedBtnPermValuePrefix = replace(this.btnFormModel.parentMenuValue,
          LowerPermType.menu, LowerPermType.button) + ':'
      this.btnFormModel.value = replace(this.btnFormModel.value, this.resolvedBtnPermValuePrefix, '')

      this.btnLinkApiTreeDefaultExpandedKeys = this.resolveApiTreeDefaultExpandedKeys(this.btnFormModel.parentMenuValue)
      this.btnLinkApiTreeDefaultExpandedKeys.push(...apiPermValues)

      this.showApiPermValuesInBtnDialog = false
      this.showBtnPermDialog = true
      this.showBtnLinkApiTree = false

      this.$nextTick(() => {
        this.$refs[this.btnFormRef].clearValidate()
        this.showBtnLinkApiTree = true
        this.$nextTick(() => {
          this.$refs[this.btnLinkApiTreeRef].setCheckedKeys(apiPermValues)
          this.checkedCountOfBtnLinkApiTree = apiPermValues.length
        })
      })
    },

    /**
     * 菜单关联接口权限
     */
    onMenuPermLinkApiBtnClick(data, event) {
      if (this.needSyncApiPermsToDb) {
        event.preventDefault()
        this.$message.warning("请先同步接口权限数据，然后再关联接口权限")
        return false
      }

      resetAllPropsToNull(this.menuLinkApiTmpObj)
      this.menuLinkApiTmpObj.name = data.name
      this.menuLinkApiTmpObj.value = data.value

      this.menuLinkApiTreeDefaultExpandedKeys = []
      const apiPermValues = this.menuToApiPermValuesMap[data.value]
      if (apiPermValues) {
        this.menuLinkApiTreeDefaultExpandedKeys.push(...apiPermValues)
      }
      if (this.menuLinkApiTreeDefaultExpandedKeys.length === 0) {
        this.menuLinkApiTreeDefaultExpandedKeys = this.resolveApiTreeDefaultExpandedKeys(data.value)
      }

      this.showMenuLinkApiDialog = true
      this.showMenuLinkApiTree = false

      this.$nextTick(() => {
        this.showMenuLinkApiTree = true
        this.checkedCountOfMenuLinkApiTree = apiPermValues.length
        this.$nextTick(() => {
          this.$refs[this.menuLinkApiTreeRef].setCheckedKeys(apiPermValues)
        })
      })
    },

    resolveApiTreeDefaultExpandedKeys(menuPermValue) {
      const permValueSearchKey = replace(menuPermValue, LowerPermType.menu, LowerPermType.api)
      const searchResult = _.findValueDeep(this.apiPermTreeData, (child) => {
        if (_.startsWith(child.value, permValueSearchKey)) return true;
      }, {childrenPath: 'children'})

      if (searchResult) {
        return [searchResult.value]
      } else {
        return Object.assign([], this.apiPermTreeDefaultExpandedKeys)
      }
    },

    onButtonDialogConfirm() {
      if (this.btnPermDialogStatus === DialogStatus.ADD) {
        this.addButtonPerm()
      } else if (this.btnPermDialogStatus === DialogStatus.EDIT) {
        this.updateButtonPerm()
      }
    },

    onMenuLinkApiDialogConfirm() {
      const menuPermValue = this.menuLinkApiTmpObj.value;
      const apiPermValues = this.$refs[this.menuLinkApiTreeRef].getCheckedKeys(true)

      permApi.linkApiPermValuesToMenu(menuPermValue, apiPermValues).then(() => {
        this.showMenuLinkApiDialog = false
        this.refreshMenuBtnTreeExpandedKeys(menuPermValue)
        this.loadMenuBtnPermTree()
        this.$notify.success('菜单关联接口权限成功')
      })
    },
    deCheckAllMenuLinkApiTreeNodes() {
      this.$refs[this.menuLinkApiTreeRef].setCheckedKeys([])
      this.checkedCountOfMenuLinkApiTree = 0
    },

    addButtonPerm() {
      this.$refs[this.btnFormRef].validate(valid => {
        if (!valid) return
        const data = Object.assign({}, this.btnFormModel)
        data.value = this.resolvedBtnPermValuePrefix + data.value
        data.apiPermValues = this.$refs[this.btnLinkApiTreeRef].getCheckedKeys()

        permApi.addButtonPerm(data).then(() => {
          this.showBtnPermDialog = false
          this.refreshMenuBtnTreeExpandedKeys(data.value)
          this.loadMenuBtnPermTree()
          this.$notify.success('按钮权限添加成功')
        })
      })
    },

    updateButtonPerm() {
      this.$refs[this.btnFormRef].validate(valid => {
        if (!valid) return
        const data = Object.assign({}, this.btnFormModel)
        data.value = this.resolvedBtnPermValuePrefix + data.value
        data.apiPermValues = this.$refs[this.btnLinkApiTreeRef].getCheckedKeys()

        permApi.updateButtonPerm(data).then(() => {
          this.showBtnPermDialog = false
          this.refreshMenuBtnTreeExpandedKeys(this.btnFormModel.parentMenuValue)
          this.loadMenuBtnPermTree()
          this.$notify.success('按钮权限更新成功')
        })
      })
    },

    refreshMenuBtnTreeExpandedKeys(currentHandlingMenuValue) {
      const menuBtnTree = this.$refs[this.menuButtonTreeRef]
      const currentKey = menuBtnTree.getCurrentKey()
      const currentNode = menuBtnTree.getCurrentNode()
      const expandedKeys = [currentHandlingMenuValue]

      if (currentKey && currentKey !== currentHandlingMenuValue) {
        if (currentNode.parentMenuValue) {
          expandedKeys.push(currentNode.parentMenuValue)
        } else if (currentNode.menuType === MenuType.DIR) {
          expandedKeys.push(currentKey)
        }
      }

      this.menuBtnTreeDefaultExpandedKeys = [...expandedKeys]
    },

    onMenuLinkApiTreeNodeCheck(data, currentStatus) {
      this.checkedCountOfMenuLinkApiTree = currentStatus.checkedKeys.length
    },

    onBtnLinkApiTreeNodeCheck(data, currentStatus) {
      this.checkedCountOfBtnLinkApiTree = currentStatus.checkedKeys.length
      this.$refs[this.btnFormRef].validateField('apiPermValues')
    },

    /**
     * 删除按钮权限
     */
    onBtnPermDeleteBtnClick(data) {
      console.log(JSON.stringify(data))
      this.$confirm(`您确定要永久删除该按钮权限【${data.name}】吗？`, '提示')
        .then(() => {
          permApi.deleteButtonPermById(data.id).then(() => {
            this.refreshMenuBtnTreeExpandedKeys(data.parentMenuValue)
            this.loadMenuBtnPermTree()
            this.$notify.success('删除按钮权限成功')
          })
        })
        .catch(() => {})
    },

    /**
     * 同步菜单权限数据
     */
    onMenuPermsSyncBtnClick(event) {
      if (this.needSyncApiPermsToDb) {
        event.preventDefault()
        this.$message.warning("请先同步接口权限数据，然后再同步菜单权限数据")
        return false
      }
      permApi.syncMenuPerms(this.menuBtnPermTreeData).then(() => {
        this.loadMenuBtnPermTree()
        this.$notify.success('菜单权限数据同步成功')
      })
    },

    /**
     * 同步接口权限数据
     */
    onApiPermsSyncBtnClick() {
      permApi.syncApiPerms(this.apiPermTreeData).then(() => {
        this.loadApiPermTreeData()
        this.$notify.success('接口权限数据同步成功')
      })
    },
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/styles/variables.scss";

.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}

.clearfix:after {
  clear: both;
}

.box-card {
  width: 100%;
}

.title-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0;
  padding-bottom: 0;
  span.header, span.header > span.header.el-tag {
    font-size: 22px;
  }
  .sync-button {
    font-size: 25px;
  }
}

.tips {
  margin-top: 5px;
  margin-bottom: 0;
  line-height: 1.5;
  font-size: 14px;
  color: #909399;

  .emphasize {
    color: #F56C6C;
  }
}


$filterInputMarginBottom: 15px;
$filterInputHeight: 36px;
.filter-input {
  height: $filterInputHeight;
  margin-bottom: $filterInputMarginBottom;
  padding-left: 5px;
  padding-right: 5px;
}

$cardHeaderHeight: 128px;
$cardBodyPaddingTop: 15px;
$cardBodyPaddingBottom: 10px;
$heightExceptScrollBarInContainer: 4px + $navBarHeight + 2*$appContainerPadding + $cardHeaderHeight +
                  $cardBodyPaddingTop + $cardBodyPaddingBottom + $filterInputHeight + $filterInputMarginBottom;


::v-deep {
  .el-card__header {
    height: $cardHeaderHeight;
    padding-bottom: 15px;
  }

  .el-card__body {
    padding: $cardBodyPaddingTop 10px $cardBodyPaddingBottom;
  }

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

  .node-link-num {
    margin-left: 5px;
  }

  .node-label {
    margin-left: 10px;
  }

  .sync-status {
    margin-left: 8px;
  }

  .node-value {
    margin-left: 10px;
    font-size: 12px;
  }

  .add-btn {
    color: #13ce66;
    margin-right: 15px;
  }

  .menu-link-api {
    color: #ffba00;
    margin-right: 75px;
  }

  .update-btn {
    margin-left: 20px;
  }

  .btn-link-api {
    color: #ffba00;
    margin-left: 20px;
  }

  .delete-btn {
    margin-left: 20px;
    color: #ff4949;
  }
}



.required-label::before {
  content: "*";
  color: #f04444;
  margin-right: 4px;
}

.menu-link-api-dialog {
  ::v-deep .el-dialog__body {
    padding: 10px;
  }

  .el-scrollbar {
    height: 340px;
    ::v-deep .el-scrollbar__wrap {
      height: 340px;
      margin-bottom: 10px;
    }
  }
}

.btn-perm-dialog {
  .input-parent-menu {
    margin-bottom: 15px;
  }

  ::v-deep .el-dialog__body {
    padding-left: 15px;
  }

  .el-scrollbar {
    height: 210px;
    ::v-deep .el-scrollbar__wrap {
      height: 210px;
    }
  }
}

::v-deep .el-scrollbar .el-scrollbar__wrap {
  overflow-x: hidden!important;
}

::v-deep .el-input-group__prepend {
  padding-left: 15px;
  padding-right: 6px;
}

::v-deep .el-input.el-input-group .el-input__inner {
  padding-left: 6px;
}

</style>
