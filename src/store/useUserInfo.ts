import { defineStore } from 'pinia';
import { ref } from 'vue';
import storage from '../utils/storage';

export const useUserInfoStore = defineStore('userInfoStore', () => {
  const userInfo = ref(storage.getItem('userInfo') || {});
  const menuList = ref(storage.getItem('menuList') || []);
  const actionList = ref(storage.getItem('actionList') || []);

  const saveUserInfo = (info) => {
    userInfo.value = info;
    storage.setItem('userInfo', info);
  };
  const saveMenuList = (list) => {
    menuList.value = list;
    storage.setItem('menuList', list);
  };
  const saveActionList = (list) => {
    actionList.value = list;
    storage.setItem('actionList', list);
  };
  return {
    userInfo,
    menuList,
    actionList,
    saveUserInfo,
    saveMenuList,
    saveActionList,
  };
});
