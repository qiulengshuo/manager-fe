<script setup>

</script>

<template>
  <div class="welcome">
    <div class="content">
      <div class="sub-title">欢迎体验</div>
      <div class="title">学生质量评估后台管理系统</div>
      <div class="desc">- Vue3.0+ElementPlus+Node+MongoDB打造后台管理系统</div>
    </div>
    <div class="img"></div>
  </div>
</template>

<style lang="scss" scoped>
.welcome {
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  .content {
    position: relative;
    bottom: 40px;

    .sub-title {
      font-size: 30px;
      line-height: 42px;
      color: #333;
    }

    .title {
      font-size: 40px;
      line-height: 62px;
      color: #409eff;
    }

    .desc {
      text-align: right;
      font-size: 14px;
      color: #999;
    }
  }

  .img {
    margin-left: 105px;
    background-image: url('../assets/images/welcome.jpg');
    width: 371px;
    height: 438px;
  }
}
</style>