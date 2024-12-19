<template>
  <div ref="mapContainer" class="map-container" id="map"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector } from "ol/source";
import { Point } from "ol/geom";
import { Feature } from "ol";
import { Cluster } from "ol/source";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { fromLonLat } from "ol/proj";

// 引用地图容器的 DOM 元素
const mapContainer = ref<HTMLElement | null>(null);

// 模拟的上海市长宁区男女比例数据
interface PointData {
  id: number;
  longitude: number;
  latitude: number;
  gender: "male" | "female";
}

const pointsData: PointData[] = [];
const numPoints: number = 50000; // 定义要生成的数据数量

for (let i = 0; i < numPoints; i++) {
  const id: number = i + 1;
  // 模拟上海市长宁区大致经纬度范围（可根据实际情况调整范围更精准）
  const longitude: number = 121.4 + Math.random() * 0.05;
  const latitude: number = 31.2 + Math.random() * 0.05;
  const gender: "male" | "female" = Math.random() < 0.5 ? "male" : "female";
  pointsData.push({
    id,
    longitude,
    latitude,
    gender,
  });
}

// 创建地图
const createMap = () => {
  if (!mapContainer.value) return;

  // 创建基础地图层
  const map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: fromLonLat([121.4203, 31.2202]), // 上海市长宁区的中心点
      zoom: 14,
    }),
  });

  // 创建一个矢量图层源，并使用 Cluster 聚合
  const clusterSource = new Cluster({
    distance: 40, // 聚合的距离，单位：像素
    source: new Vector({
      features: pointsData.map((point) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([point.longitude, point.latitude])),
        });
        feature.setId(point.id);
        feature.set("gender", point.gender); // 保存性别信息，供样式使用

        return feature;
      }),
    }),
  });

  // 聚合点的样式
  const clusterLayer = new VectorLayer({
    source: clusterSource,
    style: function (feature) {
      const size = feature.get("features").length; // 获取聚合点中包含的原始点数量
      // const zoom = map.getView().getZoom(); // 获取当前地图的缩放级别

      let genderColor = "gray"; // 默认颜色
      const features = feature.get("features");

      // 计算聚合点内男女的比例，选择主色
      let maleCount = 0;
      let femaleCount = 0;
      features.forEach((f: Feature) => {
        if (f.get("gender") === "male") maleCount++;
        else femaleCount++;
      });

      // 如果男女比例有明显差异，使用男性或女性颜色
      if (maleCount > femaleCount) {
        genderColor = "blue"; // 男性占多数，使用蓝色
      } else if (femaleCount > maleCount) {
        genderColor = "red"; // 女性占多数，使用红色
      }

      // 根据地图的缩放级别来动态调整聚合点的大小
      // console.log(zoom);
      // const radius = Math.max(10, size * 2 + zoom); // 半径随着聚合点数量和缩放级别变化
      const style = new Style({
        image: new Circle({
          radius: 10, // 根据聚合点数量和缩放级别调整半径
          fill: new Fill({
            color: genderColor, // 使用聚合点内男女比例的颜色
          }),
          stroke: new Stroke({
            color: "white",
            width: 2,
          }),
        }),
        text: new Text({
          text: size.toString(), // 聚合点上显示的数量
          font: "bold 12px Arial",
          fill: new Fill({
            color: "white",
          }),
          stroke: new Stroke({
            color: "black",
            width: 3,
          }),
        }),
      });

      return style;
    },
  });

  // 添加聚合图层到地图
  map.addLayer(clusterLayer);


   // 监听缩放级别变化
   map.getView().on('change:resolution', () => {
    const currentZoom = map.getView().getZoom();
    console.log("当前缩放级别变化:", currentZoom);
  });
};



// 在组件挂载时创建地图
onMounted(() => {
  createMap();
});
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
