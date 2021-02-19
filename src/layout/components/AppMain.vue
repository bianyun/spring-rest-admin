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
  min-height: calc(100vh - #{$navBarHeight} - 80px);
  width: 100%;
  position: relative;
  overflow: hidden;
  @media #{$lg-down} {
    padding-bottom: 20px;
  }
}

.fixed-header+.app-main {
  padding-top: $navBarHeight;
}

.hasTagsView {
  .app-main {
    min-height: calc(100vh - #{$navBarHeight + $tagsViewHeight});
  }

  .fixed-header+.app-main {
    padding-top: $navBarHeight + $tagsViewHeight;
  }
}

.hasPageFooter {
  .app-main {
    min-height: calc(100vh - #{$navBarHeight + $pageFooterHeight});

    @media #{$lg-down} {
      padding-bottom: $pageFooterHeight + 15px;
    }
  }
}

.hasTagsView.hasPageFooter {
  .app-main {
    min-height: calc(100vh - #{$navBarHeight + $tagsViewHeight + $pageFooterHeight});
  }
}

</style>
