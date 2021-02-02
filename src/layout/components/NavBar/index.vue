<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <error-log class="errLog-container right-menu-item hover-effect" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="全局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar + '?imageView2/1/w/80/h/80'" class="user-avatar" alt="avatar image">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item style="text-align: center; cursor: default" disabled>
            <span>{{ realname || nickname || username }}</span>
          </el-dropdown-item>
          <router-link to="/profile">
            <el-dropdown-item divided><i class="el-icon-user-solid" /> 个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item @click.native="dialogVisible = true">
            <span><svg-icon icon-class="password" /> 修改密码</span></el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <i style="font-weight: bold;" class="el-icon-switch-button" /> 退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 弹出窗口：修改密码 -->
    <el-dialog title="修改密码" :visible.sync="dialogVisible" :width="resolveDialogWidth()" top="20vh"
               @close="resetForm(diaglogFormName)" :close-on-click-modal="false" :modal-append-to-body='false'>
      <el-form :ref="diaglogFormName" status-icon :rules="rules" :model="tempFormModel" label-width="80px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input show-password v-model="tempFormModel.oldPassword"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input show-password v-model="tempFormModel.newPassword"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input show-password v-model="tempFormModel.confirmPassword"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(diaglogFormName)">确定</el-button>
      </div>
    </el-dialog>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import userApi from '@/api/_system/user'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    Search
  },
  data() {
    const validateNewPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入新密码'))

        if (this.tempFormModel.confirmPassword) {
          this.$refs[this.diaglogFormName].validateField('confirmPassword')
        }
      } else {
        if (this.tempFormModel.confirmPassword) {
          this.$refs[this.diaglogFormName].validateField('confirmPassword')
        }
        callback()
      }
    }

    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入密码'))
      } else if (this.tempFormModel.newPassword && value !== this.tempFormModel.newPassword) {
          callback(new Error('两次输入的密码不一致!'))
      } else {
        callback()
      }
    }

    return {
      dialogVisible: false,
      diaglogFormName: 'dataForm',
      tempFormModel: {
        oldPassword: null,
        newPassword: null,
        confirmPassword: null
      },
      rules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'change' },
          { max: 20, message: '原密码长度不能超过 20 位', trigger: 'change' },
        ],
        newPassword: [
          { min: 6, max: 20, message: '新密码长度必须为 6 到 20 位', trigger: 'change' },
          { validator: validateNewPassword, trigger: 'change' },
          { required: true, message: '请输入新密码', trigger: 'change' }
        ],
        confirmPassword: [
          { min: 6, max: 20, message: '新密码长度必须为 6 到 20 位', trigger: 'change' },
          { validator: validateConfirmPassword, trigger: 'change' },
          { required: true, message: '请再次输入新密码', trigger: 'change' }
        ],
      },
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device',
      'username',
      'realname',
      'nickname'
    ])
  },
  methods: {
    resolveDialogWidth() {
      return window.innerWidth > 1200 ? '25%' : '80%'
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    logout() {
      this.$store.dispatch('user/logout').then(() => this.$router.push('/login'))
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return false
        userApi.updatePasswordForCurrentUser(this.tempFormModel).then(() => {
          this.dialogVisible = false
          this.$notify.success('密码修改成功')
        })
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.navbar {
  height: $navBarHeight;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: $navBarHeight - (200px/$navBarHeight);
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: $navBarHeight;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: $rightMenuFontSize;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 20px;

      .avatar-wrapper {
        margin-top: calc(0.5*(#{$navBarHeight} - #{$userAvatarHeight}));
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: $userAvatarHeight;
          height: $userAvatarHeight;
          border-radius: $userAvatarBorderRadius;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: calc(#{$userAvatarHeight} - 12px);
          font-size: 12px;
        }
      }
    }
  }
}
</style>
