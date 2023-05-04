<script setup>
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import API from '../api';
import shared from '../utils/shared';

// 查看休假的都是查询当前用户的休假

const form = ref();
const dialogForm = ref();

const $refs = {
  form,
  dialogForm
};

const columns = [
  {
    label: "单号",
    prop: "orderNo",
  },
  {
    label: "休假时间",
    prop: "",
    formatter (row) {
      return (
        shared.formateDate(new Date(row.startTime), "yyyy-MM-dd") +
        "到" +
        shared.formateDate(new Date(row.endTime), "yyyy-MM-dd")
      );
    },
  },
  {
    label: "休假时长",
    prop: "leaveTime",
  },
  {
    label: "休假类型",
    prop: "applyType",
    formatter (row, column, value) {
      return {
        1: "事假",
        2: "调休",
        3: "年假",
      }[value];
    },
  },
  {
    label: "休假原因",
    prop: "reasons",
  },
  {
    label: "申请时间",
    prop: "createTime",
    width: 180,
    formatter: (row, column, value) => {
      return shared.formateDate(new Date(value));
    },
  },
  {
    label: "审批人",
    prop: "auditUsers",
  },
  {
    label: "当前审批人",
    prop: "curAuditUserName",
  },
  {
    label: "审批状态",
    prop: "applyState",
    formatter: (row, column, value) => {
      // 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
      return {
        1: "待审批",
        2: "审批中",
        3: "审批拒绝",
        4: "审批通过",
        5: "作废",
      }[value];
    },
  },
];

const rules = {
  startTime: [
    {
      type: "date",
      required: true,
      message: "请输入开始日期",
      trigger: "change",
    },
  ],
  endTime: [
    {
      type: "date",
      required: true,
      message: "请输入结束日期",
      trigger: "change",
    },
  ],
  reasons: [
    {
      required: true,
      message: "请输入休假原因",
      trigger: ["change", "blur"],
    },
  ],
};

const action = ref('create');
const showModal = ref(false);
const showDetailModal = ref(false);

const queryForm = ref({
  applyState: 1
});

const leaveForm = ref({
  leaveTime: '0天'
});

const detail = ref({});

const applyList = ref([]);



const pager = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

// 分页加载
const handleCurrentChange = (current) => {
  pager.value.pageNum = current;
  getApplyList();
};

// 加载审批列表
const getApplyList = async () => {
  const params = { ...queryForm.value, ...pager.value };
  const { list, page } = await API.getApplyList(params);
  applyList.value = list;
  pager.value.total = page.total;
};

// 重置表单
const handleReset = (form) => {
  $refs[form].value.resetFields();
};

const handleApply = () => {
  showModal.value = true;
  action.value = 'create';
};

// date组件改变
const handleDateChange = (key) => {
  const { startTime, endTime } = leaveForm.value;
  if (!startTime || !endTime) return;
  if (startTime > endTime) {
    ElMessage.error('开始日期不能晚于结束日期');
    leaveForm.value.leaveTime = '0天';
    leaveForm.value[key] = '';
  } else {
    leaveForm.value.leaveTime = (endTime - startTime) / (24 * 60 * 60 * 1000) + 1 + '天';
  }
};

// 关闭弹窗
const handleClose = () => {
  showModal.value = false;
  handleReset('dialogForm');
};

// 提交操作
const handleSubmit = () => {
  $refs.dialogForm.value.validate(async (valid) => {
    if (valid) {
      try {
        const params = { ...leaveForm.value, action: action.value };
        await API.leaveOperate(params);
        ElMessage.success('创建成功');
        handleClose();
        getApplyList();
      } catch (error) {
        console.log(error);
      }
    }
  });
};

const handleDetail = (row) => {
  let data = { ...row };
  data.applyTypeName = {
    1: "事假",
    2: "调休",
    3: "年假",
  }[data.applyType];
  data.time =
    shared.formateDate(new Date(data.startTime), "yyyy-MM-dd") +
    "到" +
    shared.formateDate(new Date(data.endTime), "yyyy-MM-dd");
  // 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
  data.applyStateName = {
    1: "待审批",
    2: "审批中",
    3: "审批拒绝",
    4: "审批通过",
    5: "作废",
  }[data.applyState];
  detail.value = data;
  showDetailModal.value = true;
};

const handleDelete = async (_id) => {
  try {
    const params = { _id, action: 'delete' };
    await API.leaveOperate(params);
    ElMessage.success('删除成功');
    getApplyList();
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  getApplyList();
})

</script>

<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="审批状态" prop="applyState">
          <el-select v-model="queryForm.applyState">
            <el-option value="" label="全部"></el-option>
            <el-option :value="1" label="待审批"></el-option>
            <el-option :value="2" label="审批中"></el-option>
            <el-option :value="3" label="审批拒绝"></el-option>
            <el-option :value="4" label="审批通过"></el-option>
            <el-option :value="5" label="作废"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getApplyList">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleApply">申请休假</el-button>
      </div>
      <el-table :data="applyList">
        <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button @click="handleDetail(scope.row)" size="small">查看</el-button>
            <el-button v-if="[1, 2].includes(scope.row.applyState)" @click="handleDelete(scope.row._id)" type="danger"
              size="small">作废</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total"
        :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>

    <el-dialog title="申请休假" v-model="showModal" width="70%">
      <el-form ref="dialogForm" :model="leaveForm" label-width="120px" :rules="rules">
        <el-form-item label="休假类型" prop="applyType" required>
          <el-select v-model="leaveForm.applyType">
            <el-option label="事假" :value="1"></el-option>
            <el-option label="调休" :value="2"></el-option>
            <el-option label="年假" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="休假类型" required>
          <el-row>
            <el-col :span="8">
              <el-form-item prop="startTime" required>
                <el-date-picker v-model="leaveForm.startTime" type="date" placeholder="选择开始日期"
                  @change="(val) => handleDateChange('startTime', val)" />
              </el-form-item>
            </el-col>
            <el-col :span="1">-</el-col>
            <el-col :span="8">
              <el-form-item prop="endTime" required>
                <el-date-picker v-model="leaveForm.endTime" type="date" placeholder="选择结束日期"
                  @change="(val) => handleDateChange('endTime', val)" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="休假时长" required>
          {{ leaveForm.leaveTime }}
        </el-form-item>
        <el-form-item label="休假原因" prop="reasons" required>
          <el-input type="textarea" :row="3" placeholder="请输入休假原因" v-model="leaveForm.reasons" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog title="申请休假详情" width="50%" v-model="showDetailModal">
      <el-steps :active="detail.applyState > 2 ? 3 : detail.applyState" align-center>
        <el-step title="待审批"></el-step>
        <el-step title="审批中"></el-step>
        <el-step title="审批通过/审批拒绝"></el-step>
      </el-steps>
      <el-form label-width="120px" label-suffix=":">
        <el-form-item label="休假类型">
          <div>{{ detail.applyTypeName }}</div>
        </el-form-item>
        <el-form-item label="休假时间">
          <div>{{ detail.time }}</div>
        </el-form-item>
        <el-form-item label="休假时长">
          <div>{{ detail.leaveTime }}</div>
        </el-form-item>
        <el-form-item label="休假原因">
          <div>{{ detail.reasons }}</div>
        </el-form-item>
        <el-form-item label="审批状态">
          <div>{{ detail.applyStateName }}</div>
        </el-form-item>
        <el-form-item label="审批人">
          <div>{{ detail.curAuditUserName }}</div>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>