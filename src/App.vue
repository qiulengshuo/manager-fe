<script setup lang="ts">
import { useStore } from './store'
import { storeToRefs } from "pinia"
const store = useStore()
const { num } = storeToRefs(store)
const { increment } = store
</script>

<template>
  <div>Hello Vue! {{ num }}</div>
  <button @click="increment"></button>
  <router-view></router-view>
</template>

<style scoped>

</style>
