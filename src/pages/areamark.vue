<!-- 根据GeoJson 数据添加3个标注点 -->

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Text } from 'ol/style';
import { Feature } from 'ol';
import geojsonData from '@/assets/json/beijing.geojson.json'
import { XYZ } from 'ol/source'

const map = ref<Map | null>(null);


/**
 * 根据类型创建不同的样式
 * @param category - 点的类型
 * @param categoryName - 点的名称
 */
const getCategoryStyle = (category: string, categoryName: string) => {
  const styles: Record<string, Style> = {
    hospital: new Style({
      text: new Text({
        text: categoryName,
        fill: new Fill({ color: '#ffffff' }),
        backgroundFill: new Fill({ color: '#ff0000' }),
        padding: [3, 3, 3, 3],
        font: 'bold 14px sans-serif'
      })
    }),
    school: new Style({
      text: new Text({
        text: categoryName,
        fill: new Fill({ color: '#ffffff' }),
        backgroundFill: new Fill({ color: '#0000ff' }),
        padding: [3, 3, 3, 3],
        font: 'bold 14px sans-serif'
      })
    }),
    park: new Style({
      text: new Text({
        text: categoryName,
        fill: new Fill({ color: '#ffffff' }),
        backgroundFill: new Fill({ color: '#7158e2' }),
        padding: [3, 3, 3, 3],
        font: 'bold 14px sans-serif'
      })
    })
  };

  return styles[category] || new Style();
};

onMounted(() => {
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(geojsonData, {
      featureProjection: 'EPSG:3857'
    })
  });

  vectorSource.forEachFeature((feature: Feature) => {
    const category = feature.get('type');
    const categoryName = feature.get('name');
    feature.setStyle(getCategoryStyle(category, categoryName));
  });

  map.value = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'http://192.168.111.97:8080/roadmap/{z}/{x}/{y}.png', // 修改为你的本地瓦片地址
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
