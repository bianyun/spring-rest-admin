<template>
  <el-input v-if="isFieldMultiColumns" :placeholder="label" class="filter-item" size="small" :clearable="true"
            :style=style :or-names="field" op="contains" v-model="inputValue" @clear="$emit('clear')"></el-input>
  <el-input v-else :placeholder="label" class="filter-item" size="small" :clearable="true"
            :style=style :name="field" op="contains"  v-model="inputValue" @clear="$emit('clear')"></el-input>
</template>

<script>
import baseMixin from '@/views/_module/_mixins/base-mixin'
export default {
  name: 'FilterItemInput',
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
      inputValue: null
    }
  },
  computed: {
    isFieldMultiColumns: function() {
      return this.field.indexOf(",") !== -1;
    },
    style() {
      let style = {};
      style.width = this.isMobile ? '100%' : this.width + 'px'
      return style;
    }
  },
}

</script>

