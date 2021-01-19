<template>
  <div class="dashboard-editor-container">
    <div class=" clearfix">
      <div class="pan-item" >
        <div class="pan-info"></div>
        <img class="pan-thumb" :src="avatar" alt="avatar">
      </div>
      <div class="info-container">
        <div class="user-info">
          {{ nickname }}
          <el-tag type="danger" size="mini" effect="dark" v-for="role in roles" :key="role.name">
            {{ role.name }}
          </el-tag>
        </div>
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
</template>


<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'Dashboard',
    data() {
      return {

      }
    },
    computed: {
      ...mapGetters([
        'username',
        'nickname',
        'avatar',
        'roles',
      ])
    }
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
    float: left;
    z-index: 1;
    width: 150px;
    height: 150px;
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
    min-height: 88vh;
    padding: 50px 50px 0;
    .pan-info-roles {
      font-size: 12px;
      font-weight: 700;
      color: #333;
      display: block;
    }
    .info-container {
      position: relative;
      margin-left: 190px;
      height: 80px;

      .user-info {
        font-size: 40px;
        line-height: 100px;
        color: #212121;
        padding-top: 15px;

        .el-tag {
          margin-right: 5px;
        }
      }

      .perm-list {
        line-height: 40px;
        padding-top: 15px;

        .perm-list-title {
          font-size: 20px;
          display: inline-block;
        }

        .perm-list-tag {
          margin-right: 5px;
        }
      }
    }
  }
</style>
