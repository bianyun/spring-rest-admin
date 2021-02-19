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
      <el-table-column :prop="mainTableFlatKey('name')" label="姓名" min-width="200"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('gender')" label="性别" align="center" min-width="70" :formatter="jooqEnumValueFormatter"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('country')" label="国家或地区" align="center" min-width="95" :formatter="countryEnumFormatter"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('created_time')" label="创建时间" align="center" min-width="160" :formatter="tableColumnDateTimeFormatter"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('last_modified_time')" label="最后修改时间" align="center" min-width="160" :formatter="tableColumnDateTimeFormatter"></el-table-column>

      <table-operation-column :show-action-column="showActionColumn" :operation-items="tableOperationItems" :width="130"></table-operation-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQueryParam.pageNumber"
                :page-sizes="pageSizes" :limit.sync="pageQueryParam.pageSize" @pagination="onPagination" />

    <el-dialog :title="editDialogStatus + label" :visible.sync="showEditDialog"
               :width="resolveDynamicRatioWidth('415px')" :top="resolveDialogMarginTop('20vh')"
               @close="resetDataForm(dataFormRef)" :close-on-click-modal="false">
      <el-form :rules="rules" :ref="dataFormRef" :model="tempFormModel" label-width="95px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="tempFormModel.name"
                    placeholder="长度在 2 到 25 个字符"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="tempFormModel.gender">
            <el-radio v-for="item in genderOptions"
                      :key="item.label" :label="item.name">{{ item.label }}
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
import { authorApi } from '@/api/library/author'
import rules from 'element-ui-validation'
import { LibPerms } from '@/utils/enums/perms/library'
import baseListPageMixin from '@/views/_module/_mixins/base-list-page-mixin'

export default {
  username: 'LibraryAuthorManage',
  mixins: [baseListPageMixin],
  data() {
    const initTempFormModel = {
      id: null,
      name: '',
      gender: 'UNSPECIFIED',
      country: '',
    }

    return {
      label: '作者',
      pageId: 'lib_author',
      confirmLabelColumn: 'name',
      api: authorApi,
      pagePerms: LibPerms,
      initTempFormModel,

      filterItems: [
        { type: 'input', field: 'name', label: '作者姓名' },
        { type: 'select', field: 'gender', label: '性别', optionsFunc: () => this.genderOptions, optionLabelProp: 'label', optionValueProp: 'id' },
      ],

      tableOperationItems: [
        { shape: 'circle', label: '编辑', buttonType: 'primary', icon: 'edit', visibleFunc: () => this.hasPermUpdate, clickHandler: this.onEditBtnClick },
        { shape: 'circle', label: '删除', buttonType: 'danger', icon: 'delete', visibleFunc: () => this.hasPermDelete, clickHandler: this.onDeleteBtnClick },
      ],

      tempFormModel: Object.assign({}, initTempFormModel),
      rules: {
        name: rules.string('姓名', 25, 2),
        country: rules.select('国家或地区', false),
      },
    }
  },
}
</script>

