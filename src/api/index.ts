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
      mock: false,
    });
  },
  // 菜单列表
  getMenuList(params) {
    return request({
      url: '/menu/list',
      method: 'get',
      data: params,
      mock: false,
    });
  },
  // 获取权限菜单列表
  getPermissionList() {
    return request({
      url: '/users/getPermissionList',
      method: 'get',
      data: {},
      mock: false,
    });
  },
  // 按页用户列表
  getUserList(params) {
    return request({
      url: '/users/list',
      method: 'get',
      data: params,
      mock: false,
    });
  },
  // 用户所有用户列表
  getAllUserList() {
    return request({
      url: '/users/all/list',
      method: 'get',
      data: {},
      mock: false,
    });
  },
  // 删除用户
  userDel(params) {
    return request({
      url: '/users/delete',
      method: 'post',
      data: params,
      mock: false,
    });
  },
  userSubmit(params) {
    return request({
      url: '/users/operate',
      method: 'post',
      data: params,
      mock: false,
    });
  },
  // 角色列表
  getRoleAllList() {
    return request({
      url: '/roles/allList',
      method: 'get',
      data: {},
      mock: false,
    });
  },
  // 角色详细列表
  getRoleList(params) {
    return request({
      url: '/roles/list',
      method: 'get',
      data: params,
      mock: false,
    });
  },
  // 部门列表
  getDeptList(params) {
    return request({
      url: '/dept/list',
      method: 'get',
      data: params,
      mock: false,
    });
  },
  // 提交操作(新增或编辑或删除)
  menuSubmit(params) {
    return request({
      url: '/menu/operate',
      method: 'post',
      data: params,
      mock: false,
    });
  },
  // 角色操作(新增、编辑、删除)
  roleOperate(params) {
    return request({
      url: '/roles/operate',
      method: 'post',
      data: params,
      mock: false,
    });
  },
  // 更新权限列表
  updatePermission(params) {
    return request({
      url: '/roles/update/permission',
      method: 'post',
      data: params,
      mock: false,
    });
  },
  // 部门操作
  deptOperate(params) {
    return request({
      url: '/dept/operate',
      method: 'post',
      data: params,
      mock: false,
    });
  },
  // 休假列表
  getApplyList(params) {
    return request({
      url: '/leave/list',
      method: 'get',
      data: params,
      mock: false,
    });
  },
  // 休假操作
  leaveOperate(params) {
    return request({
      url: '/leave/operate',
      method: 'post',
      data: params,
      mock: false,
    });
  },
  // 休假审批
  leaveApprove(params) {
    return request({
      url: '/leave/approve',
      method: 'post',
      data: params,
      mock: false,
    });
  },
  // 获取标准列表
  getStandardList(params) {
    return request({
      url: '/assessment/standardList',
      method: 'get',
      data: params,
      mock: false,
    });
  },
  // 操作标准列表
  operateStandardList(params) {
    return request({
      url: '/assessment/operateStandardList',
      method: 'post',
      data: params,
      mock: false,
    });
  },
  // 获取部门评级列表
  getDeptAllList() {
    return request({
      url: '/dept/allList',
      method: 'get',
      data: {},
      mock: false,
    });
  },
  // 评估
  operateAssessment(params) {
    return request({
      url: '/assessment/operateAssessment',
      method: 'post',
      data: params,
      mock: false,
    });
  },
  // 验证是否评估过
  hadAssessment(params) {
    return request({
      url: '/assessment/validHadAssessment',
      method: 'get',
      data: params,
      mock: false,
    });
  },
  // 获取评估结果
  getAssessmentResult(params) {
    return request({
      url: '/assessment/assessmentResult',
      method: 'get',
      data: params,
      mock: false,
    });
  },
  // 操作课程或专业列表
  operateDetailList(params) {
    return request({
      url: '/assessment/operateDetailList',
      method: 'post',
      data: params,
      mock: false,
    });
  },
  getDetailList(params) {
    return request({
      url: '/assessment/detailList',
      method: 'get',
      data: params,
      mock: false,
    });
  },
};
