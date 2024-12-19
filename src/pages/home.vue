<template>
  <div id="map"></div>
  <div id="basemaps-wrapper">
    <select id="basemaps" @change="ChangeBasemapStyle">
      <option value="arcgis/outdoor">arcgis/outdoor</option>
      <option value="arcgis/community">arcgis/community</option>
      <option value="arcgis/navigation">arcgis/navigation</option>
      <option value="arcgis/streets">arcgis/streets</option>
      <option value="arcgis/streets-relief">arcgis/streets-relief</option>
      <option value="arcgis/imagery">arcgis/imagery</option>
      <option value="arcgis/oceans">arcgis/oceans</option>
      <option value="arcgis/topographic">arcgis/topographic</option>
      <option value="arcgis/light-gray">arcgis/light-gray</option>
      <option value="arcgis/dark-gray">arcgis/dark-gray</option>
      <option value="arcgis/human-geography">arcgis/human-geography</option>
      <option value="arcgis/charted-territory">arcgis/charted-territory</option>
      <option value="arcgis/nova">arcgis/nova</option>
      <option value="osm/standard">osm/standard</option>
      <option value="osm/navigation">osm/navigation</option>
      <option value="osm/streets">osm/streets</option>
      <option value="osm/blueprint">osm/blueprint</option>
    </select>
  </div>

  <div id="languages-wrapper">
    <select id="languages" @change="setLanguage">
      <option value="global">Global</option>
      <option value="ar">Arabic</option>
      <option value="bs">Bosnian</option>
      <option value="bg">Bulgarian</option>
      <option value="ca">Catalan</option>
      <option value="zh-CN">Chinese (Simplified)</option>
      <option value="zh-HK">Chinese (Hong Kong)</option>
      <option value="zh-TW">Chinese (Taiwan)</option>
      <option value="hr">Croatian</option>
      <option value="cs">Czech</option>
      <option value="da">Danish</option>
      <option value="nl">Dutch</option>
      <option value="en">English</option>
      <option value="et">Estonian</option>
      <option value="fi">Finnish</option>
      <option value="fr">French</option>
      <option value="de">German</option>
      <option value="el">Greek</option>
      <option value="he">Hebrew</option>
      <option value="hu">Hungarian</option>
      <option value="id">Indonesian</option>
      <option value="it">Italian</option>
      <option value="ja">Japanese</option>
      <option value="ko">Korean</option>
      <option value="lv">Latvian</option>
      <option value="lt">Lithuanian</option>
      <option value="nb">Norwegian</option>
      <option value="pl">Polish</option>
      <option value="pt-BR">Portugese (Brazil)</option>
      <option value="pt-PT">Portugese (Portugal)</option>
      <option value="ro">Romanian</option>
      <option value="ru">Russian</option>
      <option value="sr">Serbian</option>
      <option value="sk">Slovak</option>
      <option value="sl">Slovenian</option>
      <option value="es">Spanish</option>
      <option value="sv">Swedish</option>
      <option value="th">Thai</option>
      <option value="tr">Turkish</option>
      <option value="uk" selected>Ukrainian</option>
      <option value="vi">Vietnamese</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { Map, View } from "ol"; //地图,视图
import OSM from "ol/source/OSM"; //可以理解为数据源,就是一张图片
import TileLayer from "ol/layer/Tile"; //可以理解为图层
import { Group as LayerGroup } from "ol/layer";
import { fromLonLat } from "ol/proj"; //将坐标从经度/纬度转换为不同的投影。
import { apply } from "ol-mapbox-style";
import { Attribution } from "ol/control";
import { onMounted } from "vue";

const accessToken =
  "AAPTxy8BH1VEsoebNVZXo8HurMwi75iMmH8_ATZWBZ9xqum5ptX7r8guWn0h29FFT_5S7KCH5xrFe171oR96pAO2EL78Qg48E2hYyU6YZRl39k4mysE3GPOltTjqm5A6_wAGYj8zb0fQKtVxc3DOTYuH_iyMR6Qc8bpQ0mG7eYbfwSAjYQUliwdhR6C4p6qU5Q7eDb28AIHSde4pKX-DRTT97lpitSXhX4AhEkXD_4n4hW8.AT1_9UIP0usd";
const basemapId = "arcgis/outdoor";
const baseUrl =
  "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles";
const url = (style: string) => `${baseUrl}/${style}?token=${accessToken}`;
const languageUrl = (language: string) => `${baseUrl}/arcgis/outdoor?token=${accessToken}&language=${language}`;

let map = new Map({});

const initMap = () => {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;
  map = new Map({
    target: mapEl,
    layers: [
      // new TileLayer({
      //   source: new OSM()
      // })
    ],
  });

  // map.setLayers([
  //   new TileLayer({
  //     source: new OSM({
  //       attributions: '© 自定义版权信息', // 这里设置自定义版权信息
  //     }),
  //   }),
  // ]);

  map.setView(
    new View({
      center: fromLonLat([116.320906,40.046739]),
      zoom: 12,
      // projection: 'EPSG:4326', // ol 默认使用的是 EPSG:3857，百度配置投影坐标系
    })
  );
};

const setBasemap = (style: string) => {
  // Clear out existing layers.
  map.setLayerGroup(new LayerGroup());
  // Instantiate the given basemap layer.
  apply(map, url( style )).then(() => {
    const attribution = new Attribution({
      label: "123",
      tipLabel: "456",
      collapsible: true, // 是否可折叠（根据您的需求设置）
    });
    attribution.setTarget("你好啊");

    map.addControl(attribution); // 将Attribution控件添加到地图上
  });
};

const ChangeBasemapStyle = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  if (target) {
    setBasemap(target.value);
  }
};

const setLanguage = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  // Clear out existing layers.
  map.setLayerGroup(new LayerGroup());
  // Instantiate the given basemap layer.
  apply(map, languageUrl(target.value)).then(() => {

    // Add Esri attribution
    // Learn more in https://esriurl.com/attribution
    // const source = map.getLayers().item(0).getSource();
    // console.log(source);
    // source.setAttributions("Powered by <a href='https://www.esri.com/en-us/home' target='_blank'>Esri</a> | ")
  });
};

onMounted(() => {
  initMap();
  setBasemap(basemapId);
});
</script>

<style scoped>

#basemaps-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
}
#basemaps {
  font-size: 16px;
  padding: 4px 8px;
}

#languages-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
}
#languages {
  font-size: 16px;
  padding: 4px 8px;
}
</style>
