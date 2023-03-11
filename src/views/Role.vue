<script setup>
import { ElMessage } from "element-plus";
import { nextTick, onMounted, ref } from "vue";
import API from "../api";
import shared from "../utils/shared";
const form = ref();
const dialogForm = ref();
const tree = ref();
const $refs = {
  form,
  dialogForm,
  tree
};
const queryForm = ref({
  roleName: ''
});
const roleForm = ref({});
const roleList = ref([]);
const menuList = ref([]);
const pager = ref({
  total: 0,
  pageSize: 10
});
const showModal = ref(false);
const showPermission = ref(false);
const action = ref("create");
// 二级菜单映射 key(id) : value(menuName)
let actionMap = {};
const rules = {
  roleName: [
    {
      required: true,
      message: "请输入角色角色名称",
    },
  ]
};
const columns = [
  {
    label: "角色名称",
    prop: "roleName",
  },
  {
    label: "备注",
    prop: "remark",
  },
  {
    label: "权限列表",
    prop: "permissionList",
    width: 200,
    formatter: (row, column, value) => {
      // 只显示有权限的二级菜单
      const names = [];
      const list = value.halfCheckedKeys || [];
      list.map((key) => {
        const v = actionMap[key];
        if (key && v) names.push(v);
      });
      return names.join("、");
    },
  },
  {
    label: "创建时间",
    prop: "createTime",
    formatter (row, column, value) {
      return shared.formateDate(new Date(value));
    },
  },
];
const curRoleName = ref('');
const curRoleId = ref('');
const getRoleList = async () => {
  try {
    const { list, page } = await API.getRoleList({ ...queryForm.value, ...pager.value });
    roleList.value = list;
    pager.value.total = page.total;
  } catch (e) {
    throw new Error(e);
  }
};
const getMenuList = async () => {
  try {
    const list = await API.getMenuList();
    menuList.value = list;
    getActionMap(list);
  } catch (e) {
    throw new Error(e);
  }
};
const getActionMap = (list) => {
  const map = {};
  const deep = (arr) => {
    while (arr.length) {
      const item = arr.pop();
      if (item.children && item.action) {
        map[item._id] = item.menuName;
      }
      if (item.children && !item.action) {
        deep(item.children);
      }
    }
  };
  deep(JSON.parse(JSON.stringify(list)));
  actionMap = map;
};
const handleReset = (form) => {
  $refs[form].value.resetFields();
};
const handleCurrentChange = () => {
  //
};
const handleAdd = () => {
  action.value = 'create';
  showModal.value = true;
};
const handleEdit = (row) => {
  action.value = 'edit';
  showModal.value = true;
  nextTick(() => {
    roleForm.value = Object.assign({}, row);
  });
};
const handleDel = async (_id) => {
  await API.roleOperate({ _id, action: "delete" });
  ElMessage.success('删除成功');
  getRoleList();
};
const handleClose = () => {
  handleReset('dialogForm');
  showModal.value = false;
};
const handleSubmit = () => {
  $refs.dialogForm.value.validate(async (valid) => {
    if (valid) {
      const params = { ...roleForm.value, action: action.value };
      const res = await API.roleOperate(params);
      if (res) {
        showModal.value = false;
        ElMessage.success('创建成功');
        handleReset('dialogForm');
        getRoleList();
      }
    }
  });
};
// 打开权限列表
const handleOpenPermission = (row) => {
  curRoleId.value = row._id;
  curRoleName.value = row.roleName;
  showPermission.value = true;
  // 获取全选key
  const { checkedKeys } = row.permissionList;
  nextTick(() => {
    $refs.tree.value.setCheckedKeys(checkedKeys);
  });
};
// 处理权限列表的编辑(全部菜单当半选处理，全部已选按钮当全选处理)
const handlePermissionSubmit = async () => {
  // 全选node
  const nodes = $refs.tree.value.getCheckedNodes();
  // 半选key
  const halfKeys = $refs.tree.value.getHalfCheckedKeys();
  // 全选key
  const checkedKeys = [];
  // 根菜单和父菜单的key
  const parentKeys = [];
  nodes.map((node) => {
    // 按钮
    if (!node.children) {
      checkedKeys.push(node._id);
    } else {
      // 菜单
      parentKeys.push(node._id);
    }
  });
  const params = {
    _id: curRoleId.value,
    permissionList: {
      checkedKeys,
      halfCheckedKeys: parentKeys.concat(halfKeys)
    }
  };
  await API.updatePermission(params);
  showPermission.value = false;
  ElMessage.success('设置成功');
  getRoleList();
};
onMounted(async () => {
  await getMenuList();
  await getRoleList();
});
</script>
<template>
  <div class="role-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="queryForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getRoleList">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleAdd">创建</el-button>
      </div>
      <el-table :data="roleList">
        <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" @click="handleOpenPermission(scope.row)">设置权限</el-button>
            <el-button type="danger" size="small" @click="handleDel(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total"
        :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>

    <el-dialog title="用户新增" v-model="showModal">
      <el-form ref="dialogForm" :model="roleForm" label-width="100px" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :rows="2" v-model="roleForm.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog title="权限设置" v-model="showPermission">
      <el-form label-width="100px">
        <el-form-item label="角色名称">
          {{ curRoleName }}
        </el-form-item>
        <el-form-item label="选择权限">
          <el-tree ref="tree" :data="menuList" show-checkbox node-key="_id" default-expand-all
            :props="{ label: 'menuName' }">
          </el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPermission = false">取 消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>


<style lang="scss"></style>