<template>
  <div id="map" style="width: 100%; height: 100vh;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceXYZ from 'ol/source/XYZ';
import OlOverlay from 'ol/Overlay';

import * as echarts from 'echarts';
import { fromLonLat } from 'ol/proj';

// 地图实例引用
const map = ref<OlMap | null>(null);

// 创建地图的函数
const createMap = () => {
  const baseLayer = new OlLayerTile({
    source: new OlSourceXYZ({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    }),
  });

  const view = new OlView({
    center: fromLonLat([121.47, 31.23]), // 上海大致经纬度坐标
    zoom: 10,
  });

  map.value = new OlMap({
    layers: [baseLayer],
    target: 'map',
    view,
  });
};

// 通用函数：在指定位置添加 ECharts 图表
const addEchartsOverlay = (
  coords: number[],
  chartOption: echarts.EChartsOption,
  size: { width: string; height: string } = { width: '200px', height: '200px' }
) => {
  if (coords.length !== 2) {
    console.error('坐标必须包含两个元素');
    return;
  }

  // 创建图表容器
  const chartDiv = document.createElement('div');
  chartDiv.style.width = size.width;
  chartDiv.style.height = size.height;

  // 初始化 ECharts 图表
  const chart = echarts.init(chartDiv);
  chart.setOption(chartOption);

  // 创建 Overlay 并设置位置
  const overlay = new OlOverlay({
    element: chartDiv,
    positioning: 'center-center',
  });

  overlay.setPosition(fromLonLat(coords as [number, number]));
  map.value?.addOverlay(overlay);
};

// 在地图加载后添加多个不同类型的图表
onMounted(() => {
  createMap();

  // 图表数据和配置
  const chartsData = [
    {
      coords: [121.47, 31.23], // 上海
      option: {
        title: { text: '柱状图示例', left: 'center' },
        xAxis: { type: 'category', data: ['A', 'B', 'C', 'D'] },
        yAxis: { type: 'value' },
        series: [
          {
            data: [20, 30, 40, 50],
            type: 'bar',
          },
        ],
      },
    },
    {
      coords: [120.62, 31.32], // 苏州
      option: {
        title: { text: '饼图示例', left: 'center' },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: [
              { value: 40, name: '类别A' },
              { value: 30, name: '类别B' },
              { value: 30, name: '类别C' },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      },
    },
    {
      coords: [120.15, 30.28], // 杭州
      option: {
        title: { text: '折线图示例', left: 'center' },
        xAxis: { type: 'category', data: ['一月', '二月', '三月', '四月'] },
        yAxis: { type: 'value' },
        series: [
          {
            data: [820, 932, 901, 934],
            type: 'line',
            areaStyle: {
              color: 'rgba(255,87,34,1)', // 折线下方区域填充色
            },
          },
        ],
      },
    },
  ];

  // 遍历数组，动态添加不同类型的图表
  chartsData.forEach(({ coords, option }) => {
    addEchartsOverlay(coords, option);
  });
});
</script>