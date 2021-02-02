<template>
  <el-row>
    <el-col>
      <div class="dashboard-editor-container">
        <div class=" clearfix">
          <div class="pan-item">
            <div class="pan-info"></div>
            <img class="pan-thumb" :src="avatar" alt="avatar">
          </div>

          <span class="user-info">
          {{ nickname }}
          </span>
          <div class="user-roles">
            <span><el-tag type="danger" size="mini" effect="dark" v-for="role in roles" :key="role.name">
              {{ role.name }}
            </el-tag></span>
          </div>
          <div class="perm-info">
            <div class="perm-list">
              <span class="perm-list-title">菜单权限：</span>
              <el-tag class="perm-list-tag" effect="plain" type="success">所有菜单权限</el-tag>
            </div>
            <div class="perm-list">
              <span class="perm-list-title">按钮权限：</span>
              <el-tag class="perm-list-tag" effect="plain" type="warning">所有按钮权限</el-tag>
            </div>
            <div class="perm-list">
              <span class="perm-list-title">接口权限：</span>
              <el-tag class="perm-list-tag" effect="plain" type="primary">所有接口权限</el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>


<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  data() {
    return {}
  },
  computed: {
    ...mapGetters([
      'username',
      'nickname',
      'avatar',
      'roles',
    ]),
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

.pan-info {
  position: absolute;
  width: inherit;
  height: inherit;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: inset 0 0 0 5px rgba(0, 0, 0, 0.05);
}

.pan-item {
  @media screen and (min-width: 1200px) {
    float: left;
    z-index: 1;
  }
  @media screen and (max-width: 1200px) {
    display: block;
    margin-left: calc(50% - 7.5rem);
  }
  width: 15rem;
  height: 15rem;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  cursor: default;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.pan-thumb {
  width: 100%;
  height: 100%;
  background-size: 100%;
  border-radius: 50%;
  overflow: hidden;
  position: absolute;
  transform-origin: 95% 40%;
  transition: all 0.3s ease-in-out;
}

.emptyGif {
  display: block;
  width: 45%;
  margin: 0 auto;
}

.dashboard-editor-container {
  background-color: #F2F6FC;
  @media screen and (min-width: 1200px) {
    min-height: 88vh;
  }
  @media screen and (max-width: 1200px) {
    min-height: 85vh;
  }
  padding: 5rem 5rem 0;
}

.user-info {
  @media screen and (min-width: 1200px) {
    margin-left: 5rem;
    font-size: 4rem;
    line-height: 10rem;
  }
  @media screen and (max-width: 1200px) {
    margin-top: 2rem;
    margin-bottom: 1rem;
    display: block;
    font-size: 3.5rem;
    text-align: center;
  }
  color: #212121;
}

.user-roles {
  @media screen and (min-width: 1200px) {
    display: inline;
  }
  @media screen and (max-width: 1200px) {
    margin-bottom: 10px;
    width: 100%;
    display: flex;
    display: -webkit-flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    align-content: center;
  }

  .el-tag {
    margin-right: 5px;
  }
}

.perm-info {
  @media screen and (min-width: 1200px) {
    margin-left: 20rem;
  }
  @media screen and (max-width: 1200px) {
    margin-top: 1rem;
    margin-left: calc(50% - 9.7rem);
    font-size: 2.5rem;
  }
  position: relative;
  height: 100px;
}

.perm-list {
  line-height: 4rem;
  padding-top: 1.5rem;

  .perm-list-title {
    font-size: 2rem;
    display: inline-block;
  }
}

</style>
