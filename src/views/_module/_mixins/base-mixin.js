
import { hasPerm } from '@/utils/permission'
import { ENUM_CLASS_NAME_GENDER } from '@/utils/consts'
import miscApi from '@/api/_system/misc'
import CountryOptions from '@/utils/consts/country-options'
import { resolveDialogMarginTop, resolveDialogWidth } from '@/utils/core'

export default {
  name: 'baseMixin',


  data: function () {
    const pageSizes = [7, 10, 20, 30, 50, 100]
    return {
      DELIMITER_BETWEEN_TABLE_AND_FIELD: '__',
      ENUM_CLASS_NAME_GENDER,

      enumLabelNameMap: {},
      countryOptions: CountryOptions,

      pageSizes: pageSizes,

      pageQueryParam: {
        pageNumber: 1,
        pageSize: pageSizes[0],
        queryConditionExpr: '',
        querySortExpr: '',
      },
    }
  },
  async created() {
    this.enumLabelNameMap = await miscApi.getEnumLabelNameMap()
  },
  methods: {
    resolveDialogWidth,
    resolveDialogMarginTop,

    /**
     * 刷新当前用户资料
     *
     * @returns {Promise<any>}
     */
    refreshUserProfileAndRoutes() {
      return this.$store.dispatch('user/refreshRoutes')
    },

    /**
     * 检查当前用户是否拥有菜单或按钮权限
     *
     * @param permValue
     * @returns {boolean}
     */
    hasPerm(permValue) {
      return hasPerm(permValue)
    },

    /**
     * el-table-column 组件的 formatter参数对应的 日期时间格式转换器
     *
     * @param row 行数据
     * @param column 列信息
     * @param cellValue 单元格的值
     * @returns {string} 转换后的字符串格式的日期时间
     */
    tableColumnDateTimeFormatter(row, column, cellValue) {
      return this.$luxon(cellValue)
    },

    /**
     * el-table-column 组件的 formatter参数对应的 国家地区代码格式转换器
     *
     * @param row 行数据
     * @param column 列信息
     * @param cellValue 单元格的值
     * @returns {string} 转换后的字符串格式的国家或地区名称
     */
    countryEnumFormatter(row, column, cellValue) {
      return this.countryOptions.find(option => option.value === cellValue).label
    },

    /**
     * 从后台 FlatQuery查询得到的 key-value扁平对象中获取ID字段的值
     *
     * @param flatQueryObj {Object} FlatQuery扁平对象
     * @returns {number} ID字段的值
     */
    getIdValueOfFlatQueryObj(flatQueryObj) {
      const suffixOfIdKey = this.DELIMITER_BETWEEN_TABLE_AND_FIELD + 'id'
      const flatIdKey = Object.keys(flatQueryObj).find((key) =>
        key.endsWith(suffixOfIdKey)
      )
      if (!flatIdKey) {
        console.error('flatIdKey is not valid')
      }
      return flatQueryObj[flatIdKey]
    },

    /**
     * 点击按钮后强制失去焦点
     *
     * @param event {object} 点击按钮事件
     */
    blurTargetButton(event) {
      if (event) {
        let target = event.target
        if (target.nodeName === 'SPAN' || target.nodeName === 'I') {
          target = target.parentNode
        }
        target.blur()
      }
    },

    /**
     * el-table-column 组件的 formatter参数对应的 JOQQ查询结果的枚举类型 数据转换器
     *
     * @param row 行数据
     * @param column 列信息
     * @param cellValue 单元格的值
     * @returns {string} 转换后的枚举字段名称
     */
    jooqEnumValueFormatter(row, column, cellValue) {
      return this.translateJooqEnumValue(cellValue)
    },

    /**
     * 翻译JOQQ查询结果的枚举类型数据（根据后台生成的枚举类型 Enum-Label-to-Name-Map）
     *
     * @param value JOOQ查询结果的枚举类型数据
     * @returns {*}
     */
    translateJooqEnumValue(value) {
      if (value.indexOf('_#_') > 0) {
        let enumName, fieldValue
        ;[enumName, fieldValue] = value.split('_#_', 2)
        const items = this.enumLabelNameMap[enumName]
        if (items && items.length > 0) {
          const foundItem = items.find((item) => item['label'] === fieldValue)
          if (foundItem && foundItem['name']) {
            return foundItem['name']
          }
        }
      }
      return value
    },

    // resolveDialogWidth(widthInDesktop, widthInMobile = '95%') {
    //   return window.innerWidth > 1200 ? widthInDesktop : widthInMobile
    // },
    //
    // resolveDialogMarginTop(mobileMarginTop, desktopMarginTop = '15vh') {
    //   return window.innerWidth < 1200 ? mobileMarginTop : desktopMarginTop
    // }
  },
}
