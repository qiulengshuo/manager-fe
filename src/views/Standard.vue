<script setup>
import { nextTick, onMounted, ref } from 'vue';
import shared from '../utils/shared';
import API from "../api";
import { ElMessage } from 'element-plus';

const type = ref('course');
const action = ref('create');
const dialogForm = ref();
const disabledNumberInput = ref(true);
const setWeight = ref(false);
const checkedStandard = ref([]);
const standardList = ref([]);
const columns = [
  {
    label: '评估标准名称',
    prop: 'standardName'
  },
  {
    label: '评估标准说明',
    prop: 'standardDescription'
  },
  {
    label: '创建时间',
    prop: 'createTime',
    formatter: (row, column, value) => {
      return shared.formateDate(new Date(value));
    },
  },
  {
    label: '最近修改时间',
    prop: 'updateTime',
    formatter: (row, column, value) => {
      return shared.formateDate(new Date(value));
    },
  }
];
const rules = {
  standardName: [
    { required: true, message: '请输入评估标准名称', trigger: 'blur' }
  ],
  standardDescription: [
    { required: true, message: '请输入评估标准说明', trigger: 'blur' }
  ]
};

const showModal = ref(false);
const assessmentForm = ref({});

const getStandardList = async () => {
  const params = {
    type: type.value
  };
  const res = await API.getStandardList(params);
  standardList.value = res.list;
};

const handleCreate = () => {
  action.value = 'create';
  showModal.value = true;
};

const handlePatchDel = async () => {
  if (checkedStandard.value.length === 0) {
    ElMessage.error('请选择删除项');
    return;
  }
  // 删除
  try {
    action.value = 'delete';
    await API.operateStandardList({
      _id: checkedStandard.value,
      action: action.value
    });
    ElMessage.success('删除成功');
    getStandardList();
  } catch (error) {
    ElMessage.error('删除失败');
  }

};

const handleEditWeight = async () => {
  action.value = 'edit';
  setWeight.value = !setWeight.value;
  disabledNumberInput.value = !disabledNumberInput.value;
  if (!setWeight.value) {
    const sum = standardList.value.reduce((num, cur) => num + cur.standardWeight, 0);
    if (sum !== 100) {
      ElMessage.error('权重之和为100');
      action.value = 'edit';
      setWeight.value = !setWeight.value;
      disabledNumberInput.value = !disabledNumberInput.value;
      return;
    }
    try {
      await API.operateStandardList({
        action: action.value,
        standardList: standardList.value
      });
      ElMessage.success('设置权重成功');
      getStandardList();
    } catch (error) {
      ElMessage.error('设置权重失败');
    }
  }

};

const handleEdit = (row) => {
  action.value = 'edit';
  showModal.value = true;
  nextTick(() => {
    assessmentForm.value = Object.assign({}, row);
  });
};

const handleClose = () => {
  assessmentForm.value = {};
  showModal.value = false;
};

const handleSubmit = () => {
  // 编辑一个 新增
  dialogForm.value.validate(async (valid) => {
    if (valid) {
      try {
        const params = {
          action: action.value,
          type: type.value,
          ...assessmentForm.value,
        };
        await API.operateStandardList(params);
        ElMessage.success('操作成功');
        assessmentForm.value = {};
        getStandardList();
        showModal.value = false;
      } catch (error) {
        ElMessage.error('创建失败');
      }
    } else {
      ElMessage.error('请输入完整表单');
    }
  });
};

// 表格多选
const handleSelectionChange = (list) => {
  const arr = [];
  list.map((item) => {
    arr.push(item._id);
  });
  checkedStandard.value = arr;
};

const changeSort = () => {
  getStandardList();
};

onMounted(() => {
  getStandardList();
})

</script>

<template>
  <div>
    <div class="query-form radio-group">
      <el-radio-group v-model="type" @change="changeSort">
        <el-radio label="course" size="default">课程评估标准</el-radio>
        <el-radio label="majors" size="default">专业评估标准</el-radio>
      </el-radio-group>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button :type="setWeight ? 'success' : 'warning'" @click="handleEditWeight" size="default">{{ setWeight ?
          "确认权重" : "设置权重" }}</el-button>
        <el-button type="primary" @click="handleCreate" size="default">新增标准</el-button>
        <el-button type="danger" @click="handlePatchDel" size="default">批量删除</el-button>
      </div>
      <el-table :data="standardList" @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" />
        <el-table-column align="center" v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column align="center" label="评估标准权重(之和为100)">
          <template #default="scope">
            <el-input-number :min="0" :max="100" :step="5" v-model="scope.row.standardWeight"
              :disabled="disabledNumberInput" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template #default="scope">
            <el-button type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog @close="handleClose" :title="action === 'create' ? '新增标准项' : '编辑标准项'" v-model="showModal">
      <el-form ref="dialogForm" :model="assessmentForm" label-width="100px" :rules="rules">
        <el-form-item label="评估标准名称" prop="standardName">
          <el-input v-model="assessmentForm.standardName" placeholder="请输入评估标准名称" />
        </el-form-item>
        <el-form-item label="评估标准说明" prop="standardDescription">
          <el-input :rows="2" type="textarea" v-model="assessmentForm.standardDescription" placeholder="请输入评估标准说明" />
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

<style lang="scss" scoped>
.radio-group {
  padding-bottom: 22px;
}
</style>