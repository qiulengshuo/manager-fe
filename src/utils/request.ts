import axios from 'axios';
import config from '../config';
import { ElMessage } from 'element-plus';
import router from './../router';
import { CODE, ERRMSG } from './const';

// 创建 axios 实例对象，添加全局配置
const service = axios.create({
  baseURL: config.baseApi,
  timeout: 8000,
});

// 请求拦截
service.interceptors.request.use((req: any) => {
  // TODO Token 的携带
  const headers = req.headers;
  if (!headers.Authorization) {
    headers.Authorization = 'Bear Jack';
  }
  return req;
});

// 响应拦截
service.interceptors.response.use((res: any) => {
  const { code, data, msg } = res.data;
  if (code === CODE.SUCCESS) {
    return data;
  } else if (code === CODE.TOKEN_INVALID) {
    ElMessage.error(ERRMSG.TOKEN_INVALID);
    setTimeout(() => {
      router.push('/login');
    }, 1500);
    return Promise.reject(ERRMSG.TOKEN_INVALID);
  } else {
    ElMessage.error(msg || ERRMSG.NETWORK_ERROR);
    return Promise.reject(msg || ERRMSG.NETWORK_ERROR);
  }
});

/**
 * 请求核心函数
 * @param options 请求配置
 * @returns axios实例调用函数
 */
function request(options) {
  options.method = options.method || 'get';
  // 统一传参用 data 属性
  if (options.method.toLowerCase() === 'get') {
    options.params = options.data;
  }
  if (typeof options.mock !== 'undefined') {
    config.mock = options.mock;
  }
  if (config.env === 'prod') {
    service.defaults.baseURL = config.baseApi;
  } else {
    service.defaults.baseURL = options.mock
      ? config.mockApi
      : config.mock
      ? config.mockApi
      : config.baseApi;
  }
  return service(options);
}

// 支持.get .post等用法
['get', 'post', 'put', 'delete', 'patch'].forEach((item) => {
  request[item] = (url, data, options) => {
    return request({
      url,
      data,
      method: item,
      ...options,
    });
  };
});

export default request;
