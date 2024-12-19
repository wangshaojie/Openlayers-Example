<template>
  <div id="map" class="map" ref="mapContainer"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, onBeforeUnmount } from "vue";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import LineString from "ol/geom/LineString";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import { fromLonLat, transform } from "ol/proj";
import CarImg from "@/assets/car.png";
import { XYZ } from "ol/source"
import { Stroke } from "ol/style"

// 创建变量
const mapContainer = ref<HTMLDivElement | null>(null);
let animationFrameId: number;

onMounted(() => {
  nextTick(() => {
    if (mapContainer.value) {
      // 创建OpenLayers地图
      const map = new Map({
        target: mapContainer.value,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
            }),
          }),
        ],
        view: new View({
          center: fromLonLat([116.357161,39.914953]),
          zoom: 14, // 设置较小的初始缩放级别
        }),
      });

      // 四个标记坐标（长方形）
      const coordinates = [
        fromLonLat([116.321269,39.907692]), // 点 1
        fromLonLat([116.382836,39.907245]), // 点 2
        fromLonLat([116.381523,39.922687]), // 点 3
        fromLonLat([116.396841,39.92347]), // 点 4
      ];

      // 创建标记的Feature
      const features = coordinates.map((coord) => {
        const marker = new Feature(new Point(coord));
        return marker;
      });

      // 创建线的Feature，连接所有标记
      const line = new Feature(new LineString(coordinates));
      // 创建线的样式
      const lineStyle = new Style({
        stroke: new Stroke({
          color: '#007BFF',   // 线的颜色 (蓝色)
          width: 4,           // 线的宽度
          lineDash: [10, 10], // 虚线样式 [实线长度, 空白长度]
          lineCap: 'round',   // 线条末端样式 ('butt' | 'round' | 'square')
          lineJoin: 'round',  // 线条连接处样式 ('bevel' | 'round' | 'miter')
        }),
      });
      line.setStyle(lineStyle)

      // 创建矢量数据源并添加Features
      const vectorSource = new VectorSource({
        features: [...features, line],
      });

      // 创建矢量图层并添加到地图
      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });
      map.addLayer(vectorLayer);

      // 创建图片的Feature，初始位置为第一个标记
      const imageFeature = new Feature(new Point(coordinates[0]));

      // 设置图片样式
      const imageStyle = new Style({
        image: new Icon({
          src: CarImg, // 替换为你实际的图片 URL
          scale: 0.2, // 设置图片的缩放比例
          rotation: 0,
        }),
      });

      // 将图片Feature添加到矢量图层
      imageFeature.setStyle(imageStyle);
      vectorSource.addFeature(imageFeature);

      // 动画变量
      let t = 0; // 动画时间（0 到 1）
      const speed = 0.002; // 运动速度
      let direction = 1; // 方向（1 表示向前，-1 表示向后）

      // 计算路径总长度
      const lineString = new LineString(coordinates);
      const pathLength = lineString.getLength();

      // 更新图片位置
      const updatePosition = () => {
        if (!imageFeature) return; // 检查 imageFeature 是否为 undefined

        // 计算当前路径上的位置（按路径长度）
        const distance = t * pathLength; // 根据 t 来决定当前位置的距离

        // 获取路径上的当前坐标
        const currentCoords = lineString.getCoordinateAt(distance / pathLength); // 返回距离的坐标

        // 获取路径上的下一个点坐标
        const nextCoords = lineString.getCoordinateAt(
          (distance + 1) / pathLength
        ); // 获取下一个坐标

        const x = currentCoords[0];
        const y = currentCoords[1];

        // 计算旋转角度：计算当前位置与下一个点的角度
        const deltaX = nextCoords[0] - x;
        const deltaY = nextCoords[1] - y;
        const angle = Math.atan2(deltaY, deltaX); // 使用 Math.atan2 计算两点之间的角度

        // 更新图片的坐标和旋转角度
        const geometry = imageFeature.getGeometry();
        if (geometry) {
          geometry.setCoordinates([x, y]);
        }

        const image = imageStyle.getImage();
        if (image) {
          // 根据轨迹的角度调整图片的旋转角度
          if (angle=== 0) {
            image.setRotation(angle);
          } else if (Math.floor(angle) === 1) {
            image.setRotation(0); // 应用旋转
          } else if (Math.floor(angle) === 3) {
            image.setRotation(0); // 应用旋转
          }
        }

        // 更新 t 值，来回运动
        t += direction * speed;
        if (t >= 1 || t <= 0) {
          direction *= -1; // 反转运动方向

          // 在到达端点时旋转 180 度
          // imageStyle.getImage().setRotation(2)
        }

        // 继续下一帧动画
        animationFrameId = requestAnimationFrame(updatePosition);
      };

      // 开始动画
      updatePosition();
    }
  });
});

// 清理动画
onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>
