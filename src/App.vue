<script setup>
import { useStore } from './store';
import { storeToRefs } from "pinia";
import request from './utils/request';
const store = useStore();
const { num } = storeToRefs(store);
const { increment } = store;

request.get('/login', { name: 'admin' }, { loading: true }).then((res) => {
  console.log(res);
});
</script>

<template>
  <div>Hello Vue! {{ num }}</div>
  <button @click="increment"></button>
  <router-view></router-view>
</template>

<style scoped>

</style>
