<template>
  <el-tooltip :hide-after="600" :enterable="false" :content="label" placement="top">
    <el-button @click="clickHandler(rowData, $event)" size="small" :type="buttonType" :icon="'el-icon-' + icon"
               v-if="visible" circle plain></el-button>
  </el-tooltip>
</template>

<script>
export default {
  name: 'CircleButtonItem',
  props: {
    label: {
      type: String,
      required: true
    },
    buttonType: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      required: true
    },
    rowData: {
      type: Object,
      required: true
    },
    clickHandler: {
      type: Function,
      required: true
    },
  },
}
</script>

<style lang="scss" scoped>

</style>
