<template>
  <!-- 地图容器，设置高度为视口高度 -->
  <div id="map" style="height: 100vh;"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { Vector } from 'ol/source';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';

// 定义电子围栏的GeoJSON数据
const geojsonData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.404, 39.915],
            [116.405, 39.915],
            [116.405, 39.916],
            [116.404, 39.916],
            [116.404, 39.915]
          ]
        ]
      }
    }
  ]
};

// 定义地图实例的引用
const map = ref<Map | null>(null);
// 定义矢量图层的引用
const vectorLayer = ref<VectorLayer>();
// 定义GeoJSON数据源的引用
const geojsonSource = ref<Vector>();
// 定义点要素的引用
const pointFeature = ref<Feature>(); // 用于存储圆点的Feature

// 定义电子围栏的样式
const fenceStyle = new Style({
  fill: new Fill({
    color: 'rgba(253,121,168, 0.3)'  // 红色填充，透明度为 0.3
  }),
  stroke: new Stroke({
    color: '#6c5ce7',  // 紫色边框
    width: 3
  })
});

// 处理点击事件
const handleClick = (event: any) => {
  // 获取点击坐标
  const clickedCoordinate = event.coordinate;

  // 删除之前的圆点（如果存在）
  if (pointFeature.value) {
    geojsonSource.value?.removeFeature(pointFeature.value);
  }

  // 创建并添加新的圆点
  const point = new Point(clickedCoordinate);
  pointFeature.value = new Feature(point);
  
  // 设置圆点的样式
  pointFeature.value.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 8, // 圆的半径
        fill: new Fill({ color: 'red' }),
        stroke: new Stroke({
          color: 'black',
          width: 2
        })
      })
    })
  );

  // 将新的圆点添加到地图上
  geojsonSource.value?.addFeature(pointFeature.value);

  // 判断点击点是否在电子围栏内，并显示提示
  const polygon = geojsonSource.value?.getFeatures()[0]?.getGeometry();
  if (polygon && polygon.intersectsCoordinate(clickedCoordinate)) {
    setTimeout(() => {
      alert('在电子围栏内');
    }, 300);
  } else {
    alert('不在电子围栏内');
  }
};

// 在组件挂载后初始化地图
onMounted(() => {
  // 初始化 GeoJSON 数据
  geojsonSource.value = new Vector({
    features: new GeoJSON().readFeatures(geojsonData, {
      featureProjection: 'EPSG:3857',
    }),
  });

  // 为 GeoJSON 图层设置样式
  geojsonSource.value.forEachFeature((feature) => {
    feature.setStyle(fenceStyle);  // 设置围栏的样式
  });

  // 创建 Vector 图层
  vectorLayer.value = new VectorLayer({
    source: geojsonSource.value,
  });

  // 初始化地图
  map.value = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      vectorLayer.value,
    ],
    view: new View({
      center: fromLonLat([116.404, 39.915]), // 设置地图中心点
      zoom: 18, // 设置地图缩放级别
    }),
  });

  // 添加点击事件监听
  map.value.on('singleclick', handleClick);
});
</script>

<style scoped>
/* 设置地图容器的宽度和高度 */
#map {
  width: 100%;
  height: 100%;
}
</style>