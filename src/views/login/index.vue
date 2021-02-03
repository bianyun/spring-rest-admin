<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="rules" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h2 class="title site-title">Spring-Rest 演示项目</h2>
        <h3 class="title login-title sparse">系统登录</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
<!--        <el-input-->
<!--          ref="username"-->
<!--          v-model.trim="loginForm.username"-->
<!--          placeholder="用户名"-->
<!--          name="username"-->
<!--          type="text"-->
<!--          tabindex="1"-->
<!--          autocomplete="on"-->
<!--          @keyup.enter.native="handleLogin"-->
<!--        />-->
        <el-select ref="username" v-model="loginForm.username" filterable @blur="selectBlur"
                   :clearable="true" placeholder="请选择内置演示用户 或 输入新的用户名">
          <el-option
            v-for="item in usernameOptions"
            :key="item.value"
            :label="item.value"
            :value="item.value">
            <span style="float: left; font-family: Consolas,monospace">{{ item.value }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px;">{{ item.label }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="注意：大写锁定已开启！" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model.trim="loginForm.password"
            :type="passwordType"
            placeholder="密码"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登录</el-button>

<!--      <div style="position:relative;">-->
<!--        <div class="tips">-->
<!--          <span>账号 : admin</span>-->
<!--          <span>密码 : 111111</span>-->
<!--        </div>-->
<!--        <div class="tips">-->
<!--          <span style="margin-right:26px;">账号 : user</span>-->
<!--          <span>密码 : 111111</span>-->
<!--        </div>-->

<!--        <el-button class="thirdparty-button" type="primary" @click="showDialog=true">-->
<!--          第三方登录-->
<!--        </el-button>-->
<!--      </div>-->
    </el-form>

    <el-dialog title="Or connect with" :visible.sync="showDialog">
      Can not be simulated on local, so please combine you own business simulation! ! !
      <br>
      <br>
      <br>
<!--      <social-sign />-->
    </el-dialog>

    <page-footer />
  </div>
</template>

<script>
// import SocialSign from './components/SocialSignin'
import { PageFooter } from '@/layout/components'

export default {
  name: 'Login',
  components: { PageFooter },
  data() {
    return {
      usernameOptions: [
        { label: '超级管理员', value: 'superadmin' },
        { label: '管理员', value: 'admin' },
        { label: '操作员', value: 'user' },
        { label: '游客', value: 'luxf' },
      ],
      loginForm: {
        username: '',
        password: '111111'
      },
      rules: {
        username: [
          { required: true, trigger: 'change', message: '请输入用户名' },
        ],
        password: [
          { required: true, trigger: 'change', message: '请输入密码' },
        ],
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    // if (this.loginForm.username === '') {
    //   this.$refs.username.focus()
    // } else if (this.loginForm.password === '') {
    //   this.$refs.password.focus()
    // }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock(event) {
      this.capsTooltip = event.getModifierState && event.getModifierState('CapsLock')
    },
    selectBlur(e) {
      this.loginForm.username = e.target.value
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return false

        this.loading = true
        this.$store.dispatch('user/login', this.loginForm)
          .then(() => {
            this.$router.push({ path: this.redirect || '/', query: this.otherQuery }).catch(() => {})
            this.loading = false
          })
          .catch(() => {
            this.loading = false
          })

      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-select {
    position: absolute;
    right: 0;
    width: 93%;
    .el-input {
      width: 100%;
    }
  }
  .el-input {
    display: inline-block;
    height: 47px;
    width: 75%;

    input {
      background: transparent;
      border: 0;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
    margin-bottom: 22px;

    .el-form-item__error {
      font-size: 13px;
    }
  }
}
</style>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100vh;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .login-title {
      font-size: 3rem;
    }
    .site-title {
      font-size: 3.5rem;
    }
    .title {
      color: #F2F2F2;
      margin: 0 auto 40px auto;
      text-align: center;
      font-weight: bolder;
    }

    .sparse {
      letter-spacing: 3px;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }

  .footer {
    color: #c9cbd0;
  }
}
</style>
