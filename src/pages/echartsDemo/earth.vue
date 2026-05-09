<template>
  <div ref="target" class="w-full h-full" style="width: 400px; height: 400px;"></div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import * as echarts from "echarts";


const target = ref(null);
let mChart = null;

onMounted(() => {
  mChart = echarts.init(target.value);
  renderChart();
});

const renderChart = () => {
  let options = {
    // 时间线，提供了在多个 ECharts option 间进行切换
    timeline: {
      // 数据
      data: ["2015-06-01", "2015-06-02", "2015-06-03", "2015-06-04"],
      // 类目轴
      axisType: "category",
      // 自动切换
      autoPlay: true,
      // 间隔时间
      playInterval: 3000,
      // 位置
      left: "10%",
      right: "10%",
      bottom: "0%",
      width: "80%",
      // 轴的文本标签
      label: {
        // 默认状态
        normal: {
          textStyle: {
            color: "#ddd",
          },
        },

        // 高亮状态
        emphasis: {
          textStyle: {
            color: "#fff",
          },
        },
      },

      // 文字大小
      symbolSize: 10,
      // 线的样式
      lineStyle: {
        color: "#555",
      },

      // 选中点的样式
      checkpointStyle: {
        borderColor: "#888",
        borderWidth: 2,
      },

      // 控件样式
      controlStyle: {
        // 上一步按钮
        showNextBtn: true,
        // 下一步按钮
        showPrevBtn: true,
        // 默认样式
        normal: {
          color: "#666",
          borderColor: "#666",
        },

        // 高亮样式
        emphasis: {
          color: "#aaa",
          borderColor: "#aaa",
        },
      },
    },
  };

  mChart.setOption(options);
};
</script>
