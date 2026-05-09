# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).


## 页面介绍

### 首页 (Home)
项目概览页面，展示各功能模块入口和技术栈信息。采用卡片式布局，直观呈现基础功能、高级功能、三维地球、图表联动、三维模型等五大模块。

### 基础功能 (Basic)

| 页面 | 说明 |
|------|------|
| **地图切换** | 展示多种在线瓦片地图服务，包括ArcGIS卫星图、街道图等，支持地图样式切换 |
| **离线瓦片** | 演示如何加载离线瓦片地图数据 |
| **分类标注** | 在地图上添加和管理多种类型的标注点 |
| **动态分类标注** | 支持动态更新和分类管理的标注功能 |
| **区域颜色** | 使用GeoJSON数据为区域着色，展示区域配色效果 |
| **拖拽标记** | 可拖拽的地图标记，支持交互式定位 |
| **GeoJSON区域** | 加载和显示GeoJSON格式的区域数据 |
| **地图背景色** | 地图底色和样式的自定义配置 |
| **地图样式** | 自定义地图的视觉样式和配色方案 |
| **矢量图层样式** | 控制矢量要素的渲染效果 |
| **静态图片** | 在地图上叠加静态图片图层 |

### 高级功能 (Advanced)

| 页面 | 说明 |
|------|------|
| **轨迹路线动画** | 沿指定路线移动的动画效果 |
| **热力图** | 基于点数据生成热力图可视化 |
| **加载ArcGIS地图** | 集成ArcGIS在线地图服务 |
| **聚合避难所地图** | 标注点的聚合显示与管理 |
| **电子围栏** | 在地图上绘制电子围栏区域 |
| **点线面绘制** | 交互式绘制点、线、面要素 |
| **飞行路径** | 3D视角下的飞行轨迹展示 |
| **添加图标** | 在地图上添加自定义图标标记 |
| **散点图** | 在地图上绘制散点分布图 |
| **定时开关灯** | 模拟路灯定时开关效果 |
| **数据动态更新** | 实时更新地图数据 |
| **土地分类** | 土地使用类型的可视化分类 |
| **智驾轨迹回放** | 企业级智驾轨迹回放系统 |
| **电子围栏预警** | **企业级电子围栏与越界预警系统** |

### 智驾轨迹回放系统

> 这是一个基于Vue3 + 高德地图JS API v2.0 构建的企业级智驾轨迹回放系统，适用于自动驾驶数据可视化、行车回放等场景。

#### 核心功能

1. **高精度轨迹模拟**
   - 基于北京望京地区真实道路模拟
   - 支持路口减速、直线加速等真实速度变化
   - 时间按实际速度计算，还原真实行车场景

2. **实时轨迹回放**
   - 播放/暂停/倍速控制 (0.5x / 1x / 2x)
   - 进度条拖拽跳转
   - 地图视角跟随车辆移动

3. **线性插值算法**
   - 位置插值：两轨迹点间平滑过渡
   - 速度插值：实时计算当前速度
   - 方向插值：防止0°/360°切换时角度抖动

4. **轨迹渐变样式**
   - 灰色：完整路线背景
   - 蓝色：已行驶轨迹
   - 速度色彩映射（绿→黄→红）

5. **车辆跟随**
   - 3D视角下地图随车辆方向旋转
   - 车辆图标自动旋转对准行驶方向
   - 平滑的视角切换效果

6. **Douglas-Peucker抽稀**
   - 道格拉斯-普克算法优化轨迹点数
   - 保持轨迹形状的同时提升渲染性能

7. **实时数据面板**
   - 速度 (km/h)
   - 经纬度坐标
   - 方向角
   - 轨迹点数统计

#### 技术亮点

```typescript
// 时间戳驱动，精确控制
const totalDuration = computed(() =>
  (rawPoints.value[rawPoints.value.length - 1].time - rawPoints.value[0].time) / 1000
);

// 线性插值实现平滑过渡
const t = (targetTime - p1.time) / (p2.time - p1.time);
const lng = p1.lng + (p2.lng - p1.lng) * t;
const speed = p1.speed + (p2.speed - p1.speed) * t;

// 角度突变处理
if (Math.abs(p2.heading - p1.heading) > 180) {
  heading = p2.heading > p1.heading
    ? p1.heading - (360 - (p2.heading - p1.heading)) * t
    : p1.heading + (360 - (p1.heading - p2.heading)) * t;
}
```

#### 适用场景

