<template>
  <div id="map" ref="cesiumContainer" class="cesium-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as Cesium from "cesium";
import { useGlobals } from "@/composables/useGlobals";

const { cesiumToekn } = useGlobals();
const cesiumContainer = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (!cesiumContainer.value) return;
  Cesium.Ion.defaultAccessToken = cesiumToekn.value;
  new Cesium.Viewer(cesiumContainer.value, {
    geocoder: true, // 是否显示位置查找工具（true表示是，false表示否）
    homeButton: true, // 是否显示首页位置工具
    sceneModePicker: true, //是否显示视角模式切换工具
    baseLayerPicker: true, //是杏显示默认图层选择工具
    navigationHelpButton: true, //是否显示导航帮助工具
    animation: true, //是杏显示动画工具
    timeline: true, //是否显示时间轴工具
    fullscreenButton: true, //是否显示全屏按钮工具
  });
});
</script>
