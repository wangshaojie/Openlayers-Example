<!-- 聚合 -->
<template>
  <div id="map" ref="mapContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource, XYZ } from 'ol/source';
import { Style, Icon, Circle, Fill } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import sheltersGeoJSONUrl from '@/assets/json/taiyuanbinan.geojson.json'
import { fromLonLat } from 'ol/proj'

const mapContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  if (mapContainer.value) {
    // 创建地图
    const map = new Map({
      target: mapContainer.value,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=1&style=8&x={x}&y={y}&z={z}', // 修改为你的本地瓦片地址
          })
        })
      ],
      view: new View({
        center: fromLonLat([121.473667, 31.230525]), // 大致上海的经纬度中心，可根据实际调整
        zoom: 10
      })
    });

    // 创建用于加载GeoJSON数据的矢量源
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(sheltersGeoJSONUrl, {
        featureProjection: 'EPSG:3857'
      })
    });

    // 创建矢量图层
    // 创建矢量图层，并根据缩放级别动态控制显示数量
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature, resolution) => {
        const zoom = map.getView().getZoom();
        const featuresToShowCount = getFeaturesToShowCount(zoom);
        const features = vectorSource.getFeatures();
        const shownFeatures = features.slice(0, featuresToShowCount);
        const styleFeatures = [];
        for (const feature of shownFeatures) {
          styleFeatures.push(feature);
        }
        return new Style({
          image: new Icon({
            src: 'https://openlayers.org/en/latest/examples/data/icon.png',
            scale: 0.4 + Math.log(resolution) / Math.log(1000)
          })
          // image: new Circle({
          //   radius: 5, // 设置半径为5像素
          //   fill: new Fill({
          //     color: 'red' // 设置填充颜色为绿色
          //   })
          // })
        });
      }
    });

    const getFeaturesToShowCount = (zoom: number): number => {
      if (zoom < 12) {
        return 0;
      } else if (zoom >= 12 && zoom < 14) {
        return 10; // 缩放级别在12到14之间时，显示10个要素，可根据实际调整
      } else if (zoom >= 14 && zoom < 16) {
        return 50; // 缩放级别在14到16之间时，显示50个要素，可根据实际调整
      } else {
        return vectorSource.getFeatures().length; // 更大缩放级别显示全部要素
      }
    };

    map.addLayer(vectorLayer);
  }
});
</script>