- 自动驾驶数据回放与分析
- 车队管理轨迹监控
- 行车记录仪数据可视化
- 物流配送路径还原

---

### 电子围栏预警系统 ⭐

> 基于Vue3 + 高德地图JS API v2.0 构建的企业级电子围栏与车辆轨迹越界预警系统，适用于车辆监控、区域管理等场景。

#### 核心功能

1. **双类型电子围栏绘制**
   - 圆形围栏：指定圆心半径
   - 多边形围栏：自定义顶点
   - 使用 MouseTool 交互式绘制

2. **围栏可视化编辑**
   - 拖拽顶点调整形状
   - 修改圆形半径
   - 实时更新围栏数据

3. **车辆轨迹模拟**
   - 从围栏外向围栏内行驶，再驶出的完整轨迹
   - 车辆图标跟随轨迹移动
   - 轨迹平滑插值

4. **GIS空间越界判断**
   - **圆形判断**：`isPointInCircle` - 计算点到圆心距离，与半径比较
   - **多边形判断**：`isPointInPolygon` - 射线法（Ray Casting）判断点是否在多边形内
   - 实时检测车辆进入/驶出围栏

5. **多级预警机制**
   - 地图高亮闪烁
   - 弹窗告警提示
   - 右侧日志实时记录

6. **围栏列表管理**
   - 展示围栏名称和类型
   - 单个围栏显隐切换
   - 单独删除围栏

#### 技术亮点

```typescript
/**
 * GIS空间判断：点是否在圆形内
 * 原理：计算点到圆心的地面距离，与半径比较
 */
const isPointInCircle = (point, center, radius) => {
  const distance = window.AMap.GeometryUtil.distanceToLine(point, [center]);
  return estimatedDistance <= radius;
};

/**
 * GIS空间判断：点是否在多边形内
 * 原理：射线法（Ray Casting Algorithm）
 * 从点向右发射射线，计算与多边形边界的交点个数
 * 奇数个交点 = 在多边形内，偶数个交点 = 在多边形外
 */
const isPointInPolygon = (point, polygon) => {
  return window.AMap.GeometryUtil.isPointInRing(point, polygon);
};

/**
 * 状态变化检测：进入/驶出
 */
if (!wasInside && isInside) {
  triggerWarning('enter', fenceName, point); // 进入告警
} else if (wasInside && !isInside) {
  triggerWarning('exit', fenceName, point);  // 驶出告警
}
```

#### 组合式Hooks封装

```typescript
// useAmap - 地图单例管理
const initMap = async () => {
  if (mapInstance) return mapInstance; // 单例返回
  mapInstance = new window.AMap.Map(...);
  return mapInstance;
};

// useFence - 围栏增删改查
const fenceList = ref<Fence[]>([]);
const startDraw = (type) => { /* 绘制逻辑 */ };
const deleteFence = (id) => { /* 删除逻辑 */ };

// useTrackJudge - 轨迹与越界判断
const isPointInCircle = (point, center, radius) => { /* GIS判断 */ };
const isPointInPolygon = (point, polygon) => { /* GIS判断 */ };
const triggerWarning = (type, fenceName, point) => { /* 预警 */ };
```

#### 适用场景

- 车辆区域管控与越界告警
- 物流配送范围监控
- 共享单车电子围栏
- 无人机禁飞区管理

### 三维地球 (Cesium)

| 页面 | 说明 |
|------|------|
| **基础示例** | Cesium 3D地球基础功能演示 |
| **旧金山示例** | 特定城市的3D地球展示 |

### 图表联动 (ECharts)

| 页面 | 说明 |
|------|------|
| **地图图表** | ECharts与OpenLayers集成，在地图上绑定图表交互 |

### 三维模型 (Three.js)

| 页面 | 说明 |
|------|------|
| **3D模型查看器** | Three.js加载和展示3D模型 |

---

## 重要类
 - layer：层
 - contorl：控件
 - feature：元素
 - interaction：交互
 - Vector：矢量的
 - Tile：瓦片
 - source：资源
 - format：转换
 - projection：投影


## 关于坐标系
  ### OSM(OpenStreetMap)
  OpenStreetMap 默认使用 WGS 84 坐标系统，也被称为 EPSG:4326。然而，在实际应用中，尤其是网络地图服务中，地图数据通常会以 Web Mercator 投影（EPSG:3857）的形式提供，这是因为这种投影方式在处理地图缩放和平移时效率更高，特别是在二维平面上。

  ### 高德
  有自己的一套坐标系统。高德地图使用的是 GCJ-02 坐标系统，这是一种对 WGS 84 坐标进行了偏移加密的坐标系统，主要用于中国大陆地区的地图服务，以确保一定的国家地理信息安全。


