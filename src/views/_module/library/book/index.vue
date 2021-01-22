<template>
  <div class="app-container">
    <div class="filter-container">
      <div style="float: left">
        <el-input placeholder="标题" class="filter-item" size="small" v-model="listQuery.roleName"
                  :clearable="true"></el-input>
        <el-input placeholder="ISBN" class="filter-item" size="small" v-model="listQuery.roleValue"
                  :clearable="true"></el-input>
        <el-button type="primary" class="filter-item" size="small" icon="el-icon-search">
          搜索
        </el-button>
      </div>
      <div style="float: right">
        <el-button type="success" class="filter-item" icon="el-icon-plus"
                   v-if="hasPerm(button_lib_book_add)" size="small" @click="onAddBtnClick">
          添加
        </el-button>
        <el-button type="danger" class="filter-item" icon="el-icon-delete" size="small" @click="onBatchDeleteBtnClick($event)"
                   v-if="hasPerm(button_lib_book_batch_delete)" :disabled="multipleSelection.length === 0">
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
      <el-table-column prop="lib_book__title" label="标题"></el-table-column>
      <el-table-column prop="lib_book__isbn" label="ISBN"></el-table-column>
      <el-table-column prop="lib_publisher__name" label="出版社"></el-table-column>
      <el-table-column prop="authors__name" label="作者"></el-table-column>
<!--      <el-table-column prop="lib_book__translaters" label="译者" width="120"></el-table-column>-->
      <el-table-column label="字数" align="center" width="100">
        <template slot-scope="{ row: {lib_book__word_count} }">
          {{ lib_book__word_count }} 千字
        </template>
      </el-table-column>
      <el-table-column label="价格" align="center" width="100">
        <template slot-scope="{ row: {lib_book__unit_price} }">
          {{ (lib_book__unit_price / 100).toFixed(2) }} 元
        </template>
      </el-table-column>

      <el-table-column v-if="showActionColumn" label="操作" align="center" width="200"
                       class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <el-tooltip :hide-after="600" :enterable="false" content="编辑" placement="top">
            <el-button @click="onEditBtnClick(row)" size="small" type="primary" icon="el-icon-edit"
                       v-if="hasPerm(button_lib_book_update)" circle plain></el-button>
          </el-tooltip>
          <el-tooltip :hide-after="600" :enterable="false" content="删除" placement="top">
            <el-button @click="onDeleteBtnClick(row, $event)" size="small" type="danger" icon="el-icon-delete"
                       v-if="hasPerm(button_lib_book_delete)" circle plain></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQueryParam.pageNumber"
                :page-sizes="pageSizes" :limit.sync="pageQueryParam.pageSize" @pagination="onPagination" />

    <el-dialog :title="editDialogStatus + '图书'" :visible.sync="showEditDialog" width="38%"
               @close="resetDataForm(dataFormRef)" :close-on-click-modal="false">
      <el-form :rules="rules" :ref="dataFormRef" :model="tempFormModel" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="tempFormModel.title"
                    placeholder="长度不能大于100 个字符"></el-input>
        </el-form-item>
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model.trim="tempFormModel.isbn"
                    placeholder="请输入ISBN"></el-input>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="字数" prop="wordCount">
              <el-input v-model.number="tempFormModel.wordCount">
                <template slot="append">千字</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价 (元)" prop="unitPrice">
              <el-input-number v-model.number="tempFormModel.unitPrice"
                               :precision="2" controls-position="right">
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="出版社" prop="publisherId">
          <el-select v-model="tempFormModel.publisherId" filterable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in publishers"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="作者" prop="authorIds">
          <el-select v-model="tempFormModel.authorIds" multiple filterable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in authors"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="译者" prop="translaters">
          <el-input v-model="tempFormModel.translaters" placeholder="请输入译者"></el-input>
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
import bookApi from '@/api/library/book'
import publisherApi from '@/api/library/publisher'
import authorApi from '@/api/library/author'
import Pagination from '@/components/Pagination'
import { DialogStatus } from '@/utils/enums'
import baseMixin from '@/views/_module/_mixins/base-mixin'
import { hasPerm } from '@/utils/permission'
import rules from 'element-ui-validation'
import { LibPerms } from '@/utils/enums/perms/library'

