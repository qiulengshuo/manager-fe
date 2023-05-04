<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { Bell, Fold } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { useUserInfoStore } from '../store';
import TreeMenu from '../components/TreeMenu.vue';
import BreadCrumb from '../components/BreadCrumb.vue';
import API from '../api';

const router = useRouter();
const userInfoStore = useUserInfoStore();

const userInfo = userInfoStore.userInfo;

const handleLogout = (key) => {
  if (key === 'email') return;
  userInfoStore.saveUserInfo({});
  router.push('/login');
};

const isCollapse = ref(false);
const toggle = () => {
  isCollapse.value = !isCollapse.value;
};

const getNoticeCount = async () => {
  try {
    const count = await API.noticeCount();
    userInfoStore.saveNoticeCount(count)
  } catch (error) {
    console.error(error);
  }
};

const userMenu = ref([]);
const getMenuList = async () => {
  try {
    const { menuList, actionList } = await API.getPermissionList();
    userInfoStore.saveMenuList(menuList);
    userInfoStore.saveActionList(actionList);
    userMenu.value = menuList;
  } catch (error) {
    console.error(error);
  }
};

const activeMenu = ref(location.hash.slice(1));

onMounted(() => {
  getNoticeCount();
  getMenuList();
})

</script>

<template>
  <div class="basic-layout">
    <div :class="['nav-side', isCollapse ? 'fold' : 'unfold']">
      <!-- 系统LOGO -->
      <div class="logo">
        <img src="./../assets/images/logo.png">
        <span>Manager</span>
      </div>
      <!-- 导航菜单 -->
      <el-menu :default-active="activeMenu" background-color="#001529" text-color="#fff" router :collapse="isCollapse"
        class="nav-menu">
        <TreeMenu :userMenu="userMenu" />
      </el-menu>
    </div>
    <div :class="['content-right', isCollapse ? 'fold' : 'unfold']">
      <div class="nav-top">
        <div class="nav-left">
          <div class="menu-fold" @click="toggle">
            <el-icon>
              <Fold />
            </el-icon>
          </div>
          <BreadCrumb />
        </div>
        <div class="user-info">
          <!-- <el-badge @click="router.push('/audit/approve')" :is-dot="userInfoStore.noticeCount > 0 ? true : false" class="notice" type="danger">
            <el-icon>
              <Bell />
            </el-icon>
          </el-badge> -->
          <el-dropdown @command="handleLogout">
            <span class="user-link">
              {{ userInfo.userName }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="email">邮箱：{{ userInfo.userEmail }}</el-dropdown-item>
                <el-dropdown-item command="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="wrapper">
        <div class="main-page">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.basic-layout {
  position: relative;

  .nav-side {
    position: fixed;
    width: 200px;
    height: 100vh;
    background-color: #001529;
    color: #fff;
    overflow-x: hidden;
    overflow-y: auto;
    transition: width .5s;

    .logo {
      display: flex;
      align-items: center;
      font-size: 18px;
      height: 50px;

      img {
        margin: 0 16px;
        width: 32px;
        height: 32px;
      }
    }

    .nav-menu {
      height: calc(100vh - 50px);
      border-right: none;
    }

    // 合并
    &.fold {
      width: 64px;
    }

    // 展开
    &.unfold {
      width: 200px;
    }
  }

  .content-right {
    margin-left: 200px;

    // 合并
    &.fold {
      margin-left: 64px;
    }

    // 展开
    &.unfold {
      margin-left: 200px;
    }

    .nav-top {
      height: 50px;
      line-height: 50px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #ddd;
      padding: 0 28px;

      .nav-left {
        display: flex;
        align-items: center;

        .menu-fold {
          display: flex;
          align-items: center;
          margin-right: 15px;
          font-size: 18px;
        }
      }

      .user-info {
        display: flex;
        align-items: center;

        .notice {
          display: flex;
          align-items: center;
          line-height: 30px;
          margin-right: 15px;
          cursor: pointer;
        }

        .user-link {
          cursor: pointer;
          color: #409eff;
        }
      }
    }

    .wrapper {
      background: #eef0f3;
      padding: 20px;
      height: calc(100vh - 50px);

      .main-page {
        height: 100%;
      }
    }
  }
}
</style>
