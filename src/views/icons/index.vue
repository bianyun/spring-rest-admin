<template>
  <div class="icons-container">
    <el-tabs type="border-card">
      <el-tab-pane>
        <span class="header" slot="label"><i class="el-icon-platform-eleme" /> 饿了么图标</span>
        <div class="grid">
          <div v-for="item of elementIcons" :key="item" @click="handleClipboard(generateElementIconCode(item),$event)">
            <el-tooltip placement="top">
              <div slot="content">
                {{ generateElementIconCode(item) }}
              </div>
              <div class="icon-item">
                <i :class="'el-icon-' + item" />
                <span class="icon">{{ item }}</span>
              </div>
            </el-tooltip>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane>
        <span class="header" slot="label"><svg-icon icon-class="icon" /> SVG 图标</span>
        <div class="grid">
          <div v-for="item of svgIcons" :key="item" @click="handleClipboard(generateSvgIconCode(item),$event)">
            <el-tooltip placement="top">
              <div slot="content">
                {{ generateSvgIconCode(item) }}
              </div>
              <div class="icon-item">
                <svg-icon :icon-class="item" class-name="disabled" />
                <span class="icon">{{ item }}</span>
              </div>
            </el-tooltip>
          </div>
        </div>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script>
import clipboard from '@/utils/clipboard'
import svgIcons from './svg-icons'
import elementIcons from './element-icons'

export default {
  name: 'Icons',
  data() {
    return {
      svgIcons,
      elementIcons
    }
  },
  methods: {
    generateSvgIconCode(symbol) {
      return `<svg-icon icon-class="${symbol}" />`
    },
    generateElementIconCode(symbol) {
      return `<i class="el-icon-${symbol}" />`
    },
    handleClipboard(text, event) {
      clipboard(text, event)
    }
  }
}
</script>

<style lang="scss" scoped>
.icons-container {
  margin: 10px 20px 0;
  overflow: hidden;

  .grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .icon-item {
    margin: 20px;
    height: 85px;
    text-align: center;
    width: 100px;
    float: left;
    font-size: 30px;
    color: #24292e;
    cursor: pointer;
  }

  span.icon {
    display: block;
    font-size: 16px;
    margin-top: 10px;
  }

  span.header {
    font-size: 15px;
  }

  .disabled {
    pointer-events: none;
  }
}
</style>
