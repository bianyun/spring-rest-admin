<template>
  <div class="footer" v-if="showFooter">
    <span v-if="copyRightAvailable" class="copyright">&copy; {{yearInfo}} <a :href="copyrightLink" target="_blank">{{copyrightLabel}}</a>
      <span v-if="isEnvDev" style="margin-left: 10px">[dpr = {{devicePixelRatio}}]</span>
    </span>
    <a v-if="policeBeianInfo" class="police-beian"
       :href="`http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${policeBeianNo}`" target="_blank">
      <img :src="policeBeianIcon" height="13" width="13" alt="police_beian_icon">
      {{policeBeianInfo}}
    </a>
    <a v-if="icpBeianInfo" class="icp-beian" href="https://beian.miit.gov.cn/" target="_blank">{{icpBeianInfo}}</a>
  </div>
</template>

<script>
import policeBeianIcon from '@/assets/image/police-beian-icon.png'

export default {
  data() {
    return  {
      policeBeianIcon,
      docmHeight: 0,
      showFooter: true,
      copyrightParamRegex: "(\\d{4})\\s+(https?://[a-zA-Z0-9.-]+(/[a-zA-Z0-9.-]*)*)\\s+(\\S+)",
      startYear: null,
      thisYear: new Date().getFullYear(),
      yearInfo: null,
      copyrightLink: null,
      copyrightLabel: null,
      policeBeianInfoRegex: "[^\\d]+(\\d+)[^\\d]+",
    }
  },
  created() {
    if (this.copyRightAvailable) {
      const result = process.env.VUE_APP_FOOTER_INFO_COPYRIGHT.match(this.copyrightParamRegex)
      this.startYear = parseInt(result[1])
      this.copyrightLink = result[2]
      this.copyrightLabel = result [4]
      if (this.startYear < this.thisYear) {
        this.yearInfo = `${this.startYear}-${this.thisYear}`
      } else {
        this.yearInfo = `${this.startYear}`
      }
    }
  },
  mounted() {
    this.docmHeight = document.documentElement.clientHeight;
    window.onresize = () => {
      return (() => {
        let showHeight = document.body.clientHeight;
        this.showFooter = this.docmHeight <= showHeight;
      })();
    };
  },
  computed: {
    copyRightAvailable() {
      return process.env.VUE_APP_FOOTER_INFO_COPYRIGHT &&
          process.env.VUE_APP_FOOTER_INFO_COPYRIGHT.match(this.copyrightParamRegex)
    },
    icpBeianInfo() {
      return process.env.VUE_APP_FOOTER_INFO_ICP_BEIAN
    },
    policeBeianInfo() {
      return process.env.VUE_APP_FOOTER_INFO_POLICE_BEIAN
    },
    policeBeianNo() {
      if (this.policeBeianInfo) {
        const result = this.policeBeianInfo.match(this.policeBeianInfoRegex)
        return result[1]
      } else {
        return null
      }
    },
    isEnvDev() {
      return process.env.NODE_ENV === 'development'
    },
    devicePixelRatio() {
      const ratio = window.devicePixelRatio
      if (ratio) {
        return ratio.toFixed(2)
      } else {
        return 'NAN'
      }
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
  letter-spacing: .2px;

  a:hover {
    color: #409EFF;
  }

  .copyright {
    margin-right: 1rem;

    @media screen and (max-width: 1200px) {
      display: block;
      margin-bottom: 5px;
    }
  }

  .icp-beian {
    margin-left: 10px;
  }

  .police-beian {
    margin-left: 5px;
    img {
      margin-bottom: -1px;
    }
  }
}
</style>
