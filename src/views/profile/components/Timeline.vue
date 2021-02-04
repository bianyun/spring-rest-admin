<template>
  <div class="block">
    <el-timeline>
      <el-timeline-item v-for="(item,index) of timeline" :key="index" :timestamp="item.timestamp" placement="top">
        <el-card>
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
export default {
  data() {
    return {
      timeline: [
        {
          timestamp: '2021/2/4',
          title: '优化演示模式下的标签(演示用户)在移动端页面的显示',
          content: 'Sheldon committed 2021/2/4 6:56'
        },
        {
          timestamp: '2021/2/3',
          title: '增加演示模式支持',
          content: 'Sheldon committed 2021/2/3 22:26'
        },
        {
          timestamp: '2021/2/3',
          title: '去除地址栏不必要的首页跳转信息',
          content: 'Sheldon committed 2021/2/3 14:43'
        },
        {
          timestamp: '2021/2/3',
          title: '修复当不开启页脚显示时登录页底部出现白边的bug',
          content: 'Sheldon committed 2021/2/3 1:42'
        },
        {
          timestamp: '2021/2/3',
          title: '修复当不开启页脚显示时登录页底部出现白边的bug',
          content: 'Sheldon committed 2021/2/3 1:42'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep  .el-timeline-item__content {
  .el-card__body {
    padding-top: 0;
    padding-bottom: 0;
    h4 {
      margin-top: 10px;
      margin-bottom: 10px;
    }
  }
}
</style>