## 各坐标系

  在地理信息系统中，坐标系是用于描述地球上任意位置点的数学框架。不同的地图服务提供商，如高德、百度以及国外的Google等，可能会采用不同的坐标系统来满足各自的定位、导航和地图服务需求。以下是对国内高德、百度以及国外常用坐标系统的对比：

| 地图服务提供商 | 坐标系统 | 描述 |
| --- | --- | --- |
| **高德地图** | GCJ-02（火星坐标系） | GCJ-02坐标系是中国国家测绘局制定的加密坐标系，也被称为火星坐标系。它是在WGS-84坐标系基础上进行了加密处理，以保护国家安全和地图数据的安全性。高德地图使用GCJ-02坐标系来表示中国大陆的位置。 |
| **百度地图** | BD-09（百度坐标系） | BD-09坐标系是百度地图使用的坐标系统，也被称为百度坐标系。它是在GCJ-02坐标系基础上进行了进一步的加密处理，以保护百度地图的地图数据。因此，BD-09坐标系与GCJ-02坐标系在定位上存在细微的差异。 |
| **Google地图（非中国区）** | WGS-84 | WGS-84是全球定位系统（GPS）使用的坐标系统，也是全球通用的地理坐标系。它以地球的中心为原点，使用经度和纬度来表示地理位置。在非中国区，Google地图使用WGS-84坐标系来表示地理位置。 |
| **Google地图（中国区）** | GCJ-02 | 尽管Google地图在全球范围内广泛使用WGS-84坐标系，但在中国区，为了满足中国的法规要求，Google地图也使用了GCJ-02坐标系。 |

### 坐标系统对比

1. **WGS-84**：

	* 全球定位系统（GPS）的基础坐标系统。
	* 广泛应用于全球范围内的导航和定位服务。
	* 提供高精度的经纬度信息。

2. **GCJ-02（火星坐标系）**：

	* 中国国家测绘局制定的加密坐标系。
	* 对WGS-84坐标系进行了偏移和加密处理。
	* 主要用于中国大陆地区的地图服务和导航定位。

3. **BD-09（百度坐标系）**：

	* 百度地图使用的坐标系统。
	* 在GCJ-02坐标系基础上进行了进一步的加密处理。
	* 与GCJ-02坐标系存在细微差异，主要用于百度地图的显示和定位。

### 注意事项

1. 由于不同坐标系统之间存在差异，因此在跨地图服务进行位置信息交换时，需要进行坐标转换。
2. 在进行地图开发或集成时，务必了解目标地图服务提供商所使用的坐标系统，以确保数据的准确性和兼容性。

综上所述，高德地图、百度地图以及国外的Google地图等不同的地图服务提供商采用不同的坐标系统来满足各自的定位、导航和地图服务需求。在开发或集成地图服务时，需要了解并考虑这些差异。

