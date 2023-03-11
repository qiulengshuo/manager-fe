<script setup>
import { ref, onMounted, nextTick } from 'vue';
import shared from '../utils/shared';
import API from '../api';
import { ElMessage } from 'element-plus';

const queryForm = ref({
  menuState: 1
});
const menuList = ref([]);
const columns = ref([{
  label: "菜单名称",
  prop: "menuName",
  width: 150,
},
{
  label: "图标",
  prop: "icon",
},
{
  label: "菜单类型",
  prop: "menuType",
  formatter (row, column, value) {
    return {
      1: "菜单",
      2: "按钮",
    }[value];
  },
},
{
  label: "权限标识",
  prop: "menuCode",
},
{
  label: "路由地址",
  prop: "path",
},
{
  label: "组件路径",
  prop: "component",
},
{
  label: "菜单状态",
  prop: "menuState",
  width: 90,
  formatter (row, column, value) {
    return {
      1: "正常",
      2: "停用",
    }[value];
  },
},
{
  label: "创建时间",
  prop: "createTime",
  formatter (row, column, value) {
    return shared.formateDate(new Date(value));
  },
}]);
const dialogForm = ref();
const form = ref();
const $refs = {
  dialogForm,
  form
};
const showModal = ref(false);
const menuForm = ref({
  parentId: [null],
  menuType: 1,
  menuState: 1
});
const action = ref();
const rules = {
  menuName: [
    {
      required: true,
      message: "请输入菜单名称",
      trigger: "blur",
    },
    {
      min: 2,
      max: 15,
      message: "长度在2-15个字符",
      trigger: "blur",
    },
  ],
};

const getMenuList = async () => {
  try {
    const list = await API.getMenuList(queryForm.value);
    menuList.value = list;
  } catch (e) {
    throw new Error(e);
  }
};

const handleReset = (form) => {
  $refs[form].value.resetFields();
};

const handleAdd = (type, row) => {
  showModal.value = true;
  action.value = "add";
  // 在指定菜单点新增
  if (type === 2) {
    nextTick(() => {
      menuForm.value.parentId = [...row.parentId, row._id].filter((item) => item);
    });
  }
};

const handleEdit = (row) => {
  showModal.value = true;
  action.value = "edit";
  nextTick(() => {
    Object.assign(menuForm.value, row);
  });
};

const handleDel = async (_id) => {
  await API.menuSubmit({ _id, action: 'delete' });
  ElMessage.success('删除成功');
  getMenuList();
};

const handleSubmit = () => {
  dialogForm.value.validate(async (valid) => {
    if (valid) {
      const params = { ...menuForm.value, action: action.value };
      await API.menuSubmit(params);
      showModal.value = false;
      ElMessage.success("操作成功");
      handleReset("dialogForm");
      getMenuList();
    }
  });
};

const handleClose = () => {
  showModal.value = false;
  handleReset('dialogForm');
};

onMounted(() => {
  getMenuList();
});
</script>

<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="queryForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单状态" prop="menuState">
          <el-select v-model="queryForm.menuState">
            <el-option :value="1" label="正常"></el-option>
            <el-option :value="2" label="停用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getMenuList">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleAdd(1)">新增</el-button>
      </div>
      <el-table :data="menuList" row-key="_id" :tree-props="{ children: 'children' }">
        <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button type="primary" @click="handleAdd(2, scope.row)">新增</el-button>
            <el-button @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" @click="handleDel(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog @close="handleClose" title="用户新增" v-model="showModal">
      <el-form ref="dialogForm" :model="menuForm" label-width="100px" :rules="rules">
        <el-form-item label="父级菜单" prop="parentId">
          <el-cascader v-model="menuForm.parentId" :options="menuList"
            :props="{ checkStrictly: true, value: '_id', label: 'menuName' }" clearable />
          <span>不选，则直接创建一级菜单</span>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="menuForm.menuType">
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon" v-show="menuForm.menuType == 1">
          <el-input v-model="menuForm.icon" placeholder="请输入菜单图标" />
        </el-form-item>
        <el-form-item label="路由地址" prop="path" v-show="menuForm.menuType == 1">
          <el-input v-model="menuForm.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item label="权限标识" prop="menuCode" v-show="menuForm.menuType == 2">
          <el-input v-model="menuForm.menuCode" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-show="menuForm.menuType == 1">
          <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="菜单状态" prop="menuState" v-show="menuForm.menuType == 1">
          <el-radio-group v-model="menuForm.menuState">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="2">停用</el-radio>
          </el-radio-group>
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