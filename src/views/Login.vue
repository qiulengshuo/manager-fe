<script setup>
import { ref } from 'vue';
import { User, Lock } from '@element-plus/icons-vue';
import { useUserInfoStore } from '../store';
import { useRouter } from 'vue-router';
import API from '../api';

const router = useRouter();
const userInfoStore = useUserInfoStore();

const user = ref({
  userName: 'admin',
  userPwd: '123456'
});

const userForm = ref();

const rules = {
  userName: [
    {
      required: true, message: "请输入用户名", trigger: "blur"
    }
  ],
  userPwd: [
    {
      required: true, message: "请输入密码", trigger: "blur"
    }
  ]
};

const login = () => {
  userForm.value.validate((valid) => {
    if (valid) {
      API.login(user.value).then(async (res) => {
        userInfoStore.saveUserInfo(res);
        router.push('/welcome');
      });
    } else {
      return false;
    }
  });
};

</script>

<template>
  <div class="login-wrapper">
    <div class="modal">
      <el-form ref="userForm" :model="user" status-icon :rules="rules">
        <div class="title">火星</div>
        <el-form-item prop="userName">
          <el-input type="text" :prefix-icon="User" v-model="user.userName" />
        </el-form-item>
        <el-form-item prop="userPwd">
          <el-input type="password" :prefix-icon="Lock" v-model="user.userPwd" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn-login" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fcff;
  width: 100vw;
  height: 100vh;

  .modal {
    width: 500px;
    padding: 50px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0px 0px 10px 3px #c7c9cb4d;

    .title {
      font-size: 50px;
      line-height: 1.5;
      text-align: center;
      margin-bottom: 30px;
    }

    .btn-login {
      width: 100%;
    }
  }
}
</style>