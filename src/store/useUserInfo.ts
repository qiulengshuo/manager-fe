import { defineStore } from 'pinia';
import { ref } from 'vue';
import storage from '../utils/storage';

export const useUserInfoStore = defineStore('userInfoStore', () => {
  const userInfo = ref(storage.getItem('userInfo') || {});
  const saveUserInfo = (info) => {
    userInfo.value = info;
    storage.setItem('userInfo', info);
  };
  return {
    userInfo,
    saveUserInfo,
  };
});
