<template>
  <div ref="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { useGlobals } from "@/composables/useGlobals";
import {
  Cartesian3,
  createOsmBuildingsAsync,
  Ion,
  Math as CesiumMath,
  Terrain,
  Viewer,
  Color,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { onMounted, ref } from "vue";

const { cesiumToekn } = useGlobals();
const cesiumContainer = ref<HTMLDivElement | null>(null);

// Your access token can be found at: https://ion.cesium.com/tokens.
// This is the default access token from your ion account

Ion.defaultAccessToken = cesiumToekn.value;

const initCesium = async () => {
  if (!cesiumContainer.value) return;
  // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
  const viewer = new Viewer(cesiumContainer.value, {
    terrain: Terrain.fromWorldTerrain(),
  });

  // Fly the camera to San Francisco at the given longitude, latitude, and height.
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
    orientation: {
      heading: CesiumMath.toRadians(0.0),
      pitch: CesiumMath.toRadians(-15.0),
    },
  });

  // viewer.entities.add({
  //   position: Cartesian3.fromDegrees(-122.4175, 37.655),
  //   point: {
  //     pixelSize: 10,
  //     color: Color.RED,
  //   },
  // });


  // Add Cesium OSM Buildings, a global 3D buildings layer.
  const buildingTileset = await createOsmBuildingsAsync();
  viewer.scene.primitives.add(buildingTileset);
};

onMounted(() => {
  initCesium();
});
</script>
