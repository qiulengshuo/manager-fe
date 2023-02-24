<script setup>
import { ArrowRight } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
const route = useRoute();
const breadList = computed(() => {
  return route.matched;
});
</script>

<template>
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item v-for="(item, index) in breadList" :key="item.path" :to="index === 0 ? '/welcome' : ''">
      {{ item.meta.title }}
    </el-breadcrumb-item>
</el-breadcrumb>
</template>


<style lang="scss" scoped></style>