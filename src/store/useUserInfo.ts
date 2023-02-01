import { defineStore } from 'pinia';
import { ref } from 'vue';
import storage from '../utils/storage';

export const useUserInfoStore = defineStore('userInfoStore', () => {
  let userInfo = ref(storage.getItem('userInfo') || {});
  const saveUserInfo = (info) => {
    userInfo = ref(info);
    storage.setItem('userInfo', info);
  };
  return {
    userInfo,
    saveUserInfo,
  };
});
