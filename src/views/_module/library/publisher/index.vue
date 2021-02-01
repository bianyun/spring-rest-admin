<template>
  <div class="app-container">
    <div class="filter-container">
      <div style="float: left">
        <el-input placeholder="出版社名" class="filter-item" size="small" v-model="listQuery.roleName"
                  :clearable="true"></el-input>
        <el-input placeholder="昵称" class="filter-item" size="small" v-model="listQuery.roleValue"
                  :clearable="true"></el-input>
        <el-button type="primary" class="filter-item" size="small" icon="el-icon-search">
          搜索
        </el-button>
      </div>
      <div style="float: right">
        <el-button type="success" class="filter-item" icon="el-icon-plus"
                   v-if="hasPerm(button_lib_publisher_add)" size="small" @click="onAddBtnClick">
          添加
        </el-button>
        <el-button type="danger" class="filter-item" icon="el-icon-delete" size="small" @click="onBatchDeleteBtnClick($event)"
                   v-if="hasPerm(button_lib_publisher_batch_delete)" :disabled="multipleSelection.length === 0">
          删除
        </el-button>
      </div>
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
      <el-table-column prop="lib_publisher__name" label="名称"></el-table-column>
      <el-table-column prop="lib_publisher__address" label="地址"></el-table-column>
      <el-table-column prop="lib_publisher__zip_code" label="邮编" align="center"></el-table-column>
      <el-table-column prop="lib_publisher__country" label="国家或地区"
                       :formatter="countryEnumFormatter" align="center"></el-table-column>

      <el-table-column v-if="showActionColumn" label="操作" align="center" width="200"
                       class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <el-tooltip :hide-after="600" :enterable="false" content="编辑" placement="top">
            <el-button @click="onEditBtnClick(row)" size="small" type="primary" icon="el-icon-edit"
                       v-if="hasPerm(button_lib_publisher_update)" circle plain></el-button>
          </el-tooltip>
          <el-tooltip :hide-after="600" :enterable="false" content="删除" placement="top">
            <el-button @click="onDeleteBtnClick(row, $event)" size="small" type="danger" icon="el-icon-delete"
                       v-if="hasPerm(button_lib_publisher_delete)" circle plain></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQueryParam.pageNumber"
                :page-sizes="pageSizes" :limit.sync="pageQueryParam.pageSize" @pagination="onPagination" />

    <el-dialog :title="editDialogStatus + '出版社'" :visible.sync="showEditDialog" width="27%"
               @close="resetDataForm(dataFormRef)" :close-on-click-modal="false">
      <el-form :rules="rules" :ref="dataFormRef" :model="tempFormModel" label-width="95px">
        <el-form-item label="名称" prop="name">
          <el-input v-model.trim="tempFormModel.name"
                    placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model.trim="tempFormModel.address"
                    placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="邮编" prop="zipCode">
          <el-input v-model.trim="tempFormModel.zipCode"
                    placeholder="请输入邮编"></el-input>
        </el-form-item>
        <el-form-item label="国家或地区" prop="country">
          <el-select v-model="tempFormModel.country" filterable :default-first-option="true"
                     placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in countryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              <span style="float: left">{{ item.label }}</span>
              <span style="float: right; color: #8492a6;">{{ item.value }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="onEditDialogConfirm()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import publisherApi from '@/api/library/publisher'
import Pagination from '@/components/Pagination'
import { DialogStatus } from '@/utils/enums'
import baseMixin from '@/views/_module/_mixins/base-mixin'
import { hasPerm } from '@/utils/permission'
import rules from 'element-ui-validation'
import { LibPerms } from '@/utils/enums/perms/library'

export default {
  username: 'LibraryPublisherManage',
  components: { Pagination },
  mixins: [baseMixin],
  data() {
    const pageSizes = [10, 20, 30, 50, 100]
    const initTempModel = {
      id: null,
      name: '',
      address: '',
      zipCode: '',
      country: '',
    }

    return {
      ...LibPerms,

      dataFormRef: 'dataFormRef',
      initTempModel,
      tempFormModel: Object.assign({}, initTempModel),
      tableName: 'dataTable',
      multipleSelection: [],
      pageSizes: pageSizes,
      pageQueryParam: {
        pageNumber: 1,
        pageSize: pageSizes[0],
        queryConditionExpr: '',
        querySortExpr: '',
      },

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
        name: rules.string('名称', 50, 2, 'change'),
        country: rules.select('国家或地区', false),
      },
    }
  },
  computed: {
    showActionColumn() {
      return hasPerm(this.button_lib_publisher_update) ||
        hasPerm(this.button_lib_publisher_delete)
    },
    showSelectionColumn() {
      return hasPerm(this.button_lib_publisher_batch_delete)
    },
  },
  created() {
    this.fetchTableData()
  },
  methods: {
    async fetchTableData() {
      this.tableDataLoading = true
      const { list, totalElements } = await publisherApi.$pageFlatQuery(this.pageQueryParam)
      this.tableData = list
      this.total = totalElements
      this.tableDataLoading = false
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
          publisherApi.$create(this.tempFormModel).then(() => {
            this.fetchTableData()
            this.showEditDialog = false
            this.$notify.success('出版社添加成功')
          })
        } else if (this.editDialogStatus === DialogStatus.EDIT) {
          publisherApi.$update(this.tempFormModel).then(() => {
            this.fetchTableData()
            this.showEditDialog = false
            this.$notify.success('出版社更新成功')
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
      this.tempFormModel = await publisherApi.$findById(this.getIdValueOfFlatQueryObj(row))
      this.editDialogStatus = DialogStatus.EDIT
      this.showEditDialog = true
    },

    onDeleteBtnClick(row, event) {
      const { lib_publisher__name: name } = row
      this.$confirm(`您确定要删除出版社【${name}】吗？`, '提示').then(() => {
        publisherApi.$deleteById(this.getIdValueOfFlatQueryObj(row)).then(() => {
          this.fetchTableData()
          this.$notify.success('出版社删除成功')
        })
      }).finally(() => {
        this.blurTargetButton(event)
      })
    },

    onBatchDeleteBtnClick(event) {
      if (this.multipleSelection.length === 0) {
        return false
      }
      this.$confirm(`您确定要批量删除选中的所有出版社吗？`, '提示').then(() => {
        const toBeDeletedIds = this.multipleSelection.map(row => this.getIdValueOfFlatQueryObj(row))
        publisherApi.$batchDeleteByIdSet(toBeDeletedIds).then(() => {
          this.fetchTableData()
          this.$notify.success('出版社批量删除成功')
        })
      }).finally(() => {
        this.blurTargetButton(event)
      })
    },

  },
}
</script>

