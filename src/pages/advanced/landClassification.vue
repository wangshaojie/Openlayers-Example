<template>
  <div id="map" class="map"></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import Map from "ol/Map.js";
import View from "ol/View.js";
import GeoJSON from "ol/format/GeoJSON.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import TileLayer from "ol/layer/Tile.js";
import XYZ from "ol/source/XYZ.js";
import { Fill, Stroke, Style } from "ol/style.js";
import { fromLonLat } from "ol/proj.js";
import landClassificationGeo from "@/assets/json/110000.geojson.json";

// 定义类型与颜色的映射
const fillColors: Record<string, number[]> = {
  park: [0, 255, 0, 0.5], // 绿色
  military: [128, 128, 128, 0.5], // 灰色
  commercial: [255, 165, 0, 0.5], // 橙色
  recreation_ground: [255, 0, 0, 0.5], // 红色
  residential: [173, 216, 230, 0.5], // 浅蓝
  retail: [255, 255, 0, 0.5], // 黄色
  forest: [34, 139, 34, 0.5], // 森林绿
  industrial: [169, 169, 169, 0.5], // 深灰
  grass: [124, 252, 0, 0.5], // 草地绿
};

// 根据类型设置样式
const getStyle = (fclass: string | undefined) => {
  const color = fillColors[fclass || ""] || [255, 255, 255, 0]; // 默认透明
  return new Style({
    fill: new Fill({
      color,
    }),
    stroke: new Stroke({
      color: [0, 0, 0, 1], // 黑色边框
      width: 1,
    }),
  });
};

onMounted(() => {
  // 创建底图图层（中国地图）
  const tileLayer = new TileLayer({
    source: new XYZ({
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", // 使用 OpenStreetMap 作为底图
    }),
  });

  // 加载本地 GeoJSON 数据
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(landClassificationGeo, {
      featureProjection: 'EPSG:3857'
    })
  });

  // 创建矢量图层并根据属性设置样式
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: (feature) => {
      const fclass = feature.get("fclass"); // 获取属性字段 fclass
      return getStyle(fclass); // 根据 fclass 设置样式
    },
  });

  // 创建地图
  new Map({
    target: "map", // 与模板中的 div id 匹配
    layers: [tileLayer, vectorLayer], // 添加图层
    view: new View({
      center: fromLonLat([116.391365,39.929944]), // 中国地图中心坐标（经纬度）
      zoom: 12, // 初始缩放级别
      
    }),
  });
});
</script>
