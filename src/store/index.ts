import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStore = defineStore('main', () => {
  const num = ref(1);
  function increment() {
    num.value++;
  }
  return { num, increment };
});
