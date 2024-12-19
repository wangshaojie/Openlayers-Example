<template>
  <button @click="resetMarkers">重置标记点</button>
  <div id="map" ref="mapContainer"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import "ol/ol.css"; // 引入 OpenLayers 的样式
import Map from "ol/Map"; // 导入地图类
import View from "ol/View"; // 导入视图类
import TileLayer from "ol/layer/Tile"; // 导入瓦片图层类
import OSM from "ol/source/OSM"; // 导入 OSM 数据源
import VectorLayer from "ol/layer/Vector"; // 导入矢量图层类
import VectorSource from "ol/source/Vector"; // 导入矢量数据源类
import Feature from "ol/Feature"; // 导入特征类
import Point from "ol/geom/Point"; // 导入点几何类
import LineString from "ol/geom/LineString"; // 导入线几何类
import { Style, Stroke, Icon } from "ol/style"; // 导入样式类
import Collection from "ol/Collection"; // 导入集合类
import Translate from "ol/interaction/Translate"; // 导入平移交互类
import { XYZ } from "ol/source"; // 导入 XYZ 数据源
import { fromLonLat } from "ol/proj"; // 导入经纬度转换函数
import Select from "ol/interaction/Select";
import DragBox from "ol/interaction/DragBox";
import { platformModifierKeyOnly } from "ol/events/condition";

// 定义地图容器的引用
const mapContainer = ref<HTMLElement | null>(null);

// 定义地图对象
let map: Map;

// 定义两个标记点的特征
let marker1Feature: Feature<Point>;
let marker2Feature: Feature<Point>;

// 定义连线的特征
let lineFeature: Feature<LineString>;

// 定义线的样式
const lineStyle = new Style({
  stroke: new Stroke({ color: "#cc0033", width: 3 }), // 设置线的颜色和宽度
});

// 定义标记点的样式
const styleMarker = new Style({
  image: new Icon({
    scale: 0.7, // 图标缩放比例
    anchor: [0.5, 1], // 图标的锚点位置
    src: "//raw.githubusercontent.com/jonataswalker/map-utils/master/images/marker.png", // 图标的 URL
  }),
});

// 定义两个标记点的坐标
const coord1 = fromLonLat([116.397216, 39.91921]); // 北京市某地点的经纬度
const coord2 = fromLonLat([116.414725, 39.955011]); // 北京市另一地点的经纬度

// 初始化地图的方法
const initMap = () => {
  // 创建第一个标记点的几何对象
  const marker1 = new Point(coord1);
  // 创建第一个标记点的特征对象
  marker1Feature = new Feature(marker1);

  // 创建第二个标记点的几何对象
  const marker2 = new Point(coord2);
  // 创建第二个标记点的特征对象
  marker2Feature = new Feature(marker2);

  // 创建连接两个标记点的线的几何对象
  const line = new LineString([coord1, coord2]);
  // 创建连接两个标记点的线的特征对象
  lineFeature = new Feature(line);

  // 创建矢量数据源，并添加所有特征
  const vectorSource = new VectorSource({
    features: [lineFeature, marker1Feature, marker2Feature],
  });

  // 创建矢量图层，并设置样式
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: [lineStyle, styleMarker],
  });

  // 创建地图对象，并设置目标容器、图层和视图
  map = new Map({
    target: mapContainer.value!, // 地图容器的 DOM 元素
    layers: [
      // new TileLayer({
      //   source: new OSM(), // 使用 OSM 数据源
      // }),
      new TileLayer({
        source: new XYZ({
          url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}", // 高德地图瓦片 URL
        }),
      }),
      vectorLayer, // 添加矢量图层
    ],
    interactions: [
      //交互
      new Select(), //选择
      new DragBox({
        condition: platformModifierKeyOnly,
      }), //画框
    ],
    view: new View({
      center: fromLonLat([116.397216, 39.919473]), // 设置地图中心点
      zoom: 13, // 设置地图缩放级别
    }),
  });

  // 创建第一个标记点的平移交互对象
  const translate1 = new Translate({
    features: new Collection([marker1Feature]), // 指定可平移的特征
  });

  // 创建第二个标记点的平移交互对象
  const translate2 = new Translate({
    features: new Collection([marker2Feature]), // 指定可平移的特征
  });

  // 记录第一个标记点的初始坐标
  let coordMarker1 = coord1;
  // 记录第二个标记点的初始坐标
  let coordMarker2 = coord2;

  // 监听第一个标记点的平移开始事件
  translate1.on("translatestart", () => {
    coordMarker2 = [...marker2.getCoordinates()]; // 记录第二个标记点的当前坐标
  });

  // 监听第一个标记点的平移事件
  translate1.on("translating", (evt) => {
    line.setCoordinates([coordMarker2, evt.coordinate]); // 更新线的坐标
  });

  // 监听第二个标记点的平移开始事件
  translate2.on("translatestart", () => {
    coordMarker1 = [...marker1.getCoordinates()]; // 记录第一个标记点的当前坐标
  });

  // 监听第二个标记点的平移事件
  translate2.on("translating", (evt) => {
    line.setCoordinates([coordMarker1, evt.coordinate]); // 更新线的坐标
  });

  // 添加平移交互到地图
  map.addInteraction(translate1);
  map.addInteraction(translate2);

  // 监听鼠标移动事件，改变鼠标指针样式
  map.on("pointermove", (e) => {
    if (e.dragging) return; // 如果正在拖动地图，不处理
    const hit = map.hasFeatureAtPixel(map.getEventPixel(e.originalEvent)); // 判断鼠标是否悬停在特征上
    map.getTargetElement().style.cursor = hit ? "pointer" : ""; // 根据是否悬停在特征上改变鼠标指针样式
  });
};

/**
 * 重置标记位置
 * @param
 * @param
 */
const resetMarkers = () => {
  if (marker1Feature && marker2Feature) {
    const geometry1 = marker1Feature.getGeometry();
    const geometry2 = marker2Feature.getGeometry();
    if (geometry1 && geometry2) {
      geometry1.setCoordinates(coord1);
      geometry2.setCoordinates(coord2);
      lineFeature.getGeometry()?.setCoordinates([coord1, coord2]); // 手动重置线的坐标
    }
  }
};

// 在组件挂载后初始化地图
onMounted(() => {
  if (mapContainer.value) {
    initMap(); // 调用初始化地图的方法
  }
});
</script>
