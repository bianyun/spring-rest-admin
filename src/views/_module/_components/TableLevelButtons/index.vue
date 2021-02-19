<template>
  <div class="table-level-buttons" v-if="hasPermAdd && hasPermBatchDelete">
    <el-button type="success" class="filter-item" icon="el-icon-plus"
               v-if="hasPermAdd" size="small" @click="addBtnClickHandler">
      添加
    </el-button>
    <el-button type="danger" class="filter-item" icon="el-icon-delete" size="small" @click="batchDeleteBtnClickHandler($event)"
               v-if="hasPermBatchDelete" :disabled="multipleSelectionArray.length === 0">
      删除
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'TableLevelButtons',
  props: {
    hasPermAdd: {
      type: Boolean,
      required: true
    },
    addBtnClickHandler: {
      type: Function,
      required: true
    },
    hasPermBatchDelete: {
      type: Boolean,
      required: true
    },
    multipleSelectionArray: {
      type: Array,
      required: true
    },
    batchDeleteBtnClickHandler: {
      type: Function,
      required: true
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.table-level-buttons {
  float: right;
  button {
    display: inline-block;
    vertical-align: middle;

    @media #{$sm-down} {
      margin-top: -45px;
    }
  }
}
</style>
