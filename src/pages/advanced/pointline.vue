<template>
  <div>
    <!-- 下拉菜单，用于选择绘制图形类型 -->
    <select v-model="drawType" @change="onDrawTypeChange">
      <option value="">选择绘制图形</option>
      <option value="Point">点</option>
      <option value="LineString">线</option>
      <option value="Circle">圆</option>
      <option value="Polygon">多边形</option>
      <option value="Cancel">取消</option>
    </select>
    <!-- 地图容器，设置高度为视口高度 -->
    <div id="map" style="height: 100vh;"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Draw } from 'ol/interaction';
import { Style, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';

// 定义地图实例的引用
const map = ref<Map | null>(null);
// 定义用户选择的绘制类型的引用
const drawType = ref<string>('');
// 定义绘制交互的引用
const drawInteraction = ref<Draw>();
// 定义存储绘制图形的矢量数据源的引用
const vectorSource = ref<VectorSource>();
// 定义显示绘制图形的矢量图层的引用
const vectorLayer = ref<VectorLayer>();

// 在组件挂载后初始化地图和图层
onMounted(() => {
  // 创建 VectorSource 用于存储绘制的图形
  vectorSource.value = new VectorSource();
  
  // 创建 VectorLayer 显示绘制的图形
  vectorLayer.value = new VectorLayer({
    source: vectorSource.value,
  });

  // 初始化地图
  map.value = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      vectorLayer.value,
    ],
    view: new View({
      center: fromLonLat([116.404, 39.915]), // 设置地图中心点
      zoom: 16, // 设置地图缩放级别
    }),
  });

  // 默认不添加任何绘制交互
});

// 根据选择的绘制类型更新绘制交互
const onDrawTypeChange = () => {
  if (drawType.value === 'Cancel') {
    // 如果选择取消，移除绘制交互并清空图层
    if (drawInteraction.value) {
      map.value?.removeInteraction(drawInteraction.value);
    }
    vectorSource.value?.clear();
  } else {
    // 如果选择了其他绘制类型，初始化对应的绘制交互
    if (drawInteraction.value) {
      map.value?.removeInteraction(drawInteraction.value); // 移除之前的绘制交互
    }
    // 创建新的绘制交互
    drawInteraction.value = new Draw({
      source: vectorSource.value,
      type: drawType.value as 'Point' | 'LineString' | 'Circle' | 'Polygon', // 设置绘制的类型
      style: new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)',
        }),
      }),
    });

    // 绘制结束后修改样式（双击后）
    drawInteraction.value.on('drawend', (event) => {
      const feature = event.feature;
      // 修改绘制完成后的颜色
      feature.setStyle(new Style({
        stroke: new Stroke({
          color: 'red',  // 绘制完成后的颜色
          width: 3,
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.1)', // 绘制完成后的填充颜色
        }),
      }));
    });

    // 添加新的绘制交互
    map.value?.addInteraction(drawInteraction.value);
  }
};
</script>

<style scoped>
/* 设置地图容器的宽度和高度 */
#map {
  width: 100%;
  height: 100%;
}

/* 设置下拉菜单的位置和层级 */
select {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
}
</style>