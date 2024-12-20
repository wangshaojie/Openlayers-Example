<template>
  <div>
    <button @click="addPoint">添加随机点</button>
    <div id="map" ref="mapContainer"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer } from "ol/layer";
import { OSM } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Point } from "ol/geom";
import { Feature } from "ol";
import { Style, Icon } from "ol/style";
import { fromLonLat } from "ol/proj";

// 定义响应式状态
const state = reactive({
  map: null as Map | null,
  vectorSource: new VectorSource(),
  points: [
    { lon: -0.1276, lat: 51.5074 }, // 初始点（伦敦）
  ],
});

// 地图容器的引用
const mapContainer = ref<HTMLDivElement | null>(null);

// 添加点的功能
const addPoint = () => {
  const lon = -0.1276 + (Math.random() - 0.5); // 随机经度
  const lat = 51.5074 + (Math.random() - 0.5); // 随机纬度
  const newPoint = { lon, lat };

  state.points.push(newPoint);

  // 创建新点的 Feature
  const feature = new Feature({
    geometry: new Point(fromLonLat([lon, lat])),
  });

  // 设置点的样式
  feature.setStyle(
    new Style({
      image: new Icon({
        src: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // 图标链接
        scale: 0.05,
      }),
    })
  );

  // 添加到向量图层
  state.vectorSource.addFeature(feature);
};

// 初始化地图
onMounted(() => {
  if (mapContainer.value) {
    const map = new Map({
      target: mapContainer.value,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: state.vectorSource,
        }),
      ],
      view: new View({
        center: fromLonLat([-0.1276, 51.5074]), // 初始中心点（伦敦）
        zoom: 10,
      }),
    });

    // 保存地图实例
    state.map = map;

    // 初始化点数据
    state.points.forEach((point) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([point.lon, point.lat])),
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            scale: 0.05,
          }),
        })
      );

      state.vectorSource.addFeature(feature);
    });
  }
});
</script>
