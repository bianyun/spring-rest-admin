<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card id="main-card">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="Activity" name="activity">
                <activity />
              </el-tab-pane>
              <el-tab-pane label="Timeline" name="timeline">
                <timeline />
              </el-tab-pane>
              <el-tab-pane label="Account" name="account">
                <account :user="user" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import Activity from './components/Activity'
import Timeline from './components/Timeline'
import Account from './components/Account'

export default {
  name: 'Profile',
  components: { UserCard, Activity, Timeline, Account },
  data() {
    return {
      user: {},
      activeTab: 'activity'
    }
  },
  computed: {
    ...mapGetters([
      'username',
      'nickname',
      'realname',
      'avatar',
      'roles'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      this.user = {
        username: this.username,
        nickname: this.nickname,
        realname: this.realname,
        role: this.roles.map(role => role.name).join(' | '),
        email: 'admin@test.com',
        avatar: this.avatar
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#main-card.el-card {
  ::v-deep .el-card__body {
    padding-top: 15px;
    padding-bottom: 5px;
  }
}

.hasPageFooter #main-card.el-card {
  @media screen and (min-width: 1200px) {
    margin-bottom: 25px;
  }
  @media screen and (max-width: 1200px) {
    margin-bottom: -20px;
  }
}
</style>
