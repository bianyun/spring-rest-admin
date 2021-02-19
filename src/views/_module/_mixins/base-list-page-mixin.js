import baseMixin from '@/views/_module/_mixins/base-mixin'
import Pagination from '@/components/Pagination'
import FilterContainer from '@/views/_module/_components/FilterContainer'
import { DialogStatus } from '@/utils/enums'
import { hasPerm } from '@/utils/permission'
import TableLevelButtons from '@/views/_module/_components/TableLevelButtons'
import { Expr } from '@/views/_module/_mixins/expr'
import { assertNotNullArray, assertNotNullOrUndefined } from '@/utils/validator/assert'
import { isFunction, isNotBlankString } from '@/utils/validator'
import TableOperationColumn from '@/views/_module/_components/TableOperationColumn'

export default {
  name: 'baseListPageMixin',
  mixins: [ baseMixin ],
  components: { Pagination, FilterContainer, TableLevelButtons, TableOperationColumn },
  data() {
    const pageSizes = [7, 10, 20, 30, 50, 100]
    return {
      // 需要在页面组件中给出实际的值
      label: null,
      pageId: null,
      confirmLabelColumn: null,
      api: null,
      pagePerms: null,
      initTempFormModel: null,

      ID_COLUMN_NAME: 'id',
      ACTIVE_COLUMN_NAME: 'active',

      total: 0,
      tableDataLoading: false,
      tableName: 'dataTable',
      tableData: [],
      multipleSelection: [],

      pageSizes: pageSizes,
      pageQueryParam: {
        pageNumber: 1,
        pageSize: pageSizes[0],
        queryConditionExpr: '',
        querySortExpr: '',
      },

      dataFormRef: 'dataFormRef',
      showEditDialog: false,
      editDialogStatus: '',

    }
  },
  computed: {
    hasPermAdd() {
      return hasPerm(this.pagePerms[`button_${this.pageId}_add`])
    },
    hasPermUpdate() {
      return hasPerm(this.pagePerms[`button_${this.pageId}_update`])
    },
    hasPermDelete() {
      return hasPerm(this.pagePerms[`button_${this.pageId}_delete`])
    },
    hasPermBatchDelete() {
      return hasPerm(this.pagePerms[`button_${this.pageId}_batch_delete`])
    },
    hasPermActiveOnOff() {
      return hasPerm(this.pagePerms[`button_${this.pageId}_active_on_off`])
    },
    showActionColumn() {
      return this.hasPermUpdate || this.hasPermDelete
    },
    flatTablePrefix() {
      return this.pageId + this.DELIMITER_BETWEEN_TABLE_AND_FIELD
    },
    flatQueryObjIdKey() {
      return this.flatTablePrefix + this.ID_COLUMN_NAME
    },
    flatQueryObjActiveKey() {
      return this.flatTablePrefix + this.ACTIVE_COLUMN_NAME
    },
  },
  async created() {
    assertNotNullOrUndefined(this.api, 'api对象')
    assertNotNullOrUndefined(this.label, 'label')
    assertNotNullOrUndefined(this.pagePerms, '页面权限对象')
    assertNotNullOrUndefined(this.pageId, '页面标识符')
    assertNotNullOrUndefined(this.initTempFormModel, '表单初始值对象')
    await this.fetchTableData(1)
  },
  methods: {
    async fetchTableData(pageNumber) {
      if (pageNumber) {
        this.pageQueryParam.pageNumber = pageNumber
      }
      const pageQueryParam = this.buildQueryExpression(this.pageQueryParam, '.filter-container')
      this.tableDataLoading = true
      const { list, totalElements } = await this.api.$pageFlatQuery(pageQueryParam)
      this.tableData = list
      this.total = totalElements
      this.tableDataLoading = false
    },
    async onPagination({ page, limit }) {
      this.pageQueryParam.pageNumber = page
      this.pageQueryParam.pageSize = limit
      await this.fetchTableData()
    },

    /**
     * 从后台 FlatQuery查询得到的 key-value扁平对象中获取ID字段的值
     *
     * @param flatQueryObj {Object} FlatQuery扁平对象
     * @returns {number} ID字段的值
     */
    getIdValueOfFlatQueryObj(flatQueryObj) {
      return flatQueryObj[this.flatQueryObjIdKey]
    },

    isFlatRowActive(flatRow) {
      return flatRow[this.flatQueryObjActiveKey]
    },

    mainTableFlatKey(keyWithoutMainTablePrefix) {
      return this.flatTablePrefix + keyWithoutMainTablePrefix
    },
    derivedTableFlatKey(derivedTableName, keyWithoutTablePrefix) {
      return derivedTableName + this.DELIMITER_BETWEEN_TABLE_AND_FIELD + keyWithoutTablePrefix
    },

    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    async onAddBtnClick() {
      if (isFunction(this.hookWhenAddOrEditBtnClick)) {
        this.hookWhenAddOrEditBtnClick()
      }

      this.editDialogStatus = DialogStatus.ADD
      Object.assign(this.tempFormModel, this.initTempFormModel)
      this.showEditDialog = true
    },
    async onEditBtnClick(row) {
      if (isFunction(this.hookWhenAddOrEditBtnClick)) {
        this.hookWhenAddOrEditBtnClick()
      }

      this.tempFormModel = await this.api.$findById(this.getIdValueOfFlatQueryObj(row))
      this.editDialogStatus = DialogStatus.EDIT
      this.showEditDialog = true
      if (isFunction(this.hookAfterInitEditObj)) {
        this.hookAfterInitEditObj()
      }
    },
    onDeleteBtnClick(row, event) {
      const confirmLabel = row[this.getFullFlatQueryRecordKey(this.confirmLabelColumn)]
      this.$confirm(`您确定要删除${this.label}【${confirmLabel}】吗？`, '提示').then(() => {
        this.api.$deleteById(this.getIdValueOfFlatQueryObj(row)).then(() => {
          this.fetchTableData(1).then(() => this.$notify.success(`${this.label}删除成功`))
        })
      }).finally(() => this.blurTargetButton(event))
    },
    onBatchDeleteBtnClick(event) {
      if (this.multipleSelection.length === 0) {
        return false
      }
      this.$confirm(`您确定要批量删除选中的所有${this.label}吗？`, '提示').then(() => {
        const toBeDeletedIds = this.multipleSelection.map(row => this.getIdValueOfFlatQueryObj(row))
        this.api.$batchDeleteByIdSet(toBeDeletedIds).then(() => {
          this.fetchTableData(1).then(() => this.$notify.success(`${this.label}批量删除成功`))
        })
      }).finally(() => this.blurTargetButton(event))
    },
    getFullFlatQueryRecordKey(field) {
      return this.pageId + this.DELIMITER_BETWEEN_TABLE_AND_FIELD + field
    },

    onActivateBtnClick(row, event) {
      const confirmLabel = row[this.getFullFlatQueryRecordKey(this.confirmLabelColumn)]
      this.$confirm(`您确定要启用${this.label}【${confirmLabel}】吗？`, '提示').then(() => {
        this.api.activateUserById(this.getIdValueOfFlatQueryObj(row)).then(() => {
          this.fetchTableData(1).then(() => this.$notify.success(`${this.label}启用成功`))
        })
      }).finally(() => this.blurTargetButton(event))
    },

    onDeactivateBtnClick(row, event) {
      const confirmLabel = row[this.getFullFlatQueryRecordKey(this.confirmLabelColumn)]
      this.$confirm(`您确定要停用${this.label}【${confirmLabel}】吗？`, '提示').then(() => {
        this.api.deactivateUserById(this.getIdValueOfFlatQueryObj(row)).then(() => {
          this.fetchTableData(1).then(() => this.$notify.success(`${this.label}启用成功`))
        })
      }).finally(() => this.blurTargetButton(event))
    },

    onEditDialogConfirm() {
      this.$refs[this.dataFormRef].validate((valid) => {
        if (!valid) return false

        if (isFunction(this.hookBeforeSaveEditObj)) {
          this.hookBeforeSaveEditObj()
        }

        if (this.editDialogStatus === DialogStatus.ADD) {
          this.api.$create(this.tempFormModel).then(() => {
            this.fetchTableData().then(() => {
              this.showEditDialog = false
              this.$notify.success(`${this.label}添加成功`)
            })
          })
        } else if (this.editDialogStatus === DialogStatus.EDIT) {
          this.api.$update(this.tempFormModel).then(() => {
            this.fetchTableData().then(() => {
              this.showEditDialog = false
              this.$notify.success(`${this.label}更新成功`)
            })
          })
        }
      })
    },

    resetDataForm() {
      this.$refs[this.dataFormRef].resetFields()
      Object.assign(this.tempFormModel, this.initTempFormModel)
    },

    buildQueryExpression: function (pageQueryParam, searchFormSelector, conditionStrArray) {
      const resultPageQueryParam = Object.assign({}, pageQueryParam);
      const searchForm = document.querySelector(searchFormSelector);

      if (!searchForm) {
        return resultPageQueryParam;
      }

      if (conditionStrArray) {
        assertNotNullArray(conditionStrArray, "conditionStrArray");
      }

      const selectors = this.getSelectorArrayForSearchForm(searchFormSelector);
      let expr = new Expr();
      for (const selector of selectors) {
        expr = expr.and(selector);
      }

      if (conditionStrArray && conditionStrArray.length > 0) {
        for (const condition of conditionStrArray) {
          expr = expr.and(condition, true);
        }
      }

      const existingQueryExpression = pageQueryParam.queryConditionExpr;
      if (isNotBlankString(existingQueryExpression)) {
        expr.and(existingQueryExpression, true);
      }

      const evaluatedQueryExpression = Expr.eval(expr);
      if (isNotBlankString(evaluatedQueryExpression)) {
        console.log("evaluatedQueryExpression: ", evaluatedQueryExpression);
      }
      resultPageQueryParam.queryConditionExpr = evaluatedQueryExpression;
      return resultPageQueryParam;
    },
    getSelectorArrayForSearchForm: function (searchFormSelector) {
      const searchForm = document.querySelector(searchFormSelector);

      let selectorMap = new Map();
      selectorMap.set("single-column", "input[type='text'][name]");
      selectorMap.set("single-column-hidden", "input[type='hidden'][name]");
      selectorMap.set("multi-or-columns", "input[type='text'][or-names]");
      selectorMap.set("date-range-picker", "div.date-range-picker.filter-item[id]");
      selectorMap.set("year-month-range-picker", "div.year-month-range-picker.filter-item[id]");
      selectorMap.set("select-one", "select[name]");

      const selectors = [];
      selectorMap.forEach((value, key) => {
        let nodes = searchForm.querySelectorAll(value);
        if (key === "single-column" || key === "single-column-hidden") {
          for (let node of nodes) {
            let name = node.getAttribute("name");
            if (name && node.value) {
              selectors.push(value.replace("name", "name='" + name + "'"));
            }
          }
        } else if (key === "multi-or-columns") {
          for (let node of nodes) {
            let or_names = node.getAttribute("or-names");
            if (or_names && node.value) {
              selectors.push(value.replace("or-names", "or-names='" + or_names + "'"));
            }
          }
        } else if (key === "date-range-picker") {
          for (const node of nodes) {
            if (node.id) {
              const startDateInput = node.querySelector("div.start-date input[type='text']");
              const endDateInput = node.querySelector("div.end-date input[type='text']");
              if (startDateInput && endDateInput && (startDateInput.value || endDateInput.value)) {
                selectors.push("#" + node.id);
              }
            }
          }
        } else if (key === "year-month-range-picker") {
          for (const node of nodes) {
            if (node.id) {
              const startYearMonthInput = node.querySelector("div.start-year-month input[type='text']");
              const endYearMonthInput = node.querySelector("div.end-year-month input[type='text']");
              if (startYearMonthInput && endYearMonthInput && (startYearMonthInput.value || endYearMonthInput.value)) {
                selectors.push("#" + node.id);
              }
            }
          }
        } else if (key === "select-one") {
          const nameSet = new Set();
          nodes.forEach(node => {
            nameSet.add(node.getAttribute("name"));
          });
          nameSet.forEach(name => {
            if (name) {
              const selector = value.replace("name", "name='" + name + "'");
              let nonDefaultOptionSelected = false;
              searchForm.querySelectorAll(selector).forEach(select => {
                if (select.selectedIndex > 0) {
                  nonDefaultOptionSelected = true;
                }
              });
              if (nonDefaultOptionSelected) {
                selectors.push(selector);
              }
            }
          });
        }
      });

      return selectors.map(selector => searchFormSelector + " " + selector);
    },
  }
}
