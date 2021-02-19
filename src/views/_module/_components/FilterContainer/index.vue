<template>
  <div id="filter-container" class="filter-container">
    <template v-for="item in filterItems">
      <template v-if="item.type === 'input'">
        <filter-item-input :key="item.field" :label="item.label" :width="item.width" :field="resolveField(item.field)"
                           @clear="handleClear" @keyup.enter.native="handleEnter"></filter-item-input>
      </template>
      <template v-if="item.type === 'select'">
        <filter-item-select :key="item.field" :label="item.label" :width="item.width" :field="resolveField(item.field)"
                            :options="item.optionsFunc()" :option-label-prop="item.optionLabelProp"
                            :option-value-prop="item.optionValueProp" @clear="handleClear"></filter-item-select>
      </template>
      <template v-if="item.type === 'date-range'">
        <filter-item-date-range :key="item.field" :label="item.label" :field="resolveField(item.field)"
                                @clear="handleClear" @keyup.enter.native="handleEnter"></filter-item-date-range>
      </template>
      <template v-if="item.type === 'year-month-range'">
        <filter-item-year-month-range :key="item.field" :label="item.label" :field="resolveField(item.field)"
                                @clear="handleClear" @keyup.enter.native="handleEnter"></filter-item-year-month-range>
      </template>
    </template>
    <el-button type="primary" :style="searchBtnStyle" class="filter-item" size="small" icon="el-icon-search" @click="dataQueryFunc(1)">搜索</el-button>
  </div>
</template>

<script>
import FilterItemInput from '@/views/_module/_components/FilterContainer/items/FilterItemInput'
import FilterItemSelect from '@/views/_module/_components/FilterContainer/items/FilterItemSelect'
import baseMixin from '@/views/_module/_mixins/base-mixin'
import FilterItemDateRange from '@/views/_module/_components/FilterContainer/items/FilterItemDateRange'
import FilterItemYearMonthRange from '@/views/_module/_components/FilterContainer/items/FilterItemYearMonthRange'

export default {
  name: 'FilterContainer',
  mixins: [baseMixin],
  components: { FilterItemDateRange, FilterItemYearMonthRange, FilterItemInput, FilterItemSelect},
  props: {
    dataQueryFunc: {
      type: Function,
      required: true
    },
    flatTablePrfix: {
      type: String,
      required: true
    },
    filterItems: {
      type: Array,
      required: true
    },
    noTableLevelButtons: {
      type: Boolean,
      required: true
    }
  },
  data() {
    const enterEventName = 'keydown.enter.native.stop.capture'
    return {
      enterEvent: 'keydown.enter.native.stop.capture',
      enterEventName
    }
  },
  computed: {
    searchBtnStyle() {
      const style = {}
      if (this.noTableLevelButtons && this.isMobile) {
        style.marginBottom = '10px'
        style.width = '100%'
      }
      return style
    }
  },
  methods: {
    handleClear() {
      this.$nextTick(() => this.dataQueryFunc(1))
    },
    handleEnter() {
      this.dataQueryFunc(1)
    },
    resolveField(field) {
      if (field.indexOf(',') > -1) {
        return field.split(/\s*,\s*/).map(item => this.resolveField(item)).join(',')
      } else {
        return field.indexOf(this.DELIMITER_BETWEEN_TABLE_AND_FIELD) === -1 ? this.flatTablePrfix + field : field
      }
    },
  }
}

</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.filter-container {
  float: left;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
    margin-right: 7px;
  }

  @media #{$sm-down} {
    .el-button.filter-item {
      margin-bottom: 0;
    }
  }
}

#filter-container+.el-table {

}
</style>
