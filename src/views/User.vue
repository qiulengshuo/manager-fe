<script setup>
import { ElMessage } from 'element-plus';
import { nextTick, onMounted, ref } from 'vue';
import API from '../api';

const form = ref();
const user = ref({
  userId: '',
  userName: '',
  state: ''
});
const checkedUserIds = ref([]);
const userList = ref([]);
const columns = ref([
  {
    label: '用户ID',
    prop: 'userId'
  },
  {
    label: '用户名',
    prop: 'userName'
  },
  {
    label: '用户邮箱',
    prop: 'userEmail'
  },
  {
    label: '用户角色',
    prop: 'role',
    formatter (row, column, value) {
      return {
        0: '管理员',
        1: '普通用户'
      }[value];
    }
  },
  {
    label: '用户状态',
    prop: 'state',
    formatter (row, column, value) {
      return {
        1: '在职',
        2: '离职',
        3: '试用期'
      }[value];
    }
  },
  {
    label: '注册时间',
    prop: 'createTime'
  },
  {
    label: '最后登录时间',
    prop: 'lastLoginTime'
  }
]);
const pager = ref({
  total: 0,
  pageSize: 10,
  pageNum: 1
});
const showModal = ref(false);
const userForm = ref({
  state: 3
});
const rules = ref({
  userName: [
    {
      required: true,
      message: '请输入用户名称',
      trigger: 'blur'
    }
  ],
  userEmail: [
    {
      required: true,
      message: '请输入用户邮箱',
      trigger: 'blur'
    }
  ],
  mobile: [
    {
      pattern: /1{3-9}\d{9}/,
      message: '请输入正确的手机号格式',
      trigger: 'blur'
    }
  ],
  deptId: [
    {
      required: true,
      message: '请输入用户部门',
      trigger: 'blur'
    }
  ]
});
const roleList = ref([]);
const deptList = ref([]);
const action = ref('add');
const dialogForm = ref();
const $refs = {
  form,
  dialogForm
};

// 获取用户列表
const getUserList = async () => {
  const params = { ...user, ...pager };
  try {
    const { list, page } = await API.getUserList(params);
    userList.value = list;
    pager.value.total = page.total;
  } catch (error) {
    console.log(error);
  }
};

// 查询相关
const handleQuery = () => {
  getUserList();
};
const handleReset = (form) => {
  $refs[form].value.resetFields();
};

// 新增 or 批量删除
const handleCreate = () => {
  action.value = 'add';
  showModal.value = true;
};

const handleDel = async (row) => {
  await API.userDel({
    userIds: [row.userId]//可单个删除，也可批量删除
  });
  ElMessage.success('删除成功');
  getUserList();
};
const handlePatchDel = async () => {
  if (checkedUserIds.value.length === 0) {
    ElMessage.error('请选择要删除的用户');
    return;
  }
  const res = await API.userDel({
    userIds: checkedUserIds.value
  });
  if (res.nModified > 0) {
    ElMessage.success('删除成功');
    getUserList();
  } else {
    ElMessage.success('修改失败');
  }
};

// 用户列表相关
const handleEdit = (row) => {
  showModal.value = true;
  // 初始化之后再赋值，防止重置表格失败
  nextTick(() => {
    action.value = "edit";
    Object.assign(userForm.value, row);
  });
};

// 表格多选
const handleSelectionChange = (list) => {
  const arr = [];
  list.map((item) => {
    arr.push(item.userId);
  });
  checkedUserIds.value = arr;
};

// 分页相关
const handleCurrentChange = (current) => {
  pager.value.pageNum = current;
  getUserList();
};

// dialog
const getDeptList = async () => {
  let list = await API.getDeptList();
  deptList.value = list;
};
const getRoleList = async () => {
  let list = await API.getRoleList();
  roleList.value = list;
};
const handleClose = () => {
  showModal.value = false;
  handleReset("dialogForm");
};
const handleSubmit = () => {
  $refs.dialogForm.value.validate(async (valid) => {
    if (valid) {
      const params = Object.assign({}, userForm.value);
      params.userEmail += "@edu.com";
      params.action = action.value;
      const res = await API.userSubmit(params);
      if (res) {
        showModal.value = false;
        ElMessage.success("用户创建成功");
        handleReset("dialogForm");
        getUserList();
      }
    }
  });
};
// 数据初始化
onMounted(() => {
  getUserList();
  getDeptList();
  getRoleList();
});

</script>

<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="user">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="user.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="user.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="user.state">
            <el-option :value="0" label="所有"></el-option>
            <el-option :value="1" label="在职"></el-option>
            <el-option :value="2" label="离职"></el-option>
            <el-option :value="3" label="试用期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">新增</el-button>
        <el-button type="danger" @click="handlePatchDel">批量删除</el-button>
      </div>
      <el-table :data="userList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button @click="handleEdit(scope.row)" size="small">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDel(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total"
        :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>
    <el-dialog title="用户新增" v-model="showModal">
      <el-form ref="dialogForm" :model="userForm" label-width="100px" :rules="rules">
        <el-form-item label="用户名" prop="userName">
          <el-input :disabled="action === 'edit'" v-model="userForm.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="userEmail">
          <el-input :disabled="action === 'edit'" v-model="userForm.userEmail" placeholder="请输入用户邮箱">
            <template #append>@edu.com</template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="userForm.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="岗位" prop="job">
          <el-input v-model="userForm.job" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="userForm.state">
            <el-option :value="1" label="在职"></el-option>
            <el-option :value="2" label="离职"></el-option>
            <el-option :value="3" label="试用期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系统角色" prop="roleList">
          <el-select style="width: 100%;" multiple v-model="userForm.roleList" placeholder="请选择用户系统角色">
            <el-option v-for="role in roleList" :key="role._id" :label="role.roleName" :value="role._id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-cascader style="width: 100%;" v-model="userForm.deptId" placeholder="请选择所属部门" :options="deptList"
            :props="{ checkStrictly: true, value: '_id', label: 'deptName' }" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>