<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import "ol/ol.css"; // 引入 OpenLayers 的样式文件
import { Map, View } from "ol"; // 导入地图和视图类
import TileLayer from "ol/layer/Tile"; // 导入瓦片图层类
import XYZ from "ol/source/XYZ"; // 导入 XYZ 瓦片源类
import { Point } from "ol/geom"; // 导入点几何类
import { Feature } from "ol"; // 导入特征类
import { Vector as VectorLayer } from "ol/layer"; // 导入矢量图层类
import { Vector as VectorSource } from "ol/source"; // 导入矢量数据源类
import { Style, Fill, Stroke, RegularShape, Icon, Text, Circle } from "ol/style"; // 导入样式相关类
import { fromLonLat } from "ol/proj"; // 导入坐标转换函数

// 初始化地图和图层
const map = ref<Map | null>(null); // 地图实例，初始值为 null
const vectorLayer = ref<VectorLayer>(); // 矢量图层实例
const vectorSource = ref<VectorSource>(); // 矢量数据源实例

// 动态样式的状态
const pulseSize = ref<number>(1.0); // 脉动效果的大小，初始值为 1.0
const pulseDirection = ref<number>(1); // 脉动方向，1 表示增大，-1 表示减小
const rotation = ref<number>(0); // 旋转角度，初始值为 0

// 计算样式函数
const animatedPointStyle = computed(() => {
  pulseSize.value += pulseDirection.value * 0.05; // 更新脉动大小
  if (pulseSize.value >= 1.5 || pulseSize.value <= 0.8) {
    pulseDirection.value = -pulseDirection.value; // 反转脉动方向
  }
  return new Style({
    image: new Circle({
      radius: pulseSize.value * 12, // 根据脉动大小调整半径
      fill: new Fill({ color: "rgba(255, 0, 0, 0.5)" }), // 填充颜色
      stroke: new Stroke({ color: "rgba(255, 0, 0, 0.5)", width: 4 }), // 描边颜色和宽度
    }),
    text: new Text({
      text: '动画点', // 文本内容
      font: 'bold 16px sans-serif', // 字体样式
      fill: new Fill({ color: '#fff' }), // 文本填充颜色
      stroke: new Stroke({ color: 'rgba(255, 0, 0, 1)', width: 2 }), // 文本描边颜色和宽度
      offsetY: -20, // 文本偏移量
    }),
  });
});

// 设置第四个点的样式，计算旋转样式函数
const rotatingPointStyle = computed(() => {
  rotation.value += 0.05; // 增加旋转角度
  return new Style({
    image: new RegularShape({
      points: 3, // 三角形
      radius: 12, // 半径
      fill: new Fill({ color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)` }), // 随机颜色填充
      stroke: new Stroke({ color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`, width: 4 }), // 随机颜色描边
      rotation: rotation.value, // 旋转角度
    }),
    text: new Text({
      text: '旋转点', // 文本内容
      font: 'bold 16px sans-serif', // 字体样式
      fill: new Fill({ color: '#fff' }), // 文本填充颜色
      stroke: new Stroke({ color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`, width: 2 }), // 文本描边颜色和宽度
      offsetY: -20, // 文本偏移量
    }),
  });
});

onMounted(() => {
  // 初始化矢量图层和数据源
  vectorSource.value = new VectorSource(); // 创建矢量数据源
  vectorLayer.value = new VectorLayer({ source: vectorSource.value }); // 创建矢量图层并关联数据源

  // 创建地图实例
  map.value = new Map({
    target: "map", // 指定地图容器
    layers: [
      new TileLayer({
        source: new XYZ({ url: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" }), // 使用 OpenStreetMap 的瓦片源
      }),
      vectorLayer.value, // 添加矢量图层
    ],
    view: new View({ center: fromLonLat([121.4737, 31.2304]), zoom: 12 }), // 设置视图中心和缩放级别
  });

  // 创建并设置点的样式
  const pointFeature = new Feature(new Point(fromLonLat([121.4737, 31.2304]))); // 创建一个点特征
  pointFeature.setStyle([
    new Style({
      image: new Circle({
        radius: 15, // 半径
        fill: new Fill({ color: "rgba(255, 0, 0, 0.5)" }), // 填充颜色
        stroke: new Stroke({ color: "rgba(255, 0, 0, 0.5)", width: 4 }), // 描边颜色和宽度
      }),
    }),
    new Style({
      image: new Circle({
        radius: 10, // 半径
        fill: new Fill({ color: "rgba(255, 0, 0, 0.8)" }), // 填充颜色
        stroke: new Stroke({ color: "rgba(255, 0, 0, 0.8)", width: 2 }), // 描边颜色和宽度
      }),
    }),
  ]);

  // 设置第二个点的样式（使用自定义图标：旗帜图标）
  const pointFeature2 = new Feature(new Point(fromLonLat([121.427818, 31.157947])));
  pointFeature2.setStyle(
    new Style({
      image: new Icon({
        src: "https://cdn.icon-icons.com/icons2/97/PNG/64/united_states_flags_flag_17080.png", // 图标 URL
        scale: 1, // 缩放比例
        anchor: [0.5, 1], // 锚点位置（底部中央）
        anchorXUnits: "fraction", // X 轴单位为百分比
        anchorYUnits: "fraction", // Y 轴单位为百分比
      }),
    })
  );

  const pointFeature3 = new Feature(new Point(fromLonLat([121.4820, 31.2020])));
  pointFeature3.setStyle(animatedPointStyle.value); // 设置脉动效果样式

  // 新增第四个点，并设置旋转效果
  const pointFeature4 = new Feature(new Point(fromLonLat([121.4520, 31.2320])));
  pointFeature4.setStyle(rotatingPointStyle.value); // 设置旋转效果样式

  // 添加点到矢量数据源
  vectorSource.value.addFeature(pointFeature);
  vectorSource.value.addFeature(pointFeature2);
  vectorSource.value.addFeature(pointFeature3);
  vectorSource.value.addFeature(pointFeature4);

  // 设置定时器更新样式
  const intervalId = setInterval(() => {
    pointFeature3.setStyle(animatedPointStyle.value); // 手动更新脉动效果样式
    pointFeature4.setStyle(rotatingPointStyle.value); // 手动更新旋转效果样式
    vectorLayer.value!.changed(); // 触发图层重绘
  }, 100);

  // 清理定时器
  return () => clearInterval(intervalId);
});
</script>