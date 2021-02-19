<template>
  <el-button v-if="visible" @click="clickHandler(rowData, $event)" size="mini" :type="buttonType" plain>
    <i v-if="icon" :class="'el-icon-' + icon" /> {{label}}
  </el-button>
</template>

<script>
export default {
  name: 'NormalButtonItem',
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
      type: String
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
