<template>
  <div id="map" class="map" ref="mapRef"></div>
</template>

<script setup lang="ts">
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import { Style, Stroke, Fill, Text } from "ol/style";
import { fromLonLat } from "ol/proj";
import { onMounted, ref } from "vue";
import { ImageWMS } from "ol/source"
import ImageLayer from "ol/layer/Image"

const mapRef = ref<HTMLDivElement>();

// 1. 使用 Esri 在线卫星瓦片
const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", // Esri 卫星瓦片服务
  }),
});

// 2. 添加地物边界图层
const vectorSource = new VectorSource();
const boundaryFeature = new Feature({
  geometry: new Point(fromLonLat([0, 0])), // 示例位置
});

boundaryFeature.setStyle(
  new Style({
    text: new Text({
      text: "City Center", // 注记文本
      font: "bold 14px Arial",
      fill: new Fill({ color: "white" }),
      stroke: new Stroke({ color: "black", width: 3 }),
    }),
  })
);
vectorSource.addFeature(boundaryFeature);

const boundaryLayer = new VectorLayer({
  source: vectorSource,
  style: new Style({
    stroke: new Stroke({
      color: "yellow", // 边界线颜色
      width: 2,
    }),
  }),
});



onMounted(() => {
  const map = new Map({
    target: mapRef.value,
    layers: [satelliteLayer, boundaryLayer], // 叠加卫星和边界图层
    view: new View({
      center: fromLonLat([120.745841,23.074395]), // 地图中心
      zoom: 8, // 初始缩放级别
    }),
  });
});
</script>

<style scoped>
.map {
  filter: hue-rotate(270deg) brightness(0.8) saturate(1.5); /* 修改颜色 */
}

</style>
