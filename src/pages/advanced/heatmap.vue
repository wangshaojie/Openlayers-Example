<template>
  <!-- 地图容器 -->
  <div id="map" class="map" ref="mapContainer"></div>
</template>

<script setup lang="ts">
import "ol/ol.css"; // 引入 OpenLayers 的样式文件
import { Map, View } from "ol"; // 导入 OpenLayers 的 Map 和 View 类
import HeatmapLayer from "ol/layer/Heatmap"; // 导入热力图层
import VectorSource from "ol/source/Vector"; // 导入矢量数据源
import GeoJSON from "ol/format/GeoJSON"; // 导入 GeoJSON 解析器
import { onMounted, ref } from "vue"; // 导入 Vue 的生命周期钩子和响应式引用
import { XYZ } from "ol/source"; // 导入 XYZ 图层源
import TileLayer from "ol/layer/Tile"; // 导入瓦片图层
import { fromLonLat } from "ol/proj"; // 导入坐标转换函数

// 声明一个响应式引用，用于获取地图容器元素
const mapContainer = ref<HTMLDivElement | null>(null);

// 热力图数据（示例 GeoJSON）
const geojsonData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [116.337302, 39.944158] },
      properties: { weight: 1 }, // 点的权重
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [116.321269, 39.907692] },
      properties: { weight: 2 }, // 点的权重
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [116.396841, 39.92347] },
      properties: { weight: 3 }, // 点的权重
    },
  ],
};

// 创建 Vector Source，用于存储热力图的数据点
const vectorSource = new VectorSource({
  features: new GeoJSON().readFeatures(geojsonData, {
    featureProjection: "EPSG:3857", // 将数据点投影到 Web Mercator 坐标系
  }),
});

// 创建热力图层
const heatmapLayer = new HeatmapLayer({
  source: vectorSource, // 使用上面创建的矢量数据源
  weight: (feature) => feature.get("weight") || 1, // 根据属性“weight”调整热力权重
  blur: 15, // 模糊半径，值越大越模糊
  radius: 8, // 热力点半径，值越大点的范围越大
});

// 初始化地图的函数
const initMap = () => {
  if (!mapContainer.value) {
    return; // 如果没有获取到地图容器元素，则不初始化地图
  }

  // 创建地图实例
  new Map({
    target: mapContainer.value, // 绑定地图容器元素
    layers: [
      // 添加底图图层
      new TileLayer({
        source: new XYZ({
          url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}", // 高德地图的瓦片 URL
        }),
      }),
      heatmapLayer, // 添加热力图层
    ],
    view: new View({
      center: fromLonLat([116.357161, 39.914953]), // 设置地图中心点坐标
      zoom: 12, // 设置初始缩放级别
    }),
  });
};

// 在组件挂载后调用初始化地图的函数
onMounted(() => {
  initMap();
});
</script>

<style scoped>
/* 地图容器的样式 */
.map {
  width: 100%; /* 宽度占满父容器 */
  height: 100vh; /* 高度占满整个视口高度 */
}
</style>