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
      <el-table-column :prop="mainTableFlatKey('title')" label="标题" min-width="250"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('isbn')" label="ISBN" align="center" width="150"></el-table-column>
      <el-table-column :prop="derivedTableFlatKey('lib_publisher', 'name')" label="出版社" align="center" min-width="140"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('published_on')" label="出版时间" align="center" width="100"></el-table-column>
      <el-table-column :prop="derivedTableFlatKey('authors', 'name')" label="作者" min-width="250"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('word_count')" label="字数" align="center" width="80" :formatter="wordCountFormatter"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('unit_price')" label="价格" align="center" width="80" :formatter="moneyCentsToYuanFormatter"></el-table-column>

      <table-operation-column :show-action-column="showActionColumn" :operation-items="tableOperationItems" :width="130"></table-operation-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQueryParam.pageNumber"
                :page-sizes="pageSizes" :limit.sync="pageQueryParam.pageSize" @pagination="onPagination" />

    <el-dialog :title="editDialogStatus + label" :visible.sync="showEditDialog"
               :width="resolveDynamicRatioWidth('583px')" :top="resolveDialogMarginTop('10vh')"
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
          <el-col :span="12" :xs="24">
            <el-form-item label="字数" prop="wordCount">
              <el-input v-model.number="tempFormModel.wordCount">
                <template slot="append">千字</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="单价 (元)" prop="unitPrice">
              <el-input-number v-model.number="tempFormModel.unitPrice"
                               :precision="2" controls-position="right">
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="出版社" prop="publisher">
          <el-select v-model="tempFormModel.publisher" value-key="id" filterable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in allPublishers"
              :key="item.id"
              :label="item.name"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="作者" prop="authors">
          <el-select v-model="tempFormModel.authors" value-key="id" multiple filterable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in allAuthors"
              :key="item.id"
              :label="item.name"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出版时间" prop="publishedOn">
          <el-date-picker type="month" style="width: 100%" v-model="tempFormModel.publishedOn" :editable="false" value-format="yyyy-MM"
                          placeholder="请选择发行时间"></el-date-picker>
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
import { bookApi } from '@/api/library/book'
import rules from 'element-ui-validation'
import { LibPerms } from '@/utils/enums/perms/library'
import baseListPageMixin from '@/views/_module/_mixins/base-list-page-mixin'
import { publisherApi } from '@/api/library/publisher'
import { authorApi } from '@/api/library/author'

export default {
  username: 'LibraryBookManage',
  mixins: [baseListPageMixin],
  data() {
    const initTempFormModel = {
      id: null,
      title: '',
      isbn: '',
      wordCount: null,
      unitPrice: null,
      translaters: null,
      publishedOn: null,
      publisher: null,
      authors: [],
    }

    return {
      label: '图书',
      pageId: 'lib_book',
      confirmLabelColumn: 'title',
      api: bookApi,
      pagePerms: LibPerms,
      initTempFormModel,

      filterItems: [
        { type: 'input', field: 'title', label: '图书标题' },
        { type: 'input', field: 'isbn', label: 'ISBN' },
        { type: 'input', field: 'authors__name', label: '作者名称' },
        { type: 'select', field: 'publisher_id', label: '出版社', width: 155,
          optionsFunc: () => this.allPublishers, optionLabelProp: 'name', optionValueProp: 'id' },
        { type: 'year-month-range', field: 'published_on', label: '出版时间' },
      ],

      tableOperationItems: [
        { shape: 'circle', label: '编辑', buttonType: 'primary', icon: 'edit', visibleFunc: () => this.hasPermUpdate, clickHandler: this.onEditBtnClick },
        { shape: 'circle', label: '删除', buttonType: 'danger', icon: 'delete', visibleFunc: () => this.hasPermDelete, clickHandler: this.onDeleteBtnClick },
      ],

      tempFormModel: Object.assign({}, initTempFormModel),
      rules: {
        title: rules.string('标题', 100, null, 'change'),
        isbn: rules.string('ISBN', 20, null, 'change'),
        wordCount: rules.integer('字数', null, null, 'change'),
        unitPrice: rules.money('单价', 10000, 0, 'change'),
        publisher: rules.select('出版社', false),
        authors: rules.select('作者', true),
        translaters: rules.string('译者', 100, null, 'change', false),
      },

      allPublishers: [],
      allAuthors: [],
    }
  },
  async created() {
    this.allPublishers = await publisherApi.$getAll()
  },
  methods: {
    hookWhenAddOrEditBtnClick() {
      publisherApi.$getAll().then(res => this.allPublishers = res)
      authorApi.$getAll().then(res => this.allAuthors = res)
    },
    hookAfterInitEditObj() {
      this.tempFormModel.unitPrice = (this.tempFormModel.unitPrice / 100).toFixed(2)
    },
    hookBeforeSaveEditObj() {
      const unitPrice = (this.tempFormModel.unitPrice * 100).toFixed(0)
      this.tempFormModel = Object.assign({}, this.tempFormModel, { unitPrice })
    },
    wordCountFormatter(row, column, cellValue) {
      return cellValue + ' 千字'
    },
  }
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
