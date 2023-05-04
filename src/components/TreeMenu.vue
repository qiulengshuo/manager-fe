<script setup>
import { Document, Setting } from '@element-plus/icons-vue';
defineProps(['userMenu']);
</script>

<template>
  <template v-for="menu in userMenu" :key="menu._id">
    <el-sub-menu v-if="menu.children && menu.children.length > 0 && menu.children[0].menuType == 1" :key="menu._id"
      :index="menu.path">
      <template #title>
        <el-icon>
          <Setting v-if="Math.random() > 0.5" />
          <Document v-else />
        </el-icon>
        <span>{{ menu.menuName }}</span>
      </template>
      <TreeMenu :userMenu="menu.children" />
    </el-sub-menu>
    <el-menu-item v-else-if="menu.menuType == 1" :index="menu.path" :key="menu._id + 1">
      {{ menu.menuName }}
    </el-menu-item>
  </template>
</template>

<style lang="scss" scoped></style>