<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const goHome = () => {
  router.push('/login');
};
</script>

<template>
  <div class="exception">
    <img src="../assets/images/404.png" />
    <el-button @click="goHome" class="btn-home" type="danger">回登录页</el-button>
  </div>
</template>

<style lang="scss">
.exception {
  height: 100%;
  position: relative;

  img {
    width: 100%;
    height: 100vh;
  }

  .btn-home {
    width: 200px;
    height: 50px;
    font-size: 26px;
    border-radius: 20px;
    position: fixed;
    bottom: 200px;
    left: 50%;
    margin-left: -100px;
  }
}
</style>