<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import { applyStyle } from "ol-mapbox-style";
import { onMounted } from "vue";
import { XYZ } from "ol/source";

onMounted(() => {
  // 创建地图容器
  new Map({
    target: "map",
    view: new View({
      center: fromLonLat([116.4, 39.9]), // 北京坐标
      zoom: 10,
    }),
    layers: [
      new TileLayer({
        source: new XYZ({
          url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          tileLoadFunction: function (imageTile, src) {
            // 使用滤镜 将白色修改为深色
            const img = new Image();
            // img.crossOrigin = ''
            // 设置图片不从缓存取，从缓存取可能会出现跨域，导致加载失败
            img.setAttribute("crossOrigin", "anonymous");
            img.onload = function () {
              const canvas = document.createElement("canvas");
              const w = img.width;
              const h = img.height;
              canvas.width = w;
              canvas.height = h;
              const context = canvas.getContext("2d");
              if (context) {
                context.filter =
                  "grayscale(98%) invert(100%) sepia(20%) hue-rotate(180deg) saturate(1600%) brightness(80%) contrast(90%)";
                context.drawImage(img, 0, 0, w, h, 0, 0, w, h);
              }
              imageTile.getImage().src = canvas.toDataURL("image/png");
            };
            img.src = src;
          },
        }),
      }),
    ],
  });
});
</script>
