<template>
  <div class="year-month-range-picker filter-item" :id="field">
    <el-date-picker
        class="start-year-month"
        :editable="false"
        v-model="startYearMonth"
        type="month"
        @change="handleChange"
        :placeholder="'起始' + label"
        :picker-options="startPickerOptions"
        size="small">
    </el-date-picker>
    <span class="date-range-separator">-</span>
    <el-date-picker
        class="end-year-month"
        align="right"
        :editable="false"
        v-model="endYearMonth"
        type="month"
        @change="handleChange"
        :placeholder="'结束' + label"
        :picker-options="endPickerOptions"
        size="small">
    </el-date-picker>
  </div>
</template>

<script>
export default {
  name: 'FilterItemYearMonthRange',
  props: {
    label: {
      type: String,
      required: true
    },
    field: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      startYearMonth: null,
      endYearMonth: null,
      startPickerOptions: {
        disabledDate: current => {
          return this.endYearMonth && current > this.endYearMonth
        }
      },
      endPickerOptions: {
        disabledDate: current => {
          return this.startYearMonth && current < this.startYearMonth
        }
      },
    }
  },
  methods: {
    handleChange(value) {
      if (!value) {
        this.$emit('clear')
      }
    },
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.filter-item.year-month-range-picker {
  margin-right: 7px;
  width: 274px;
  @media #{$sm-down} {
    width: 100%;
  }

  .date-range-separator {
    margin-left: 5px;
    margin-right: 5px;
  }

  .el-date-editor.el-input {
    width: 130px;
    @media #{$sm-down} {
      width: calc(50% - 7px);
    }

    ::v-deep .el-input__inner {
      cursor: pointer;
      padding-right: 10px;
    }
  }
}
</style>

