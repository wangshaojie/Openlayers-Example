<template>
  <div id="map" ref="mapRef"></div>
  <div id="popup" class="ol-popup" style="display: none">
    <div id="popup-content"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Feature, Map, Overlay, View, MapBrowserEvent } from "ol";
import TileLayer from "ol/layer/Tile";
import { XYZ } from "ol/source";
import { fromLonLat } from "ol/proj";
import { FullScreen, defaults } from "ol/control";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Style, Text } from "ol/style";
import { Point } from "ol/geom";

// 地图和 DOM 引用
const layerMap = ref<Map | null>(null);
const mapRef = ref<HTMLDivElement | null>(null);
// 标注和弹框详细
// 模拟多个标注数据
const markerData = [
  {
    name: "故宫",
    coordinates: [116.396529, 39.919521],
    info: "故宫博物院，拥有悠久历史。",
    img: "https://placehold.co/100x100?text=gu+gong",
  },
  {
    name: "玉渊潭公园",
    coordinates: [116.319992, 39.918056],
    info: "玉渊潭公园是北京的标志性建筑。",
    img: "https://placehold.co/100x100?text=yu+yuan+tuan",
  },
];

// 初始化瓦片图层
const createTileLayer = () =>
  new TileLayer({
    source: new XYZ({
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      // url: "http://192.168.111.97:8080/roadmap/{z}/{x}/{y}.png",
    }),
  });

// 创建标注的矢量图层
const createVectorLayer = (data: typeof markerData) => {
  const vectorSource = new VectorSource();
  data.forEach((item) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat(item.coordinates)),
      name: item.name,
      info: item.info,
      img: item.img,
    });
    feature.setStyle(
      new Style({
        text: new Text({
          text: item.name,
          font: "bold 14px Arial",
          fill: new Fill({ color: "#FFFFFF" }),
          backgroundFill: new Fill({ color: "#FF0000" }),
          padding: [4, 8, 4, 8],
          offsetY: -20,
        }),
      })
    );
    vectorSource.addFeature(feature);
  });
  return new VectorLayer({ source: vectorSource });
};

// 创建弹出层
const createPopup = (map: Map) => {
  const popupEl = document.getElementById("popup");
  if (!popupEl) return;
  const popup = new Overlay({
    element: popupEl,
    positioning: "bottom-center",
    stopEvent: false,
    offset: [0, -10],
  });
  map.addOverlay(popup);

  map.on("singleclick", (evt: MapBrowserEvent<any>) => {
    const features = map.getFeaturesAtPixel(evt.pixel);
    if (features.length > 0) {
      const clickedFeature = features[0];
      if (clickedFeature) {
        const name = clickedFeature.get("name");
        const info = clickedFeature.get("info");
        const img = clickedFeature.get("img");
        const geometry = clickedFeature.getGeometry();
        if (geometry instanceof Point) {
          popupEl.innerHTML = `<h3>${name}</h3><p>${info}</p><img src="${img}" alt="${name}" style="width:100%;border-radius:5px;">`;
          popup.setPosition(geometry.getCoordinates());
          popupEl.style.display = "block";
        }
      }
    } else {
      popupEl.style.display = "none";
    }
  });

  map.on("pointermove", (evt: MapBrowserEvent<any>) => {
    if (evt.dragging) popupEl.style.display = "none";
  });
};

// 初始化地图
const initMap = () => {
  if (!mapRef.value) return;
  layerMap.value = new Map({
    target: mapRef.value,
    layers: [createTileLayer(), createVectorLayer(markerData)],
    view: new View({
      center: fromLonLat([116.396876, 39.927773]),
      projection: "EPSG:3857",
      zoom: 14,
      maxZoom: 15,
      minZoom: 11,
    }),
    controls: defaults().extend([new FullScreen()]),
  });
  createPopup(layerMap.value as Map);
};

onMounted(() => {
  initMap();
});
</script>

<style scoped>
.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ccc;
  min-width: 200px;
}
.ol-popup:after,
.ol-popup:before {
  top: 100%;
  left: 50%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #ccc;
  border-width: 11px;
  margin-left: -11px;
}
</style>
