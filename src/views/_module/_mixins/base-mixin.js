import { hasPerm } from '@/utils/permission'
import { ENUM_CLASS_NAME_GENDER } from '@/utils/consts'
import { miscApi } from '@/api/_system/misc'
import CountryOptions from '@/utils/consts/country-options'
import { convertCentsToYuan, resolveDialogMarginTop, resolveDynamicRatioWidth } from '@/utils/helper'
import { mapState } from 'vuex'

export default {
  name: 'baseMixin',
  data() {
    return {
      ENUM_CLASS_NAME_GENDER,
      DELIMITER_BETWEEN_TABLE_AND_FIELD: '__',

      enumLabelNameMap: null,
      countryOptions: CountryOptions,
    }
  },
  computed: {
    genderOptions() {
      if (this.enumLabelNameMap) {
        return this.enumLabelNameMap[this.ENUM_CLASS_NAME_GENDER]
      } else {
        return []
      }
    },
    ...mapState({
      device: state => state.app.device
    }),
    isMobile() {
      return this.device === 'mobile'
    },
  },
  async created() {
    this.enumLabelNameMap = await miscApi.getEnumLabelNameMap()
  },
  methods: {
    resolveDynamicRatioWidth,
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
     * el-table-column 组件的 formatter参数对应的 金额分到元的转换器
     *
     * @param row 行数据
     * @param column 列信息
     * @param cellValue 单元格的值
     * @returns {String} 金额由单位分转换为单位元后的值
     */
    moneyCentsToYuanFormatter(row, column, cellValue) {
      return '￥' + convertCentsToYuan(cellValue)
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
        [enumName, fieldValue] = value.split('_#_', 2)
        const items = this.enumLabelNameMap[enumName]
        if (items && items.length > 0) {
          const foundItem = items.find((item) => item['name'] === fieldValue)
          if (foundItem && foundItem['label']) {
            return foundItem['label']
          }
        }
      }
      return value
    },
  },
}
