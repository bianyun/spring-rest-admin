<template>
  <el-select :id="label" :style="style" v-model="selectedValue" class="filter-item" size="small" clearable op="="
             :placeholder="'请选择' + label" :name="field" @clear="$emit('clear')" @change="onSelectChange">
    <el-option
        v-for="option in options"
        :key="option[optionValueProp]"
        :label="option[optionLabelProp]"
        :value="option[optionValueProp]">
    </el-option>
  </el-select>
</template>

<script>
import baseMixin from '@/views/_module/_mixins/base-mixin'
export default {
  name: 'FilterItemSelect',
  mixins: [baseMixin],
  props: {
    label: {
      type: String,
      required: true
    },
    field: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    optionLabelProp: String,
    optionValueProp: String,
    width: {
      type: Number,
      default: 130,
      validator: function(value) {
        return value >= 100 && value <= 300
      },
    }
  },
  data() {
    return {
      selectedValue: null
    }
  },
  computed: {
    style() {
      let style = {};
      style.width = this.isMobile  ? '100%' : (this.width + 'px')
      return style;
    }
  },
  methods: {
    onSelectChange() {
      const innerInput = document.querySelector("#" + this.label)
      innerInput.setAttribute("selectedValue", this.selectedValue)

      const searchButton = document.querySelector('#filter-container button.el-button')
      this.$nextTick(() => searchButton.focus())
    },
  }
}

</script>

