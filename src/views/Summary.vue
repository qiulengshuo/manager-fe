<script setup>
import { onMounted, ref, nextTick } from 'vue';
import * as echarts from 'echarts';
import API from "../api";
import { ElMessage } from 'element-plus';

const chart = ref();

const type = ref('course');
const deptList = ref([]);
const deptId = ref();
const comments = ref('');
const showChart = ref(false);
const cascader = ref();

let chartObj = null;

const getDeptList = async () => {
  try {
    const list = await API.getDeptList();
    deptList.value = list;

  } catch (error) {
    ElMessage.error('获取教学层级列表失败!');
  }
};

const changeCategory = () => {
  chartObj && chartObj.clear();
  deptId.value = undefined;
  showChart.value = false;
};

const barChar = (data) => {
  const node = (cascader.value.getCheckedNodes())[0];
  const title = `${node.label}下各个${type.value === 'course' ? '课程' : '专业'}对比`;
  const xName = []; // ''
  const yType = 'value'; // ''
  const xData = [];  // xxx

  for (const item of data) {
    xName.push(item.assessmentName.split("-")[1]);
    const assessmentResult = item.assessmentResult;
    let sum = 0;
    for (const assessment of assessmentResult) {
      sum += +((assessment.standardWeight * assessment.score / 100).toFixed(2));
    }
    xData.push(sum);
  }

  chartObj.setOption({
    title: {
      text: title
    },
    xAxis: {
      type: 'category',
      data: xName
    },
    yAxis: {
      type: yType,
      min: 0,
      max: 100
    },
    series: [
      {
        data: xData,
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        },
        label: { // 展示具体柱状图的数值
          show: true,
          position: 'top'
        }
      }
    ],

  });
};

const radarChar = (data) => {
  const title = data.assessmentName.split("-")[1];
  const indicator = []; // { name: xxx, max: 100 }
  const actualTotal = []; // xxx
  const total = []; /// 100*n

  const assessmentResult = data.assessmentResult;
  for (const assessment of assessmentResult) {
    indicator.push({
      name: assessment.standardName,
      max: 100
    });
    actualTotal.push(assessment.score);
    total.push(100);
  }

  comments.value = data.comments;

  chartObj.setOption({
    title: {
      text: title
    },
    legend: {
      data: ['各项满分', '实际得分']
    },
    radar: {
      indicator
    },
    series: [
      {
        name: 'total vs actual',
        type: 'radar',
        data: [
          {
            value: total,
            name: '各项满分'
          },
          {
            value: actualTotal,
            name: '实际得分'
          }
        ]
      }
    ]
  });
};

const change = async (e) => {
  chartObj && chartObj.clear();
  if (!e) return;
  // 分类 -> 总的 -> 细的
  let parentId;
  // 默认细的
  let curDeptId = e[e.length - 1];
  if (type.value === 'course') {
    if (e.length === 2) {
      // 总的
      parentId = curDeptId;
      curDeptId = null;
    } else if (e.length === 3) {
      // 细的
      parentId = null;
    } else {
      showChart.value = false;
      ElMessage.info('请选择专业或课程');
      return;
    }
  } else {
    if (e.length === 1) {
      // 总的
      parentId = curDeptId;
      curDeptId = null;
    } else if (e.length === 2) {
      // 细的
      parentId = null;
    } else {
      ElMessage.info('请选择学院或专业');
      return;
    }
  }
  // 查询评估结果
  const params = {
    deptId: parentId ? parentId : curDeptId,
    action: parentId ? 'all' : 'single'
  };
  const res = await API.getAssessmentResult(params);
  if (res.list.length === 0) {
    showChart.value = false;
    ElMessage.error('此项尚未评估');
    return;
  }
  if (!showChart.value) {
    showChart.value = true;
  }
  nextTick(() => {
    if (!chartObj) {
      chartObj = echarts.init(chart.value);
    }
    if (parentId) {
      barChar(res.list);
    } else {
      radarChar(res.list[0]);
    }
    if (res.msg === 'leak') {
      ElMessage.info(`有${type.value === 'course' ? '课程' : '专业'}缺少评估`);
    }
  });
};

onMounted(() => {
  getDeptList();
})

</script>

<template>
  <div class="summary">
    <div class="query-form radio-group">
      <el-radio-group v-model="type" @change="changeCategory">
        <el-radio label="course" size="default">课程评估总结</el-radio>
        <el-radio label="majors" size="default">专业评估总结</el-radio>
      </el-radio-group>
    </div>
    <div class="base-table">
      <div class="action">
        <el-cascader ref="cascader" style="width: 200px;" @change="change" v-model="deptId"
          :placeholder="type === 'course' ? '请选择专业或课程' : '请选择学院或专业'" :options="deptList"
          :props="{ checkStrictly: true, value: '_id', label: 'deptName' }" clearable></el-cascader>
      </div>


      <el-empty v-show="!showChart" description="请选择课程或专业" />

      <div v-show="showChart" ref="chart" class="chart"></div>
      <div
        v-show="showChart && ((type === 'course' && deptId.length === 3) || (type === 'majors' && deptId.length === 2))"
        class="footer">
        <div>评语: </div>
        <el-input :rows="3" disabled type="textarea" v-model="comments" placeholder="老师或专家评语" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.summary {
  height: 100%;
}

.radio-group {
  padding-bottom: 22px;
}

.chart {
  margin: 20px auto;
  width: 600px;
  height: 520px;
}

.base-table {
  height: calc(100% - 96px);
  overflow: auto;
}

.footer {
  padding: 10px 20px;
  font-size: 13px;
  color: #606266;

  div:first-child {
    margin-bottom: 10px;
  }
}
</style>