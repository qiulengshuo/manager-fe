/**
 * 环境配置
 */

const env = import.meta.env.MODE || 'prod';
const envConfig = {
  dev: {
    baseApi: '/api',
    mockApi:
      'https://www.fastmock.site/mock/8f1cffb79cffbe8ed7804e379e133338/api',
  },
  test: {
    baseApi: '/',
    mockApi:
      'https://www.fastmock.site/mock/8f1cffb79cffbe8ed7804e379e133338/api',
  },
  prod: {
    baseApi: '/',
    mockApi:
      'https://www.fastmock.site/mock/8f1cffb79cffbe8ed7804e379e133338/api',
  },
};

export default {
  env,
  mock: false,
  namespace: 'manager',
  ...envConfig[env],
};
