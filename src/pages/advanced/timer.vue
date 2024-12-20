<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import { fromLonLat } from 'ol/proj';

// 核心功能：在地图上动态渲染一组灯光点，能够根据定时器自动切换灯光状态，并实时更新样式。
// 实现思路：结合 Vue 的响应式管理与 OpenLayers 的地图功能，使用定时器控制灯光状态的变化，并通过 watch 动态响应状态更新。
// 资源管理：通过清理定时器保证了组件的稳定性，避免了潜在的内存泄漏问题。

// 灯光点的初始位置（定义为常量）
const lightPositions = [
  [121.794227, 31.144642], // 浦东机场位置
  [121.794609, 31.143626],
  [121.795069, 31.142578],
  [121.797825, 31.135206],
  [121.797212, 31.136811],
  [121.796676, 31.138253],
  [121.821557, 31.14605],
  [121.82217, 31.14451],
  [121.823395, 31.140939],
  [121.824888, 31.137172],
  [121.826266, 31.133207],
];

// 定义灯光状态（与灯光点数量一致）
const lightsStatus = ref<boolean[]>(Array(lightPositions.length).fill(false));

// 切换灯光状态的函数（每隔一定时间切换灯光状态）
const toggleLightsStatus = () => {
  lightsStatus.value = lightsStatus.value.map(status => !status); // 切换每个灯光的状态
};

// 每1分钟调用一次切换灯光状态
const toggleInterval = setInterval(toggleLightsStatus, 10000); // 1分钟（60,000 毫秒）

// 初始化地图相关引用
const map = ref<Map | null>(null);
const vectorSource = new VectorSource(); // 创建一个矢量图层 (VectorLayer) 和矢量数据源 (VectorSource) 用于存放灯光点。
const vectorLayer = new VectorLayer({ source: vectorSource });
const lightFeatures = ref<Feature[]>([]);

onMounted(() => {
  // 初始化地图
  map.value = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        }),
      }),
      vectorLayer,
    ],
    view: new View({
      center: fromLonLat([121.8053, 31.1443]), // 浦东机场的坐标
      zoom: 15,
    }),
  });

  // 创建灯光点特征并添加到地图
  lightPositions.forEach((position, index) => {
    const feature = new Feature(new Point(fromLonLat(position)));
    feature.setStyle(createLightStyle(lightsStatus.value[index]));
    lightFeatures.value.push(feature);
  });

  // 添加所有灯光点到矢量图层
  vectorSource.addFeatures(lightFeatures.value);
});

// 响应灯光状态变化，更新灯光样式
watch(lightsStatus, (newStatuses) => {
  lightFeatures.value.forEach((feature, index) => {
    feature.setStyle(createLightStyle(newStatuses[index]));
  });
});

// 创建灯光样式的函数（避免重复代码）
const createLightStyle = (isOn: boolean) =>
  new Style({
    image: new Circle({
      radius: 10,
      fill: new Fill({
        color: isOn ? 'yellow' : 'gray', // 亮灯为黄色，熄灭为灰色
      }),
      stroke: new Stroke({
        color: 'black',
        width: 2,
      }),
    }),
  });

// 清除定时器（防止组件销毁后仍在运行）
onUnmounted(() => {
  clearInterval(toggleInterval);
});
</script>

<style>
#map {
  width: 100%;
  height: 100vh;
}
</style>