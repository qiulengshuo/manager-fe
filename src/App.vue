<script setup>
// import { useStore } from './store';
// import { storeToRefs } from "pinia";
// import request from './utils/request';
// const store = useStore();
// const { num } = storeToRefs(store);
// const { increment } = store;

// import storage from './utils/storage';

// request.get('/login', { name: 'admin' }, { loading: true }).then((res) => {
//   console.log(res);
// });

// storage.setItem('name', 'jack');
// console.log(storage.getItem('name'));
// storage.clearAll();

</script>

<template>
  <!-- <div>Hello Vue! {{ num }}</div> -->
  <!-- <button @click="increment"></button> -->
  <router-view></router-view>
</template>

<style lang="scss">
@import url(./assets/style/reset.css);
@import url(./assets/style/index.scss);
</style>
