<!-- 根据GeoJson 数据动态添加标注点 -->

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke, Text } from 'ol/style';
import { Feature } from 'ol';
import geojsonData from '@/assets/json/beijing.geojson.json'

const map = ref<Map | null>(null);


const styleCache: { [key: string]: Style } = {};

const getCategoryStyle = (category: string) => {
  // 如果样式已经缓存，直接返回
  if (styleCache[category]) {
    return styleCache[category];
  }

  // 动态生成样式
  const style = new Style({
    text: new Text({
      text: category,
      fill: new Fill({ color: '#ffffff' }),
      backgroundFill: new Fill({ color: getRandomColor() }), // 随机背景色
      padding: [3, 3, 3, 3],
      font: 'bold 14px sans-serif'
    })
  });

  // 缓存样式
  styleCache[category] = style;
  return style;
};

// 随机生成背景色
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

onMounted(() => {
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(geojsonData, {
      featureProjection: 'EPSG:3857'
    })
  });

  vectorSource.forEachFeature((feature: Feature) => {
    const category = feature.get('type');
    feature.setStyle(getCategoryStyle(category));
  });

  map.value = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', // 修改为你的本地瓦片地址
          // url: 'http://192.168.111.97:8080/roadmap/{z}/{x}/{y}.png', // 修改为你的本地瓦片地址
          tileSize: 256
        })
      }),
      new VectorLayer({
        source: vectorSource
      })
    ],
    view: new View({
      center: [12969264, 4862900], // 根据实际中心点调整
      zoom: 12
    })
  });
});
</script>

<template>
  <div id="map" style="width: 100%; height: 100vh;"></div>
</template>
