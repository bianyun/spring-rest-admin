<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.app-main {
  min-height: calc(100vh - #{$navBarHeight});
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header+.app-main {
  padding-top: $navBarHeight;
}

.hasTagsView {
  .app-main {
    min-height: calc(100% - #{$navBarHeight + $tagsViewHeight});
  }

  .fixed-header+.app-main {
    padding-top: $navBarHeight + $tagsViewHeight;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
//.el-popup-parent--hidden {
//  .fixed-header {
//    padding-right: 15px;
//  }
//}
</style>
