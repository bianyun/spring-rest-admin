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
      <el-table-column :prop="mainTableFlatKey('name')" label="名称" min-width="140"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('address')" label="地址" min-width="250"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('zip_code')" label="邮政编码" align="center" min-width="80"></el-table-column>
      <el-table-column :prop="mainTableFlatKey('country')" label="国家或地区" align="center" min-width="95" :formatter="countryEnumFormatter"></el-table-column>

      <table-operation-column :show-action-column="showActionColumn" :operation-items="tableOperationItems" :width="130"></table-operation-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQueryParam.pageNumber"
                :page-sizes="pageSizes" :limit.sync="pageQueryParam.pageSize" @pagination="onPagination" />

    <el-dialog :title="editDialogStatus + label" :visible.sync="showEditDialog"
               :width="resolveDynamicRatioWidth('415px')" :top="resolveDialogMarginTop('20vh')"
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
import { publisherApi } from '@/api/library/publisher'
import rules from 'element-ui-validation'
import { LibPerms } from '@/utils/enums/perms/library'
import baseListPageMixin from '@/views/_module/_mixins/base-list-page-mixin'

export default {
  username: 'LibraryPublisherManage',
  mixins: [baseListPageMixin],
  data() {
    const initTempFormModel = {
      id: null,
      name: '',
      address: '',
      zipCode: '',
      country: '',
    }

    return {
      label: '出版社',
      pageId: 'lib_publisher',
      confirmLabelColumn: 'name',
      api: publisherApi,
      pagePerms: LibPerms,
      initTempFormModel,

      filterItems: [
        { type: 'input', field: 'name', label: '出版社名称' },
        { type: 'input', field: 'address', label: '出版社地址' },
        { type: 'input', field: 'zip_code', label: '邮政编码' },
      ],

      tableOperationItems: [
        { shape: 'circle', label: '编辑', buttonType: 'primary', icon: 'edit', visibleFunc: () => this.hasPermUpdate, clickHandler: this.onEditBtnClick },
        { shape: 'circle', label: '删除', buttonType: 'danger', icon: 'delete', visibleFunc: () => this.hasPermDelete, clickHandler: this.onDeleteBtnClick },
      ],

      tempFormModel: Object.assign({}, initTempFormModel),
      rules: {
        name: rules.string('名称', 50, 2, 'change'),
        country: rules.select('国家或地区', false),
      },
    }
  },
}
</script>

