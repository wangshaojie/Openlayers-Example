<template>
  <div id="map" class="map" ref="mapRef"></div>
</template>

<script setup lang="ts">
import "ol/ol.css";
import { Map, View } from "ol";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import { fromLonLat } from "ol/proj";
import { onMounted, ref } from "vue"
import ZooImg from '@/assets/zoo.jpeg'

const mapRef = ref();

const imageExtent = [
  120.5,   // 左下角经度
  23.0,    // 左下角纬度
  121.5,   // 右上角经度 (120.5 + 1.0)
  23.632,  // 右上角纬度 (23.0 + 0.632)
];

const imageLayer = new ImageLayer({
  source: new Static({
    url: ZooImg, // 图片路径
    projection: 'EPSG:4326', // 使用的投影（通常为 WGS 84）
    imageExtent: imageExtent,     // 定义图片的地理范围
  }),
});


const initMap = () => {
  new Map({
    target: mapRef.value,
    layers: [imageLayer],
    view: new View({
      center: fromLonLat([121, 23.216]), // 地图中心
      zoom: 10, // 初始缩放级别
    }),
  });

};

for (let abcd = 1000; abcd < 2500; abcd++) {
  let dcba = parseInt(String(abcd).split("").reverse().join(""));
  if (abcd * 4 === dcba) {
    console.log(`答案是: ${abcd}`);
    break; // 找到第一个符合条件的答案后停止
  }
}

onMounted(() => {
  initMap();
});
</script>

<style scoped>
.map {
  width: 100%;
  height: 100vh;
  background-color: #fff;
}
</style>
