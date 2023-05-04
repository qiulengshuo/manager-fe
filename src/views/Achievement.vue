<script setup>
import { nextTick, onMounted, ref } from 'vue';
import API from "../api";
import { ElMessage } from 'element-plus';

const type = ref('course');
const action = ref('create');
const dialogForm = ref();
const cascader = ref();
const checkedDetail = ref([]);
const deptList = ref([]);
const deptId = ref('');
const detailList = ref([]);
const courseColumns = [
  {
    label: '学生学号',
    prop: 'studentId'
  },
  {
    label: '学生姓名',
    prop: 'studentName'
  },
  {
    label: '学生成绩',
    prop: 'examinationResults'
  },
  {
    label: '出勤次数',
    prop: 'attendance'
  }, {
    label: '作业上交数',
    prop: 'assignments'
  },
  {
    label: '实验次数',
    prop: 'experiment'
  }
];
const majorsColumns = [{
  label: '就业率',
  prop: 'employmentRates'
}, {
  label: '学科评估',
  prop: 'assessment'
}, {
  label: '院士数量',
  prop: 'academicians'
}, {
  label: '硕士博士点',
  prop: 'degrees'
}, {
  label: '研究方向',
  prop: 'directions'
}];
const columns = ref(courseColumns);

const majorsFormItem = [
  {
    label: '就业率',
    prop: 'employmentRates'
  },
  {
    label: '学科评估',
    prop: 'assessment'
  },
  {
    label: '院士数量',
    prop: 'academicians'
  },
  {
    label: '硕士博士点',
    prop: 'degrees'
  },
  {
    label: '研究方向',
    prop: 'directions'
  }
];
const courseFormItem = [
  {
    label: '学生学号',
    prop: 'studentId'
  },
  {
    label: '学生姓名',
    prop: 'studentName'
  },
  {
    label: '学生成绩',
    prop: 'examinationResults'
  },
  {
    label: '出勤次数',
    prop: 'attendance'
  },
  {
    label: '作业上交数',
    prop: 'assignments'
  },
  {
    label: '实验次数',
    prop: 'experiment'
  }
];

const formItem = ref(courseFormItem);

const rules = {
  studentId: [
    { required: true, message: '请输入学生学号', trigger: 'blur' }
  ],
  studentName: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ]
};
const pager = ref({
  pageSize: 20,
  pageNum: 1,
  total: 0
});

const showModal = ref(false);
const detailForm = ref({});

const getDeptList = async () => {
  const res = await API.getDeptList();
  deptList.value = res;
};

const getDetailList = async (deptId) => {
  const res = await API.getDetailList({
    deptId,
    type: type.value,
    ...pager.value
  });
  const preDetailList = res.list;
  for (let i = 0; i < preDetailList.length; i++) {
    const situation = preDetailList[i].situation;
    for (let j = 0; j < situation.length; j++) {
      const result = situation[j];
      preDetailList[i][result.label] = result.result;
    }
    delete preDetailList[i].situation;
  }
  detailList.value = preDetailList;
  pager.value.total = res.page.total;
};

const handleCreate = () => {
  if ((type.value === 'course' && deptId.value.length === 3) || (type.value === 'majors' && deptId.value.length === 2)) {
    if (type.value === 'majors' && detailList.value.length > 0) {
      ElMessage.error('该专业已经有数据了');
      return;
    }
    action.value = 'create';
    showModal.value = true;
  } else {
    ElMessage.error(`请选择${type.value === 'course' ? '课程' : '专业'}`);
  }
};

const handlePatchDel = async () => {
  if (checkedDetail.value.length === 0) {
    ElMessage.error('请选择删除项');
    return;
  }
  // 删除
  try {
    action.value = 'delete';
    await API.operateDetailList({
      _id: checkedDetail.value,
      action: action.value,
      type: type.value
    });
    ElMessage.success('删除成功');
    getDetailList(deptId.value[deptId.value.length - 1]);
  } catch (error) {
    ElMessage.error('删除失败');
  }
};


