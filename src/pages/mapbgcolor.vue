<!-- 
  1. 展示GeoJSON 数据，并且给每个省份填充颜色
  2. 用蓝色的蚂蚁线把北京市圈出来 
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import 'ol/ol.css';
import { Feature, Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Fill, Stroke, Text } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import { XYZ } from 'ol/source';
import { Zoom, ZoomSlider } from 'ol/control'

// 定义地图引用
const map = ref<Map | null>(null);

// GeoJSON 数据源 URL，获取全国省份数据
const geoJsonUrl = 'https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=100000_full'; // 全部省
// const geoJsonUrl = 'https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=100000_full_city'; // 全部市


/**
 * 生成随机颜色
 * @returns 随机生成的十六进制颜色值
 */
const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

/**
 * 据省份名称生成样式
 * @param provinceName 省份名称
 */
const getProvinceStyle = (provinceName: string) => {
  return new Style({
    fill: new Fill({ color: getRandomColor() }), // 填充颜色为随机色
    stroke: new Stroke({ color: '#333', width: 1 }), // 边框颜色为深灰色，宽度为1像素
    text: new Text({
      text: provinceName, // 文本内容为省份名称
      fill: new Fill({ color: '#000' }), // 文本颜色为黑色
      font: 'bold 12px Arial', // 字体样式为加粗12px Arial
    }),
  });
};

/**
 * 高亮北京市的函数
 * @param features 地图上的所有特征
 */
const highlightBeijing = (features: Feature[]) => {
  let beijingFeature: Feature | null = null; // 初始化北京市特征变量

  // 遍历所有特征，查找北京市
  features.forEach((feature) => {
    const provinceName = feature.get('name') || '省份名称'; // 获取省份名称
    if (provinceName === '北京市') {
      beijingFeature = feature; // 找到北京市特征
    }
  });

  if (beijingFeature) {
    // 创建高亮北京市的样式
    const highlightStyle = new Style({
      stroke: new Stroke({
        color: 'red', // 红色边框
        width: 5, // 边框宽度为5像素
        lineDash: [4, 4], // 虚线效果（蚂蚁线）
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 255, 0.1)', // 浅蓝色填充，透明度为0.1
      }),
    });

    // 应用高亮样式到北京市特征
    (beijingFeature as Feature).setStyle(highlightStyle);
  }
};

// 页面挂载时执行的异步函数
onMounted(async () => {
  // 请求 GeoJSON 数据
  const response = await fetch(geoJsonUrl);
  const geoJsonResponse = await response.json();

  // 解析 GeoJSON 数据为 OpenLayers 特征
  const geoJsonData = new GeoJSON().readFeatures(geoJsonResponse, {
    featureProjection: 'EPSG:3857', // 设置特征投影
  });

  // 创建矢量数据源
  const vectorSource = new VectorSource({ features: geoJsonData });

  // 遍历所有特征，设置样式
  vectorSource.forEachFeature((feature) => {
    const provinceName = feature.get('name') || '省份名称'; // 获取省份名称
    feature.setStyle(getProvinceStyle(provinceName)); // 设置省份样式
  });

  // 高亮北京市
  highlightBeijing(vectorSource.getFeatures());

  // 创建地图实例
  map.value = new Map({
    target: 'map', // 地图容器ID
    layers: [
      new TileLayer({
        source: new XYZ({
          // url: 'http://192.168.111.97:8080/roadmap/{z}/{x}/{y}.png', // 本地地图瓦片URL
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', // 地图瓦片URL
        }),
      }),
      new VectorLayer({
        source: vectorSource, // 矢量数据源
      }),
    ],
    view: new View({
      center: [12000000, 4000000], // 地图中心坐标
      zoom: 4, // 地图缩放级别
    }),
    controls: [
      new Zoom(), // 缩放控件
      // new ZoomSlider(), // 滑动缩放控件

    ],
  });
});
</script>

<template>
  <!-- 地图容器 -->
  <div id="map" style="width: 100%; height: 100vh;"></div>
</template>