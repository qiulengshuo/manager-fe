import { createApp } from 'vue';
import App from './App.vue';

import router from './router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import storage from './utils/storage';

const pinia = createPinia();
const app = createApp(App);

app.directive('has', {
  beforeMount: function (el, binding) {
    const actionList = storage.getItem('actionList');
    const value = binding.value;
    const hasPermission = actionList.includes(value);
    if (!hasPermission) {
      el.style = 'display:none';
      setTimeout(() => {
        el.parentNode.removeChild(el);
      }, 0);
    }
  },
});

app.use(router);
app.use(pinia);
app.use(ElementPlus, { size: 'small' });
app.mount('#app');
