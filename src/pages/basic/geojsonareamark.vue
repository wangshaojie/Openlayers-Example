<script setup lang="ts">
import { ref, onMounted } from 'vue';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import { OSM, XYZ } from 'ol/source';
import geoJsonUrl from '@/assets/json/longjinyuan.json';  // 你的GeoJSON文件路径
import { fromLonLat } from 'ol/proj';  // 用于转换坐标系
import coordtransform from 'coordtransform';
 
const map = ref<Map | null>(null);

// 定义线条样式：蓝色线条
const blueLineStyle = new Style({
  stroke: new Stroke({
    color: 'blue',   // 设置线条颜色为蓝色
    width: 2,        // 设置线条宽度为2像素
  }),
});


/**
 * 
 * @param geoJson 
 */
function convertGeoJsonToGcj02(geoJson) {
  // 遍历GeoJSON中的每个特征
  geoJson.features.forEach(feature => {
    // 遍历每个几何对象
    if (feature.geometry && feature.geometry.type === 'LineString') {
      // 转换LineString的坐标
      feature.geometry.coordinates = feature.geometry.coordinates.map(coord => {
        // 使用coordtransform库进行坐标转换
        return coordtransform.wgs84togcj02(coord[0], coord[1]);
      });
    }
    // 如果GeoJSON中包含其他类型的几何对象（如Point, Polygon等），您也需要相应地处理它们
  });
  return geoJson;
}
var convertedGeoJson = convertGeoJsonToGcj02(geoJsonUrl);



onMounted(async () => {
  // 加载瓦片地图
  const tileLayer = new TileLayer({
    source: new XYZ({
      url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}', // 高德瓦片地图URL
    }),
        // source: new OSM(), // 使用 OSM 数据源
  });

  const geoJsonFormat = new GeoJSON();

  // 解析 GeoJSON 数据
  const geoJsonData = geoJsonFormat.readFeatures(convertedGeoJson, {
    featureProjection: 'EPSG:3857', // 将坐标投影转换为 EPSG:3857
  });

  // 创建一个 VectorSource 并将解析后的特征添加到源中
  const vectorSource = new VectorSource({
    features: geoJsonData,
  });

  // 创建一个 VectorLayer 来展示 GeoJSON 数据
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: blueLineStyle, // 设置线条的样式为蓝色
  });

  // 创建地图实例
  map.value = new Map({
    target: 'map', // 指定地图容器的 DOM 元素 ID
    layers: [tileLayer, vectorLayer], // 加载瓦片地图和矢量图层
    view: new View({
      center: fromLonLat([116.374469,40.083397]), // 初始地图中心点，适应你的数据
      projection: 'EPSG:3857',
      zoom: 18,  // 初始缩放级别
    }),
  });
});
</script>

<template>
  <div id="map" style="width: 100%; height: 100vh;"></div>
</template>
