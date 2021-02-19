import store from '@/store'
import variables from '@/styles/variables.scss'
import { parseIntValueFromPixelsStr } from '@/utils/helper'

const SCREEN_XS_MAX_WIDTH = parseIntValueFromPixelsStr(variables['screenXsMaxWidth'])

export default {
  watch: {
    $route(route) {
      if (this.device === 'mobile' && this.sidebar.opened) {
        store.dispatch('app/closeSideBar', { withoutAnimation: false }).then()
      }
    }
  },
  beforeMount() {
    window.addEventListener('resize', this.$_resizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.$_resizeHandler)
  },
  mounted() {
    const isMobile = this.$_isMobile()
    if (isMobile) {
      store.dispatch('app/toggleDevice', 'mobile').then()
      store.dispatch('app/closeSideBar', { withoutAnimation: true }).then()
    }
  },
  methods: {
    // use $_ for mixins properties
    // https://vuejs.org/v2/style-guide/index.html#Private-property-names-essential
    $_isMobile() {
      return window.innerWidth <= SCREEN_XS_MAX_WIDTH
    },
    $_resizeHandler() {
      if (!document.hidden) {
        const isMobile = this.$_isMobile()
        store.dispatch('app/toggleDevice', isMobile ? 'mobile' : 'desktop').then()

        if (isMobile) {
          store.dispatch('app/closeSideBar', { withoutAnimation: true }).then()
        }
      }
    }
  }
}
