<template>
  <el-table-column v-if="showActionColumn" label="操作" align="center" :width="width"
                   class-name="small-padding fixed-width">
    <template slot-scope="{row}">
      <template v-for="item in operationItems">
        <circle-button-item
            v-if="item.shape === 'circle'"
            :key="item.label"
            :label="item.label"
            :button-type="item.buttonType"
            :icon="item.icon"
            :visible="item.visibleFunc(row)"
            :click-handler="item.clickHandler"
            :row-data="row"
        ></circle-button-item>
        <normal-button-item
            v-if="item.shape === 'normal'"
            :key="item.label"
            :label="item.label"
            :button-type="item.buttonType"
            :icon="item.icon"
            :visible="item.visibleFunc(row)"
            :click-handler="item.clickHandler"
            :row-data="row"
        ></normal-button-item>
      </template>
    </template>
  </el-table-column>
</template>

<script>
import CircleButtonItem from '@/views/_module/_components/TableOperationColumn/CircleButtonItem'
import NormalButtonItem from '@/views/_module/_components/TableOperationColumn/NormalButtonItem'
export default {
  name: 'TableOperationColumn',
  components: { CircleButtonItem, NormalButtonItem },
  props: {
    showActionColumn: {
      type: Boolean,
      required: true
    },
    width: {
      type: Number,
      default: 200
    },
    operationItems: {
      type: Array,
      required: true
    },

  },
  computed: {

  }
}
</script>

<style lang="scss" scoped>

</style>
