<template>
  <div class="footer">
    <span v-if="copyRightAvailable" style="margin-right: 1rem">&copy; {{yearInfo}} <a :href="copyrightLink">{{copyrightLabel}}</a></span>
    <a v-if="beianInfo" href="https://beian.miit.gov.cn/" target="_blank">{{beianInfo}}</a>
  </div>
</template>

<script>

export default {
  data() {
    return  {
      copyrightParamRegex: "(\\d{4})\\s+(https?://[a-zA-Z.-0-9]+)\\s+(\\S+)",
      startYear: null,
      thisYear: new Date().getFullYear(),
      yearInfo: null,
      copyrightLink: null,
      copyrightLabel: null,
    }
  },
  created() {
    if (this.copyRightAvailable) {
      const result = process.env.VUE_APP_FOOTER_INFO_COPYRIGHT.match(this.copyrightParamRegex)
      this.startYear = parseInt(result[1])
      this.copyrightLink = result[2]
      this.copyrightLabel = result [3]
      if (this.startYear < this.thisYear) {
        this.yearInfo = `${this.startYear}-${this.thisYear}`
      } else {
        this.yearInfo = `${this.startYear}`
      }
    }
  },
  computed: {
    copyRightAvailable() {
      return process.env.VUE_APP_FOOTER_INFO_COPYRIGHT &&
          process.env.VUE_APP_FOOTER_INFO_COPYRIGHT.match(this.copyrightParamRegex)
    },
    beianInfo() {
      return process.env.VUE_APP_FOOTER_INFO_BEIAN
    },
  },

}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.footer {
  color: #5a5e66;
  position: absolute;
  vertical-align: middle;
  text-align: center;
  width: 100%;
  bottom: 1.5rem;
  font-size: 1.2rem;
  letter-spacing: 1px;

  a:hover {
    color: #409EFF;
  }
}
</style>