## 主要API
  - [ol.Map](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html)：地图对象，包含地图的容器、图层、控件、交互等。
  - [ol.View](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html)：地图视图，包含地图的缩放、旋转、倾斜等参数。
    - [ol.control.Control](https://openlayers.org/en/latest/apidoc/module-ol_control_Control-Control.html)：地图控件，用于添加地图上的控件。
    - [ol.control.Zoom](https://openlayers.org/en/latest/apidoc/module-ol_control_Zoom-Zoom.html)：缩放控件，用于添加地图上的缩放控件。
    - [ol.control.ScaleLine](https://openlayers.org/en/latest/apidoc/module-ol_control_ScaleLine-ScaleLine.html)：比例尺控件，用于添加地图上的比例尺控件。
    - [ol.control.FullScreen](https://openlayers.org/en/latest/apidoc/module-ol_control_FullScreen-FullScreen.html)：全屏控件，用于添加地图上的全屏控件。
    - [ol.control.OverviewMap](https://openlayers.org/en/latest/apidoc/module-ol_control_OverviewMap-OverviewMap.html)：概览图控件，用于添加地图上的概览图控件。
    - [ol.control.Rotate](https://openlayers.org/en/latest/apidoc/module-ol_control_Rotate-Rotate.html)：旋转控件，用于添加地图上的旋转控件。
    - [ol.control.ZoomSlider](https://openlayers.org/en/latest/apidoc/module-ol_control_ZoomSlider-ZoomSlider.html)：缩放滑块控件，用于添加地图上的缩放滑块控件。
    - [ol.control.ZoomToExtent](https://openlayers.org/en/latest/apidoc/module-ol_control_ZoomToExtent-ZoomToExtent.html)：缩放到指定范围控件，用于添加地图上的缩放到指定范围控件。
    - [ol.control.Attribution](https://openlayers.org/en/latest/apidoc/module-ol_control_Attribution-Attribution.html)：版权控件，用于添加地图上的版权控件。
    - [ol.control.LayerSwitcher](https://openlayers.org/en/latest/apidoc/module-ol_control_LayerSwitcher-LayerSwitcher.html)：图层切换控件，用于添加地图上的图层切换控件。
    - [ol.control.MousePosition](https://openlayers.org/en/latest/apidoc/module-ol_control_MousePosition-MousePosition.html)：鼠标位置控件，用于添加地图上的鼠标位置控件。
  - [ol.layer.Layer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Layer-Layer.html)：图层对象，包含图层的类型、样式、数据源等。
    - [ol.layer.Group](https://openlayers.org/en/latest/apidoc/module-ol_layer_Group-LayerGroup.html)：图层组，用于组合多个图层。
    - [ol.layer.Image](https://openlayers.org/en/latest/apidoc/module-ol_layer_Image-ImageLayer.html)：图片图层，用于显示图片数据。
    - [ol.layer.VectorTile](https://openlayers.org/en/latest/apidoc/module-ol_layer_VectorTile-VectorTileLayer.html)：矢量瓦片图层，用于显示矢量瓦片数据。
  - [ol.layer.Vector](https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html)：矢量图层，用于显示矢量数据。
  - [ol.layer.Tile](https://openlayers.org/en/latest/apidoc/module-ol_layer_Tile-TileLayer.html)：瓦片图层，用于显示瓦片数据。
  - [ol.source.Source](https://openlayers.org/en/latest/apidoc/module-ol_source_Source-Source.html)：数据源对象，包含数据源的类型、数据、样式等。
  - [ol.source.Vector](https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html)：矢量数据源，用于加载矢量数据。
  - [ol.format.GeoJSON](https://openlayers.org/en/latest/apidoc/module-ol_format_GeoJSON-GeoJSON.html)：用于解析GeoJSON格式的数据。
<!-- https://openlayers.org/en/latest/apidoc/ -->
## **1. Map 类**
### 用于初始化和操作地图。
```ts
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

const map = new Map({
  target: 'map', // 绑定的 HTML 容器 ID
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [0, 0], // 地图中心（EPSG:3857 坐标）
    zoom: 2,        // 缩放级别
  }),
});

// 创建并添加自定义控件
const customControl = new CustomControl();
map.addControl(customControl);
```

---

## **2. View 类**
### 定义地图的视图，包括中心点、缩放级别等。
```ts
import View from 'ol/View';

const view = new View({
  center: [0, 0],
  zoom: 4,
  projection: 'EPSG:3857', // 坐标投影
  maxZoom: 18,
  minZoom: 2,
});
```

---

## **3. Layer 类**
### 地图图层，包括栅格图层、矢量图层等。

#### (1) 栅格图层 (TileLayer)
```ts
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

const rasterLayer = new TileLayer({
  source: new OSM(), // 开源街道地图
});
```

#### (2) 矢量图层 (VectorLayer)
```ts
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

const vectorLayer = new VectorLayer({
  source: new VectorSource(), // 矢量数据来源
});
```

---

## **4. Source 类**
### 定义数据源，支持多种类型。

#### (1) 栅格数据源 (OSM, XYZ, TileWMS)
```ts
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';

const osmSource = new OSM(); // OpenStreetMap 数据源

const xyzSource = new XYZ({
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
});

const wmsSource = new TileWMS({
  url: 'https://ahocevar.com/geoserver/wms',
  params: { LAYERS: 'topp:states', TILED: true },
});
```

#### (2) 矢量数据源 (Vector, GeoJSON, KML)
```ts
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

const vectorSource = new VectorSource({
  url: '/path/to/data.geojson', // GeoJSON 文件路径
  format: new GeoJSON(),
});
```

---

## **5. Interaction 类**
### 定义用户交互，如拖动、缩放、绘制等。

#### (1) 默认交互
```ts
import { defaults as defaultInteractions } from 'ol/interaction';

const interactions = defaultInteractions();
```

#### (2) 添加绘制功能
```ts
import Draw from 'ol/interaction/Draw';

const draw = new Draw({
  source: vectorSource, // 绑定到某个数据源
  type: 'Polygon',      // 绘制类型（Point, LineString, Polygon）
});
map.addInteraction(draw);
```

---

## **6. Style 类**
### 设置矢量数据的样式。

#### (1) 基础样式
```ts
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

const style = new Style({
  fill: new Fill({ color: 'rgba(255, 0, 0, 0.5)' }),
  stroke: new Stroke({ color: '#ffcc33', width: 2 }),
});
```

#### (2) 文本样式
```ts
import Text from 'ol/style/Text';

const textStyle = new Style({
  text: new Text({
    text: 'Hello',
    font: '12px Calibri,sans-serif',
    fill: new Fill({ color: '#000' }),
    stroke: new Stroke({ color: '#fff', width: 3 }),
  }),
});
```

---

## **7. Format 类**
### 用于解析和写入不同格式的数据（如 GeoJSON, KML, WKT）。
```ts
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';

const geojson = new GeoJSON();
const wkt = new WKT();

const features = geojson.readFeatures(geojsonData); // 读取 GeoJSON 数据
const wktString = wkt.writeFeature(feature);        // 写入 WKT 数据
```

---

## **8. Projection 类**
### 坐标投影相关的工具。
```ts
import { fromLonLat, toLonLat } from 'ol/proj';

const webMercator = fromLonLat([116.4, 39.9]); // 将经纬度转为 EPSG:3857
const lonLat = toLonLat(webMercator);          // 将 EPSG:3857 转为经纬度
```

---

## **9. Utilities 工具类**
### 常见工具和方法。

#### (1) 坐标转换
```ts
import { getLength, getArea } from 'ol/sphere';

const length = getLength(lineString); // 获取线的长度
const area = getArea(polygon);        // 获取面的面积
```

#### (2) 事件监听
```ts
map.on('click', (event) => {
  const coordinate = event.coordinate; // 获取点击的坐标
  console.log(coordinate);
});
```

---

## **10. Controls 类**
### 地图控件，如缩放、全屏等。

#### (1) 默认控件
```ts
import { defaults as defaultControls } from 'ol/control';

const controls = defaultControls(); // 默认控件（缩放、全屏等）
```

#### (2) 自定义控件
```ts
import Control from 'ol/control/Control';

const customControl = new Control({
  element: document.getElementById('custom-control'),
});
map.addControl(customControl);
```

---

## **11. LayerGroup 类**
### 管理图层组。
```ts
import LayerGroup from 'ol/layer/Group';

const layerGroup = new LayerGroup({
  layers: [rasterLayer, vectorLayer],
});
map.addLayer(layerGroup);
```

---


### Style
在 OpenLayers 中，`new Style` 的参数用于定义特征样式，它支持多种选项来设置特征的外观，比如填充颜色、边框样式、图标、文本标注等。以下是所有主要参数的详细说明及其含义：

### `Style` 构造函数的参数选项
```ts
const style = new Style({
  fill: new Fill(),
  stroke: new Stroke(),
  text: new Text(),
  image: new Icon() | new Circle() | new RegularShape(),
  zIndex: number,
  geometry: string | Geometry | GeometryFunction,
});
```

### 参数详解

#### 1. `fill`
- **类型**: `Fill`
- **描述**: 用于填充面状特征的样式。
- **常见属性**:
  ```ts
  new Fill({
    color: [r, g, b, a], // RGBA 颜色值
  });
  ```
- **示例**:
  ```ts
  new Fill({ color: [255, 0, 0, 0.5] }); // 半透明红色
  ```

---

#### 2. `stroke`
- **类型**: `Stroke`
- **描述**: 用于设置线条或面状特征边框的样式。
- **常见属性**:
  ```ts
  new Stroke({
    color: [r, g, b, a], // 边框颜色
    width: number,       // 边框宽度
    lineDash: [number, number], // 虚线样式，比如 [4, 4] 表示实线和空格长度
    lineCap: "round" | "square" | "butt", // 线条末端样式
    lineJoin: "round" | "bevel" | "miter", // 线条连接样式
  });
  ```
- **示例**:
  ```ts
  new Stroke({ color: [0, 0, 255, 1], width: 2, lineDash: [4, 4] });
  ```

---

#### 3. `text`
- **类型**: `Text`
- **描述**: 用于设置文本标注的样式。
- **常见属性**:
  ```ts
  new Text({
    font: '12px Calibri,sans-serif', // 字体和大小
    text: 'Hello World',             // 文本内容
    fill: new Fill({ color: [0, 0, 0, 1] }), // 文本颜色
    stroke: new Stroke({ color: [255, 255, 255, 1], width: 3 }), // 文本边框
    offsetX: number,                 // 水平偏移
    offsetY: number,                 // 垂直偏移
    textAlign: "left" | "right" | "center", // 文本对齐
    textBaseline: "top" | "middle" | "bottom", // 基线对齐
  });
  ```
- **示例**:
  ```ts
  new Text({
    text: 'Park',
    font: '14px Arial, sans-serif',
    fill: new Fill({ color: [0, 255, 0, 1] }),
    offsetX: 10,
    offsetY: -10,
  });
  ```

---

#### 4. `image`
- **类型**: `Icon` | `Circle` | `RegularShape`
- **描述**: 用于设置点特征的图标样式。
  
##### (1) `Icon`
- 用于加载图片作为点样式。
- **常见属性**:
  ```ts
  new Icon({
    src: 'path/to/icon.png', // 图标路径
    scale: number,           // 缩放比例
    rotation: number,        // 旋转角度（弧度）
    anchor: [0.5, 0.5],      // 图标锚点
  });
  ```
- **示例**:
  ```ts
  new Icon({ src: '/marker.png', scale: 1.0 });
  ```

##### (2) `Circle`
- 用于绘制圆形点样式。
- **常见属性**:
  ```ts
  new Circle({
    radius: number,             // 半径
    fill: new Fill(),           // 填充样式
    stroke: new Stroke(),       // 边框样式
  });
  ```
- **示例**:
  ```ts
  new Circle({
    radius: 5,
    fill: new Fill({ color: [255, 0, 0, 1] }),
    stroke: new Stroke({ color: [0, 0, 0, 1], width: 1 }),
  });
  ```

##### (3) `RegularShape`
- 用于绘制规则形状（如星形、三角形）。
- **常见属性**:
  ```ts
  new RegularShape({
    points: number,             // 顶点数量
    radius: number,             // 半径
    angle: number,              // 起始角度（弧度）
    fill: new Fill(),           // 填充样式
    stroke: new Stroke(),       // 边框样式
  });
  ```
- **示例**:
  ```ts
  new RegularShape({
    points: 5,
    radius: 10,
    fill: new Fill({ color: [0, 255, 0, 1] }),
  });
  ```

---

#### 5. `zIndex`
- **类型**: `number`
- **描述**: 设置样式的图层顺序，`zIndex` 较高的样式会覆盖较低的样式。
- **示例**:
  ```ts
  zIndex: 2,
  ```

---

#### 6. `geometry`
- **类型**: `string | Geometry | GeometryFunction`
- **描述**: 指定样式应用到特定的几何形状。
  - `string`: 属性名称。
  - `Geometry`: 自定义几何对象。
  - `GeometryFunction`: 动态生成几何的函数。
- **示例**:
  ```ts
  geometry: 'geometryFieldName', // 根据属性字段指定几何
  ```

---



## TIPS:
1. 在使用第三方地图服务时，应确保其提供的坐标系与您使用的坐标系相匹配。
  - 比如geojson.io绘制的点坐标是4326，而高德地图的坐标是GCJ02。
2. 当调用本地瓦片的时候需要启动本地瓦片服务器（先下载瓦片地图数据）



## 常见问题：
### zoom不生效
View 的 zoom 属性会在地图加载时生效，但如果你在初始化时调用了 map.getView().fit() 方法，它可能会覆盖原始的 zoom 设置。你在地图加载时调用了 fit，它会强制调整视图，以确保所有特征都可以显示在视口内。
 解决办法：在地图加载完毕后，调用 fit 来调整视图范围
 ```js
    // 确保四边形在地图视图范围内
    const geometry = square.getGeometry();
    if (geometry) {
      const extent = geometry.getExtent();
      map.getView().fit(extent, { padding: [50, 50, 50, 50] });
      // 确保地图加载后更新 zoom（如果需要）
      map.getView().setZoom(5);
    } else {
      console.error("四边形几何属性未定义");
    }
 ```



 ## 示例：
 [示例合集](https://openlayers.vip/examples/)
 [OpenLayers 示例锦集](http://develop.smaryun.com:81/API/JS/OL3InterfaceDemo/index.htm)

 ## 参考：
 [OpenLayers 官网](https://openlayers.org/)
 [OpenLayers 官网例子的中文详解](https://segmentfault.com/a/1190000009679800)