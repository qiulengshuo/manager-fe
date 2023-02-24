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
  // 待审批数量
  noticeCount() {
    return request({
      url: '/leave/count',
      method: 'get',
      data: {},
      mock: true,
    });
  },
  // 菜单列表
  getMenuList() {
    return request({
      url: '/menu/list',
      method: 'get',
      data: {},
      mock: true,
    });
  },
  // 用户列表
  getUserList(params) {
    return request({
      url: '/users/list',
      method: 'get',
      data: params,
      mock: true,
    });
  },
  // 删除用户
  userDel(params) {
    return request({
      url: '/users/delete',
      method: 'post',
      data: params,
      mock: true,
    });
  },
  getRoleList() {
    return request({
      url: '/roles/allList',
      method: 'get',
      data: {},
      mock: true,
    });
  },
  getDeptList() {
    return request({
      url: '/dept/list',
      method: 'get',
      data: {},
      mock: true,
    });
  },
  userSubmit(params) {
    return request({
      url: '/users/operate',
      method: 'post',
      data: params,
      mock: true,
    });
  },
};
