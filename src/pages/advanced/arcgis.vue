<template>
  <div id="map" class="map" ref="mapRef"></div>
</template>

<script setup lang="ts">
import "ol/ol.css";
import { Map, View } from "ol";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { LineString } from "ol/geom";
import Feature from "ol/Feature";
import { Style, Stroke } from "ol/style";
import { fromLonLat } from "ol/proj";
import { onMounted, ref } from "vue";

const mapRef = ref();
const initMap = () => {
  const map = new Map({
    target: mapRef.value,
    layers: [],
    view: new View({
      center: fromLonLat([0, 0]), // 地图中心
      zoom: 2, // 缩放级别
    }),
  });

  // 创建一个简单的线（比如经纬度的两点之间）
  const line = new LineString([fromLonLat([0, 0]), fromLonLat([10, 10])]);

  // 创建 Feature
  const feature = new Feature({
    geometry: line,
  });

  // 创建点划线的样式
  const createDottedLineStyle = (opacity: number) =>
    new Style({
      stroke: new Stroke({
        color: `rgba(255, 255, 255, ${opacity})`, // 白色，动态变化透明度
        width: 4,
        lineDash: [10, 10], // 点划线效果
      }),
    });

  // 创建 VectorLayer
  const vectorSource = new VectorSource({
    features: [feature],
  });
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: createDottedLineStyle(1), // 初始透明度为 1
  });
  map.addLayer(vectorLayer);

  // 控制闪烁效果的透明度
  let opacity = 1;
  let fadeOut = true;

  // 定时器，控制闪烁效果
  setInterval(() => {
    opacity = fadeOut ? opacity - 0.1 : opacity + 0.1;
    if (opacity <= 0 || opacity >= 1) {
      fadeOut = !fadeOut; // 切换方向
    }

    // 更新样式的透明度
    vectorLayer.setStyle(createDottedLineStyle(opacity));
  }, 100); // 每 100 毫秒更新一次
};

onMounted(() => {
  initMap();
});
</script>

<style scoped>
.map {
  width: 100%;
  height: 100vh;
}
</style>