const handleEdit = (row) => {
  action.value = 'edit';
  showModal.value = true;
  nextTick(() => {
    detailForm.value = Object.assign({}, row);
  });
};

const handleClose = () => {
  detailForm.value = {};
  showModal.value = false;
};

const handleSubmit = () => {
  // 编辑一个 新增
  dialogForm.value.validate(async (valid) => {
    if (valid) {
      try {
        const { label } = (cascader.value.getCheckedNodes())[0];
        const courseParams = {
          courseId: deptId.value[deptId.value.length - 1],
          courseName: label,
          studentId: detailForm.value.studentId,
          studentName: detailForm.value.studentName,
          situation: []
        };
        const majorsParams = {
          majorsId: deptId.value[deptId.value.length - 1],
          majorsName: label,
          situation: []
        };
        let params = {};
        if (type.value === 'course') {
          params = {
            _id: detailForm.value._id,
            action: action.value,
            type: type.value,
            ...courseParams
          };
        } else if (type.value === 'majors') {
          params = {
            _id: detailForm.value._id,
            action: action.value,
            type: type.value,
            ...majorsParams
          };
        }
        for (const item in detailForm.value) {
          if ((item !== 'studentId' && item !== 'studentName')) {
            const result = detailForm.value[item];
            params.situation.push({
              label: item,
              result
            });
          }
        }
        console.log(params);
        await API.operateDetailList(params);
        ElMessage.success('操作成功');
        detailForm.value = {};
        showModal.value = false;
        getDetailList(deptId.value[deptId.value.length - 1]);
      } catch (error) {
        ElMessage.error('操作失败');
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
  checkedDetail.value = arr;
};

const changeSort = (e) => {
  detailList.value = [];
  deptId.value = [];
  if (e === 'course') {
    columns.value = courseColumns;
    formItem.value = courseFormItem;
  } else {
    columns.value = majorsColumns;
    formItem.value = majorsFormItem;
  }
};

// 改变部门
const change = async (e) => {
  detailList.value = [];
  if (!e) return;
  let deptId;
  if ((type.value === 'course' && e.length === 3) || (type.value === 'majors' && e.length === 2)) {
    deptId = e[e.length - 1];
  } else {
    return;
  }
  getDetailList(deptId);
};

const handleCurrentChange = (num) => {
  pager.value.pageNum = num;
  getDetailList(deptId.value[deptId.value.length - 1]);
};

onMounted(() => {
  getDeptList();
})

</script>

<template>
  <div>
    <div class="query-form radio-group">
      <el-radio-group v-model="type" @change="changeSort">
        <el-radio label="course" size="default">课程</el-radio>
        <el-radio label="majors" size="default">专业</el-radio>
      </el-radio-group>
    </div>
    <div class="base-table">
      <div class="action">
        <el-cascader ref="cascader" style="width: 200px;" @change="change" v-model="deptId"
          :placeholder="type === 'course' ? '请选择课程' : '请选择专业'" :options="deptList"
          :props="{ checkStrictly: true, value: '_id', label: 'deptName' }" clearable>
        </el-cascader>
      </div>

      <div class="action">
        <el-button type="primary" @click="handleCreate" size="default">新增数据</el-button>
        <el-button type="danger" @click="handlePatchDel" size="default">批量删除</el-button>
      </div>
      <el-table :data="detailList" @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" />
        <el-table-column align="center" v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template #default="scope">
            <el-button type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="pager.total" :page-size="pager.pageSize"
          @current-change="handleCurrentChange" />
      </div>
    </div>
    <el-dialog @close="handleClose" :title="action === 'create' ? '新增数据' : '编辑数据'" v-model="showModal">
      <el-form ref="dialogForm" :model="detailForm" label-width="100px" :rules="rules">
        <el-form-item v-for="item in formItem" :label="item.label" :prop="item.prop" :key="item.prop">
          <el-input v-model="detailForm[item.prop]" :placeholder='`请输入${item.label}`' />
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