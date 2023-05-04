<script setup>
import { onMounted, ref } from 'vue';
import shared from '../utils/shared';
import API from "../api";
import { useUserInfoStore } from '../store';
import { ElMessage } from 'element-plus';

const userInfoStore = useUserInfoStore();
const userInfo = userInfoStore.userInfo;

const type = ref('course');

const comments = ref('');

const pager = ref({
  total: 0,
  pageSize: 10,
  pageNum: 1
});

const deptList = ref([]);
const deptAllList = ref([]);
const deptId = ref();

const standardList = ref([]);

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

const assessmentColumns = [
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

const detailList = ref([]);

// 确定当前角色是老师还是专家
const getRoleInfo = async () => {
  if (userInfo.role === 0) return;
  const { list: res } = await API.getRoleList({
    pageSize: 1000
  });
  const roleList = userInfo.roleList;
  const curRole = [];
  for (let i = 0; i < roleList.length; i++) {
    const role = res.find((item) => item._id === roleList[i]);
    curRole.push(role.roleName);
  }
  if (curRole.includes('老师')) {
    type.value = 'course';
    columns.value = courseColumns;
  } else if (curRole.includes('专家')) {
    type.value = 'majors';
    columns.value = majorsColumns;
  }
};

const getDeptList = async () => {
  try {
    const list = await API.getDeptList();
    // 管理员展示全部
    if (userInfo.role === 0) {
      deptList.value = list;
    } else {
      const normalList = dfsDeptList(list, []);
      deptList.value = normalList;
    }

    const allList = await API.getDeptAllList();
    deptAllList.value = allList;
  } catch (error) {
    ElMessage.error('获取教学层级列表失败!');
  }
};

const dfsDeptList = (list, res) => {
  for (const item of list) {
    if (+item.userId === userInfo.userId) {
      res.push(item);
    }
    item.children && dfsDeptList(item.children, res);
  }
  return res;
};



// 获取评估列表
const getStandardList = async () => {
  const params = {
    type: type.value
  };
  const res = await API.getStandardList(params);
  standardList.value = res.list;
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

const changeType = () => {
  deptId.value = undefined;
  comments.value = '';
  detailList.value = [];
  if (type.value === 'course') {
    columns.value = courseColumns;
  } else if (type.value === 'majors') {
    columns.value = majorsColumns;
  }
  getStandardList();
};

const handleCurrentChange = (num) => {
  pager.value.pageNum = num;
  getDetailList(deptId.value[deptId.value.length - 1]);
};

const change = async (e) => {
  if (!e) return;
  try {
    for (const standard of standardList.value) {
      standard.score = undefined;
    }
    let deptId;
    if (userInfo.role === 0) {
      // 管理员权限 只有选择课程或者专业才能去查询
      if ((type.value === 'course' && e.length === 3) || (type.value === 'majors' && e.length === 2)) {
        deptId = e[e.length - 1];
      } else {
        return;
      }
    } else {
      // 普通用户由于只有课程或者专业，所有直接赋值即可
      deptId = e;
    }
    getDetailList(deptId);
    const res = await API.hadAssessment({
      deptId
    });
    if (res.length === 0) {
      return;
    }
    // 这里不直接覆盖是因为，后面如果有新标准加不进去
    const assessmentResult = res[0].assessmentResult;
    for (const standard of standardList.value) {
      const hasStandard = assessmentResult.find((item) => item._id === standard._id);
      if (hasStandard) {
        standard.score = hasStandard.score;
      }
    }
    const preComments = res[0].comments;
    comments.value = preComments;
  } catch (error) {
    ElMessage.error('查询是否评估过失败', error.stack);
  }
};

const validRequired = (required) => {
  for (const standard of standardList.value) {
    if (standard[required] === undefined) {
      return false;
    }
  }
  return true;
};

const finishAssessment = async () => {
  if (validRequired('score') && deptId.value) {
    try {
      let curDeptId;
      if (userInfo.role === 0) {
        // 管理员权限 只有选择课程或者专业才能去操作
        if ((type.value === 'course' && deptId.value.length === 3) || (type.value === 'majors' && deptId.value.length === 2)) {
          curDeptId = deptId.value[deptId.value.length - 1];
        } else {
          const text = type.value === 'course' ? '请选择课程' : '请选择专业';
          ElMessage.error(text);
          return;
        }
      } else {
        // 普通用户由于只有课程或者专业，所有直接赋值即可
        curDeptId = deptId.value;
      }
      const { deptName } = deptAllList.value.find(item => item._id === curDeptId);
      const params = {
        assessmentName: `${type.value}-${deptName}`,
        assessmentId: curDeptId,
        comments: comments.value,
        assessmentResult: standardList.value
      };
      await API.operateAssessment(params);
      ElMessage.success('操作成功');
    } catch (error) {
      ElMessage.error('操作失败');
    }
  } else {
    ElMessage.error('请对所有标准项进行评分并且选择正确的课程或专业');
  }
};

onMounted(async () => {
  await getRoleInfo();
  getDeptList();
  getStandardList();
})

</script>

<template>
  <div class="evaluation">
    <div v-has="'assessment-select'" class="query-form radio-group">
      <el-radio-group v-model="type" @change="changeType">
        <el-radio label="course" size="default">课程评估</el-radio>
        <el-radio label="majors" size="default">专业评估</el-radio>
      </el-radio-group>
    </div>
    <div class="base-table">
      <div class="action">
        <el-select v-if="userInfo.role === 1" @change="change" v-model="deptId"
          :placeholder="type === 'course' ? '请选择课程' : '请选择专业'">
          <el-option v-for="dept in deptList" :key="dept._id" :label="dept.deptName" :value="dept._id">
          </el-option>
        </el-select>
        <el-cascader v-else style="width: 200px;" @change="change" v-model="deptId"
          :placeholder="type === 'course' ? '请选择课程' : '请选择专业'" :options="deptList"
          :props="{ checkStrictly: true, value: '_id', label: 'deptName' }" clearable></el-cascader>
      </div>

      <el-table :data="detailList">
        <el-table-column align="center" v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="pager.total" :page-size="pager.pageSize"
          @current-change="handleCurrentChange" />
      </div>

      <div class="evaluation-title">{{ type === 'course' ? '老师' : '专家' }}评估：</div>

      <el-table :data="standardList">
        <el-table-column align="center" v-for="item in assessmentColumns" :key="item.prop" :prop="item.prop"
          :label="item.label" :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column align="center" label="评分(总分100)">
          <template #default="scope">
            <el-input-number :min="0" :max="100" :step="5" v-model="scope.row.score" />
          </template>
        </el-table-column>
      </el-table>

      <div class="evaluation-footer">
        <div>此次评估的评语:</div>
        <el-input :rows="3" type="textarea" v-model="comments" placeholder="请输入评估标准说明" />
        <el-button @click="finishAssessment" size="default" class="evaluation-footer_button"
          type="primary">完成评估</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.evaluation {
  height: 100%;
}

.radio-group {
  padding-bottom: 22px;
}

.base-table {
  height: calc(100% - 96px);
  overflow: auto;

  .action {
    border-bottom: none;
  }
}

.evaluation-footer,
.evaluation-title {
  padding: 10px 20px;
  font-size: 13px;
  color: #606266;

  div:first-of-type {
    margin-bottom: 10px;
  }

  .evaluation-footer_button {
    margin-top: 10px;
    display: block;
    margin-left: auto;
  }
}

.evaluation-title {
  padding-top: 0px;
}

.pagination {
  display: flex;
  justify-content: space-around;
}
</style>