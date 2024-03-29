<script setup>
import { onMounted, ref } from 'vue';
import shared from '../utils/shared';
import { useUserInfoStore } from '../store/index';
import API from '../api';
import { ElMessage } from 'element-plus';

const userInfoStore = useUserInfoStore();

const userInfo = userInfoStore.userInfo;

// 查看审批的都是审批流中有当前用户的

const form = ref();
const dialogForm = ref();

const $refs = {
  form,
  dialogForm
};

const queryForm = ref({
  applyState: 1
});

// 定义动态表格-格式
const columns = [
  {
    label: "单号",
    prop: "orderNo",
  },
  {
    label: "申请人",
    prop: "",
    formatter (row) {
      return row.applyUser.userName;
    },
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

const pager = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

// 表单规则
const rules = {
  remark: [
    {
      required: true,
      message: "请输入审批备注",
      trigger: "change"
    },
  ],
};

// 申请列表
const applyList = ref([]);

const showDetailModal = ref(false);

const detail = ref({});

const auditForm = ref({
  remark: ''
});

// 加载审批列表
const getApplyList = async () => {
  const params = { ...queryForm.value, ...pager.value, type: "approve" };
  const { list, page } = await API.getApplyList(params);
  applyList.value = list;
  pager.value.total = page.total;
};

// 分页事件处理
const handleCurrentChange = (current) => {
  pager.value.pageNum = current;
  getApplyList();
};

const handleReset = (form) => {
  $refs[form].value.resetFields();
};

// 弹框关闭
const handleClose = () => {
  showDetailModal.value = false;
  handleReset("dialogForm");
};

const handleDetail = (row) => {
  const data = { ...row };
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

const handleApprove = (action) => {
  $refs.dialogForm.value.validate(async (valid) => {
    if (valid) {
      const params = {
        action,
        remark: auditForm.value.remark,
        _id: detail.value._id
      };
      try {
        await API.leaveApprove(params);
        handleClose();
        ElMessage.success('处理成功');
        getApplyList();
        userInfoStore.saveNoticeCount(userInfoStore.noticeCount - 1);
      } catch (error) {
        console.log(error);
      }
    }
  });
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
          <el-button @click="handleReset()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action"></div>
      <el-table :data="applyList">
        <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <!-- 处于待审批和审批中状态，分别对应第一审批人和第二审批人，他们分别在第一或第二阶段可以审批 -->
            <el-button size="small" @click="handleDetail(scope.row)" v-if="
              scope.row.curAuditUserName === userInfo.userName &&
              [1, 2].includes(scope.row.applyState)
            ">审核</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total"
        :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>
    <el-dialog title="审核" width="50%" v-model="showDetailModal" destroy-on-close>
      <el-form ref="dialogForm" :model="auditForm" label-width="120px" label-suffix=":" :rules="rules">
        <el-form-item label="申请人">
          <div>{{ detail.applyUser.userName }}</div>
        </el-form-item>
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
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :rows="3" placeholder="请输入审核备注" v-model="auditForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleApprove('pass')">审核通过</el-button>
          <el-button @click="handleApprove('refuse')" type="primary">驳回</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>