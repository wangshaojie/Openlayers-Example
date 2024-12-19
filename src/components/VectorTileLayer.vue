<template>
  <div id="map"></div>
  {{ accessToken }}
</template>

<script setup lang="ts">
import { useGlobals } from '@/composables/useGlobals'
const basemapId = "arcgis/outdoor";
const basemapURL = `https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/${basemapId}?token=${accessToken}`;

const { accessToken } = useGlobals();
</script>