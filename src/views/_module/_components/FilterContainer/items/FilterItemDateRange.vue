<template>
  <div class="date-range-picker filter-item" :id="field">
    <el-date-picker
        class="start-date"
        :editable="false"
        v-model="startDate"
        type="date"
        @change="handleChange"
        :placeholder="'起始' + label"
        :picker-options="startPickerOptions"
        size="small">
    </el-date-picker>
    <span class="date-range-separator">-</span>
    <el-date-picker
        class="end-date"
        align="right"
        :editable="false"
        v-model="endDate"
        type="date"
        @change="handleChange"
        :placeholder="'结束' + label"
        :picker-options="endPickerOptions"
        size="small">
    </el-date-picker>
  </div>
</template>

<script>
export default {
  name: 'FilterItemDateRange',
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
      startDate: null,
      endDate: null,
      startPickerOptions: {
        disabledDate: date => {
          return this.endDate && date > this.endDate
        }
      },
      endPickerOptions: {
        disabledDate: date => {
          return this.startDate && date < this.startDate
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

.filter-item.date-range-picker {
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

