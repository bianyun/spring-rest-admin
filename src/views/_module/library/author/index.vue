<template>
  <div class="app-container">
    <div class="filter-container">
      <div style="float: left">
        <el-input placeholder="作者姓名" class="filter-item" size="small" v-model="listQuery.roleName"
                  :clearable="true"></el-input>
        <el-button type="primary" class="filter-item" size="small" icon="el-icon-search">
          搜索
        </el-button>
      </div>
    </div>

    <div class="table-level-buttons">
      <el-button type="success" class="filter-item" icon="el-icon-plus"
                 v-if="hasPerm(button_lib_author_add)" size="small" @click="onAddBtnClick">
        添加
      </el-button>
      <el-button type="danger" class="filter-item" icon="el-icon-delete" size="small" @click="onBatchDeleteBtnClick($event)"
                 v-if="hasPerm(button_lib_author_batch_delete)" :disabled="multipleSelection.length === 0">
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
      <el-table-column prop="lib_author__name" label="姓名"></el-table-column>
      <el-table-column prop="lib_author__gender" :formatter="jooqEnumValueFormatter"
                       label="性别" align="center"></el-table-column>
      <el-table-column prop="lib_author__country" label="国家或地区" :formatter="countryEnumFormatter" align="center"></el-table-column>
      <el-table-column prop="lib_author__created_time" :formatter="tableColumnDateTimeFormatter"
                       label="创建时间" align="center"></el-table-column>
      <el-table-column prop="lib_author__last_modified_time" :formatter="tableColumnDateTimeFormatter"
                       label="最后修改时间" align="center"></el-table-column>

      <el-table-column v-if="showActionColumn" label="操作" align="center"  width="200"
                       class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <el-tooltip :hide-after="600" :enterable="false" content="编辑" placement="top">
            <el-button @click="onEditBtnClick(row)" size="small" type="primary" icon="el-icon-edit"
                       v-if="hasPerm(button_lib_author_update)" circle plain></el-button>
          </el-tooltip>
          <el-tooltip :hide-after="600" :enterable="false" content="删除" placement="top">
            <el-button @click="onDeleteBtnClick(row, $event)" size="small" type="danger" icon="el-icon-delete"
                       v-if="hasPerm(button_lib_author_delete)" circle plain></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQueryParam.pageNumber"
                :page-sizes="pageSizes" :limit.sync="pageQueryParam.pageSize" @pagination="onPagination" />

    <el-dialog :title="editDialogStatus + '作者'" :visible.sync="showEditDialog" width="27%"
               @close="resetDataForm(dataFormRef)" :close-on-click-modal="false">
      <el-form :rules="rules" :ref="dataFormRef" :model="tempFormModel" label-width="95px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="tempFormModel.name"
                    placeholder="长度在 2 到 25 个字符"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="tempFormModel.gender">
            <el-radio v-for="item in enumLabelNameMap[ENUM_CLASS_NAME_GENDER]"
                      :key="item.label" :label="item.label">{{ item.name }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="国家或地区" prop="country">
          <el-select v-model="tempFormModel.country" filterable :default-first-option="true"
                     placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in countryOptions"
              :key="item.label"
              :label="item.label"
              :value="item.value">
              <span style="float: left">{{ item.label }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px; font-family: 'Courier New',monospace">{{ item.value }}</span>
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
import authorApi from '@/api/library/author'
import Pagination from '@/components/Pagination'
import { DialogStatus } from '@/utils/enums'
import baseMixin from '@/views/_module/_mixins/base-mixin'
import { hasPerm } from '@/utils/permission'
import rules from 'element-ui-validation'
import { LibPerms } from '@/utils/enums/perms/library'

export default {
  username: 'LibraryAuthorManage',
  components: { Pagination },
  mixins: [baseMixin],
  data() {
    // const pageSizes = [10, 20, 30, 50, 100]
    const initTempModel = {
      id: null,
      name: '',
      gender: 'UNSPECIFIED',
      country: 'US',
    }

    return {
      ...LibPerms,

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
        name: rules.string('姓名', 25, 2),
        country: rules.select('国家或地区', false),
      },
    }
  },
  computed: {
    showActionColumn() {
      return hasPerm(this.button_lib_author_update) ||
        hasPerm(this.button_lib_author_delete)
    },
    showSelectionColumn() {
      return hasPerm(this.button_lib_author_batch_delete)
    },
  },
  created() {
    this.fetchTableData()
  },
  methods: {
    async fetchTableData() {
      this.tableDataLoading = true
      const { list, totalElements } = await authorApi.$pageFlatQuery(this.pageQueryParam)
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
          authorApi.$create(this.tempFormModel).then(() => {
            this.fetchTableData()
            this.showEditDialog = false
            this.$notify.success('作者添加成功')
          })
        } else if (this.editDialogStatus === DialogStatus.EDIT) {
          authorApi.$update(this.tempFormModel).then(() => {
            this.fetchTableData()
            this.showEditDialog = false
            this.$notify.success('作者更新成功')
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
      this.tempFormModel = await authorApi.$findById(this.getIdValueOfFlatQueryObj(row))
      this.editDialogStatus = DialogStatus.EDIT
      this.showEditDialog = true
    },

    onDeleteBtnClick(row, event) {
      const { lib_author__name: name } = row
      this.$confirm(`您确定要删除作者【${name}】吗？`, '提示').then(() => {
        authorApi.$deleteById(this.getIdValueOfFlatQueryObj(row)).then(() => {
          this.fetchTableData()
          this.$notify.success('作者删除成功')
        })
      }).finally(() => {
        this.blurTargetButton(event)
      })
    },

    onBatchDeleteBtnClick(event) {
      if (this.multipleSelection.length === 0) {
        return false
      }
      this.$confirm(`您确定要批量删除选中的所有作者吗？`, '提示').then(() => {
        const toBeDeletedIds = this.multipleSelection.map(row => this.getIdValueOfFlatQueryObj(row))
        authorApi.$batchDeleteByIdSet(toBeDeletedIds).then(() => {
          this.fetchTableData()
          this.$notify.success('作者批量删除成功')
        })
      }).finally(() => {
        this.blurTargetButton(event)
      })
    },

  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
