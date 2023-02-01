/**
 *  所有接口封装
 */

import request from './../utils/request';
export default {
  // 登录接口
  login(params) {
    return request({
      url: '/users/login',
      method: 'post',
      data: params,
    });
  },
};