export default {
  username: 'LibraryBookManage',
  components: { Pagination },
  mixins: [baseMixin],
  data() {
    const pageSizes = [10, 20, 30, 50, 100]
    const initTempModel = {
      id: null,
      title: '',
      isbn: '',
      wordCount: null,
      unitPrice: null,
      publisherId: null,
      authorIds: [],
      translaterIds: [],
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
        title: rules.string('标题', 100, null, 'change'),
        isbn: rules.string('ISBN', 20, null, 'change'),
        wordCount: rules.integer('字数', null, null, 'change'),
        unitPrice: rules.money('单价', 10000, 0, 'change'),
        publisherId: rules.select('出版社', false),
        authorIds: rules.select('作者', true),
        translaters: rules.string('译者', 100, null, 'change', false),
      },

      publishers: [],
      authors: [],
      translaters: '',
    }
  },
  computed: {
    showActionColumn() {
      return hasPerm(this.button_lib_book_update) ||
        hasPerm(this.button_lib_book_delete)
    },
    showSelectionColumn() {
      return hasPerm(this.button_lib_book_batch_delete)
    },
  },
  created() {
    this.fetchTableData()
  },
  methods: {
    async fetchTableData() {
      this.tableDataLoading = true
      const { list, totalElements } = await bookApi.$pageFlatQuery(this.pageQueryParam)
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

        const unitPrice = this.tempFormModel.unitPrice * 100
        const data = Object.assign({}, this.tempFormModel, { unitPrice })

        if (this.editDialogStatus === DialogStatus.ADD) {
          bookApi.$create(data).then(() => {
            this.fetchTableData()
            this.showEditDialog = false
            this.$notify.success('图书添加成功')
          })
        } else if (this.editDialogStatus === DialogStatus.EDIT) {
          bookApi.$update(data).then(() => {
            this.fetchTableData()
            this.showEditDialog = false
            this.$notify.success('图书更新成功')
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

    async onAddBtnClick() {
      this.publishers = await publisherApi.$getAll()
      this.authors = await authorApi.$getAll()

      this.editDialogStatus = DialogStatus.ADD
      Object.assign(this.tempFormModel, this.initTempModel)
      this.showEditDialog = true
    },

    async onEditBtnClick(row) {
      this.tempFormModel = await bookApi.$findById(this.getIdValueOfFlatQueryObj(row))
      this.tempFormModel.unitPrice = (this.tempFormModel.unitPrice / 100).toFixed(2)

      this.editDialogStatus = DialogStatus.EDIT
      this.showEditDialog = true
    },

    onDeleteBtnClick(row, event) {
      const { lib_book__title: name } = row
      this.$confirm(`您确定要删除图书【${name}】吗？`, '提示').then(() => {
        bookApi.$deleteById(this.getIdValueOfFlatQueryObj(row)).then(() => {
          this.fetchTableData()
          this.$notify.success('图书删除成功')
        })
      }).catch(() => {
        this.blurTargetButton(event)
      })
    },

    onBatchDeleteBtnClick(event) {
      if (this.multipleSelection.length === 0) {
        return false
      }
      this.$confirm(`您确定要批量删除选中的所有图书吗？`, '提示').then(() => {
        const toBeDeletedIds = this.multipleSelection.map(row => this.getIdValueOfFlatQueryObj(row))
        bookApi.$batchDeleteByIdSet(toBeDeletedIds).then(() => {
          this.fetchTableData()
          this.$notify.success('图书批量删除成功')
        })
      }).catch(() => {
        this.blurTargetButton(event)
      })
    },

  },
}
</script>

<style lang="scss" scoped>
.el-input-number {
  width: 100%;
}
::v-deep .el-dialog__body {
  padding-left: 5px;
}
</style>
