<template>
  <div class="spatial-analysis-container">
    <!-- 左侧地图区域 -->
    <div class="map-section">
      <div id="supermap-map" class="map-container"></div>

      <!-- 地图操作提示 -->
      <div class="map-tips">
        <span v-if="activeTool">
          {{ getToolTip() }}
          <span v-if="activeTool !== 'pan'" class="tip-action">右键结束</span>
        </span>
        <span v-else>选择空间查询工具开始分析</span>
      </div>
    </div>

    <!-- 右侧控制面板 -->
    <div class="control-section">
      <!-- 工具栏 -->
      <div class="panel">
        <div class="panel-title">空间分析工具</div>
        <div class="tool-grid">
          <!-- 空间查询工具 -->
          <div class="tool-group">
            <div class="tool-group-title">空间查询</div>
            <button class="tool-btn" :class="{ active: activeTool === 'pointQuery' }" @click="setTool('pointQuery')">
              <span class="tool-icon">📍</span>
              <span>点查询</span>
            </button>
            <button class="tool-btn" :class="{ active: activeTool === 'rectQuery' }" @click="setTool('rectQuery')">
              <span class="tool-icon">⬜</span>
              <span>矩形查询</span>
            </button>
            <button class="tool-btn" :class="{ active: activeTool === 'polygonQuery' }" @click="setTool('polygonQuery')">
              <span class="tool-icon">🔺</span>
              <span>多边形查询</span>
            </button>
          </div>

          <!-- 缓冲区分析 -->
          <div class="tool-group">
            <div class="tool-group-title">缓冲区分析</div>
            <button class="tool-btn" :class="{ active: activeTool === 'bufferAnalysis' }" @click="setTool('bufferAnalysis')">
              <span class="tool-icon">⭕</span>
              <span>道路缓冲区</span>
            </button>
          </div>

          <!-- 基础操作 -->
          <div class="tool-group">
            <div class="tool-group-title">基础操作</div>
            <button class="tool-btn" :class="{ active: activeTool === 'pan' }" @click="setTool('pan')">
              <span class="tool-icon">✋</span>
              <span>平移</span>
            </button>
            <button class="tool-btn secondary" @click="clearAll">
              <span class="tool-icon">🗑</span>
              <span>清除</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 缓冲区设置 -->
      <div v-if="activeTool === 'bufferAnalysis'" class="panel">
        <div class="panel-title">缓冲区分析设置</div>
        <div class="buffer-settings">
          <div class="form-item">
            <label>缓冲区半径（米）</label>
            <input type="number" v-model.number="bufferRadius" min="10" max="500" step="10" />
          </div>
          <div class="form-item">
            <label>分析图层</label>
            <select v-model="bufferLayer">
              <option value="road">道路网</option>
            </select>
          </div>
          <button class="btn" @click="executeBufferAnalysis" :disabled="!tempGeometry">
            执行分析
          </button>
        </div>
      </div>

      <!-- 图层控制 -->
      <div class="panel">
        <div class="panel-title">图层控制</div>
        <div class="layer-list">
          <label v-for="layer in layerList" :key="layer.name" class="layer-item">
            <input type="checkbox" v-model="layer.visible" @change="toggleLayer(layer)" />
            <span class="layer-color" :style="{ background: layer.color }"></span>
            <span class="layer-name">{{ layer.label }}</span>
          </label>
        </div>
      </div>

      <!-- 查询结果 -->
      <div class="panel result-panel">
        <div class="panel-title">查询结果 ({{ queryResults.length }})</div>
        <div class="result-list">
          <div v-for="(result, index) in queryResults" :key="index" class="result-item" @click="highlightFeature(result)">
            <div class="result-header">
              <span class="result-index">{{ index + 1 }}</span>
              <span class="result-type">{{ result.type }}</span>
            </div>
            <div class="result-info">
              <template v-if="result.properties">
                <div v-for="(value, key) in result.properties" :key="key" class="result-row">
                  <span class="result-key">{{ key }}:</span>
                  <span class="result-value">{{ value }}</span>
                </div>
              </template>
            </div>
          </div>
          <div v-if="queryResults.length === 0" class="empty-tip">
            暂无查询结果
          </div>
        </div>
      </div>

      <!-- 坐标转换工具 -->
      <div class="panel">
        <div class="panel-title">坐标投影转换</div>
        <div class="coord-panel">
          <div class="coord-input">
            <label>输入坐标 (lng, lat)</label>
            <div class="coord-fields">
              <input type="number" v-model.number="inputCoord.lng" placeholder="经度" />
              <input type="number" v-model.number="inputCoord.lat" placeholder="纬度" />
            </div>
          </div>
          <div class="coord-select">
            <div class="form-item">
              <label>源坐标系</label>
              <select v-model="sourceCRS">
                <option value="EPSG:4326">WGS-84 (EPSG:4326)</option>
                <option value="EPSG:3857">Web Mercator (EPSG:3857)</option>
                <option value="EPSG:4490">CGCS2000 (EPSG:4490)</option>
              </select>
            </div>
            <div class="form-item">
              <label>目标坐标系</label>
              <select v-model="targetCRS">
                <option value="EPSG:4326">WGS-84 (EPSG:4326)</option>
                <option value="EPSG:3857">Web Mercator (EPSG:3857)</option>
                <option value="EPSG:4490">CGCS2000 (EPSG:4490)</option>
              </select>
            </div>
          </div>
          <button class="btn" @click="transformCoord">转换</button>
          <div v-if="outputCoord" class="coord-output">
            <label>转换结果</label>
            <div class="coord-result">{{ outputCoord.lng.toFixed(6) }}, {{ outputCoord.lat.toFixed(6) }}</div>
            <div class="coord-crs">{{ targetCRS }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 要素属性面板 -->
    <div v-if="selectedFeature" class="feature-panel">
      <div class="feature-header">
        <div class="feature-title">要素属性</div>
        <button class="close-btn" @click="selectedFeature = null">×</button>
      </div>
      <div class="feature-content">
        <div class="feature-section">
          <div class="section-title">几何信息</div>
          <div class="feature-row">
            <span class="feature-key">类型:</span>
            <span class="feature-value">{{ selectedFeature.geometry?.type || 'Unknown' }}</span>
          </div>
          <div class="feature-row">
            <span class="feature-key">坐标系:</span>
            <span class="feature-value">{{ selectedFeature.projection || 'EPSG:4326' }}</span>
          </div>
        </div>
        <div class="feature-section">
          <div class="section-title">属性信息</div>
          <div v-for="(value, key) in selectedFeature.properties" :key="key" class="feature-row">
            <span class="feature-key">{{ key }}:</span>
            <span class="feature-value">{{ value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';

// ============================================
// 常量配置
// ============================================
const SUPERMAP_BASE_URL = 'https://www.supermapol.com';
const TIANDITU_KEY = 'your_tianditu_key'; // 需要替换为实际的天地图密钥

// 图层配置
const LAYER_CONFIG = [
  { name: 'district', label: '行政区划', color: '#3498db', visible: true, url: '' },
  { name: 'road', label: '道路网', color: '#e74c3c', visible: true, url: '' },
  { name: 'poi', label: 'POI点', color: '#2ecc71', visible: true, url: '' },
];

// ============================================
// 类型定义
// ============================================
interface LayerConfig {
  name: string;
  label: string;
  color: string;
  visible: boolean;
  url: string;
}

interface QueryResult {
  id: string;
  type: string;
  geometry: any;
  properties: Record<string, any>;
}

interface Coordinate {
  lng: number;
  lat: number;
}

interface FeatureInfo {
  geometry?: any;
  properties?: Record<string, any>;
  projection?: string;
}

// ============================================
// 状态管理
// ============================================
const activeTool = ref<string | null>(null);
const bufferRadius = ref(50);
const bufferLayer = ref('road');
const tempGeometry = ref<any>(null);
const queryResults = ref<QueryResult[]>([]);
const selectedFeature = ref<FeatureInfo | null>(null);
const layerList = ref<LayerConfig[]>([...LAYER_CONFIG]);

// 坐标转换
const inputCoord = reactive<Coordinate>({ lng: 116.4074, lat: 39.9042 });
const sourceCRS = ref('EPSG:4326');
const targetCRS = ref('EPSG:3857');
const outputCoord = ref<Coordinate | null>(null);

// 绘制状态
let mapInstance: any = null;
let drawLayer: any = null;
let highlightLayer: any = null;
let bufferResultLayer: any = null;
let tempDrawSource: any = null;
let tempDrawLayer: any = null;
let cleanupDrawEvents: (() => void) | null = null;

// 模拟数据（实际项目中应从超图服务获取）
const mockDistrictData = {
  type: 'FeatureCollection',
  features: [
    {
      id: 'district_1',
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[116.35, 39.85], [116.45, 39.85], [116.45, 39.95], [116.35, 39.95], [116.35, 39.85]]],
      },
      properties: { name: '朝阳区', level: 'district', area: 470.8, population: 3450000 },
    },
    {
      id: 'district_2',
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[116.25, 39.85], [116.35, 39.85], [116.35, 39.95], [116.25, 39.95], [116.25, 39.85]]],
      },
      properties: { name: '东城区', level: 'district', area: 41.8, population: 900000 },
    },
  ],
};

const mockRoadData = {
  type: 'FeatureCollection',
  features: [
    {
      id: 'road_1',
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[116.40, 39.90], [116.42, 39.91], [116.44, 39.92]],
      },
      properties: { name: '东三环', type: '主干道', length: 2500, width: 40 },
    },
    {
      id: 'road_2',
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[116.38, 39.88], [116.40, 39.90], [116.42, 39.91]],
      },
      properties: { name: '建国路', type: '主干道', length: 1800, width: 35 },
    },
    {
      id: 'road_3',
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[116.42, 39.89], [116.43, 39.91], [116.44, 39.93]],
      },
      properties: { name: '朝阳门外大街', type: '次干道', length: 1500, width: 28 },
    },
  ],
};

const mockPOIData = {
  type: 'FeatureCollection',
  features: [
    { id: 'poi_1', type: 'Feature', geometry: { type: 'Point', coordinates: [116.41, 39.905] }, properties: { name: '国贸大厦', category: '商务办公', address: '建国门外大街1号' } },
    { id: 'poi_2', type: 'Feature', geometry: { type: 'Point', coordinates: [116.42, 39.91] }, properties: { name: '银泰中心', category: '商务办公', address: '建国门外大街2号' } },
    { id: 'poi_3', type: 'Feature', geometry: { type: 'Point', coordinates: [116.43, 39.92] }, properties: { name: '华贸中心', category: '商务办公', address: '建国路89号' } },
    { id: 'poi_4', type: 'Feature', geometry: { type: 'Point', coordinates: [116.405, 39.90] }, properties: { name: '中央电视台', category: '文化设施', address: '东三环中路32号' } },
    { id: 'poi_5', type: 'Feature', geometry: { type: 'Point', coordinates: [116.415, 39.895] }, properties: { name: '北京SKP', category: '商业中心', address: '建国路87号' } },
    { id: 'poi_6', type: 'Feature', geometry: { type: 'Point', coordinates: [116.425, 39.915] }, properties: { name: '财富中心', category: '商务办公', address: '东三环北路1号' } },
  ],
};

// ============================================
// 地图初始化
// ============================================
const initMap = async () => {
  // 动态加载 OpenLayers
  if (!(window as any).ol) {
    await loadOpenLayers();
  }
  const ol = (window as any).ol;

  // 创建地图实例
  mapInstance = new ol.Map({
    target: 'supermap-map',
    view: new ol.View({
      center: ol.proj.fromLonLat([116.4074, 39.9042]), // 北京
      zoom: 13,
      maxZoom: 18,
      minZoom: 8,
    }),
    layers: [],
  });

  // 添加天地图底图（使用高德地图作为替代）
  const gaodeLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      crossOrigin: 'anonymous',
    }),
    visible: true,
    opacity: 0.7,
  });
  mapInstance.addLayer(gaodeLayer);

  // 初始化绘制层
  initDrawLayers();

  // 添加模拟数据图层
  addMockDataLayers();

  // 添加比例尺控件
  mapInstance.addControl(new ol.control.ScaleLine());

  // 添加鼠标位置控件
  mapInstance.addControl(new ol.control.MousePosition({
    coordinateFormat: (coord: number[]) => ol.coordinate.toStringHDMS(coord),
    projection: 'EPSG:4326',
  }));
};

const loadOpenLayers = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).ol) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/ol@7.4.0/dist/ol.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/ol@7.4.0/ol.css';
      document.head.appendChild(link);
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load OpenLayers'));
    document.head.appendChild(script);
  });
};

// ============================================
// 图层管理
// ============================================
const initDrawLayers = () => {
  const ol = (window as any).ol;

  // 临时绘制层（用户绘制时的预览）
  tempDrawSource = new ol.source.Vector();
  tempDrawLayer = new ol.layer.Vector({
    source: tempDrawSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(24, 144, 255, 0.2)' }),
      stroke: new ol.style.Stroke({ color: '#1890ff', width: 2 }),
      image: new ol.style.Circle({ radius: 6, fill: new ol.style.Fill({ color: '#1890ff' }) }),
    }),
  });
  mapInstance.addLayer(tempDrawLayer);

  // 高亮层（查询结果高亮）
  const highlightSource = new ol.source.Vector();
  highlightLayer = new ol.layer.Vector({
    source: highlightSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(255, 180, 0, 0.3)' }),
      stroke: new ol.style.Stroke({ color: '#ffb400', width: 3 }),
      image: new ol.style.Circle({ radius: 8, fill: new ol.style.Fill({ color: '#ffb400' }) }),
    }),
  });
  mapInstance.addLayer(highlightLayer);

  // 缓冲区结果层
  const bufferSource = new ol.source.Vector();
  bufferResultLayer = new ol.layer.Vector({
    source: bufferSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(46, 204, 113, 0.2)' }),
      stroke: new ol.style.Stroke({ color: '#2ecc71', width: 2, lineDash: [5, 5] }),
    }),
  });
  mapInstance.addLayer(bufferResultLayer);
};

const addMockDataLayers = () => {
  const ol = (window as any).ol;

  // 行政区划层
  const districtSource = new ol.source.Vector({
    features: new ol.format.GeoJSON().readFeatures(mockDistrictData, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    }),
  });
  const districtLayer = new ol.layer.Vector({
    source: districtSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(52, 152, 219, 0.2)' }),
      stroke: new ol.style.Stroke({ color: '#3498db', width: 2 }),
    }),
    visible: true,
  });
  districtLayer.set('name', 'district');
  mapInstance.addLayer(districtLayer);

  // 道路网层
  const roadSource = new ol.source.Vector({
    features: new ol.format.GeoJSON().readFeatures(mockRoadData, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    }),
  });
  const roadLayer = new ol.layer.Vector({
    source: roadSource,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({ color: '#e74c3c', width: 4 }),
    }),
    visible: true,
  });
  roadLayer.set('name', 'road');
  mapInstance.addLayer(roadLayer);

  // POI 层
  const poiSource = new ol.source.Vector({
    features: new ol.format.GeoJSON().readFeatures(mockPOIData, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    }),
  });
  const poiLayer = new ol.layer.Vector({
    source: poiSource,
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({ color: '#2ecc71' }),
        stroke: new ol.style.Stroke({ color: '#fff', width: 1 }),
      }),
    }),
    visible: true,
  });
  poiLayer.set('name', 'poi');
  mapInstance.addLayer(poiLayer);
};

const toggleLayer = (layer: LayerConfig) => {
  const ol = (window as any).ol;
  const mapLayers = mapInstance.getLayers().getArray();
  const targetLayer = mapLayers.find((l: any) => l.get('name') === layer.name);
  if (targetLayer) {
    targetLayer.setVisible(layer.visible);
  }
};

// ============================================
// 工具切换
// ============================================
const setTool = (tool: string) => {
  // 清理之前的绘制事件
  if (cleanupDrawEvents) {
    cleanupDrawEvents();
    cleanupDrawEvents = null;
  }

  // 清除临时绘制
  if (tempDrawSource) {
    tempDrawSource.clear();
  }

  // 取消激活状态
  if (activeTool.value === tool) {
    activeTool.value = null;
    enablePanMode();
    return;
  }

  activeTool.value = tool;

  // 根据工具类型激活不同的绘制模式
  switch (tool) {
    case 'pointQuery':
      startPointQuery();
      break;
    case 'rectQuery':
      startRectQuery();
      break;
    case 'polygonQuery':
      startPolygonQuery();
      break;
    case 'bufferAnalysis':
      startBufferAnalysis();
      break;
    case 'pan':
      enablePanMode();
      break;
  }
};

const enablePanMode = () => {
  // 清除临时绘制
  if (tempDrawSource) {
    tempDrawSource.clear();
  }
  // 恢复光标
  if (mapInstance) {
    mapInstance.set('cursor', '');
  }
};

const getToolTip = () => {
  switch (activeTool.value) {
    case 'pointQuery':
      return '点击地图选择一个点进行查询';
    case 'rectQuery':
      return '按住鼠标拖动绘制矩形区域';
    case 'polygonQuery':
      return '点击添加多边形顶点，双击/右键结束';
    case 'bufferAnalysis':
      return '点击选择一条道路';
    default:
      return '';
  }
};

// ============================================
// 点查询
// ============================================
const startPointQuery = () => {
  const ol = (window as any).ol;

  let startPoint: number[] | null = null;

  const onClick = (evt: any) => {
    const coordinate = evt.coordinate;
    console.log('【点查询】点击坐标:', ol.proj.toLonLat(coordinate));

    // 绘制查询点
    tempDrawSource.clear();
    const pointFeature = new ol.Feature({
      geometry: new ol.geom.Point(coordinate),
    });
    tempDrawSource.addFeature(pointFeature);

    // 执行点查询（查询范围内要素）
    executePointQuery(coordinate);

    // 移除监听
    mapInstance.un('click', onClick);
  };

  mapInstance.on('click', onClick);

  cleanupDrawEvents = () => {
    mapInstance.un('click', onClick);
    tempDrawSource.clear();
  };
};

const executePointQuery = (pointCoordinate: number[]) => {
  const ol = (window as any).ol;
  const lonLat = ol.proj.toLonLat(pointCoordinate);
  const point: [number, number] = [lonLat[0], lonLat[1]];

  // 查询半径（地图上约500米）
  const queryRadius = 0.005;

  const results: QueryResult[] = [];

  // 查询行政区划
  mockDistrictData.features.forEach((feature) => {
    if (isPointInPolygon(point, feature.geometry.coordinates[0])) {
      results.push({
        id: feature.id,
        type: '行政区划',
        geometry: feature.geometry,
        properties: feature.properties,
      });
    }
  });

  // 查询道路
  mockRoadData.features.forEach((feature) => {
    if (isPointNearLine(point, feature.geometry.coordinates, queryRadius)) {
      results.push({
        id: feature.id,
        type: '道路',
        geometry: feature.geometry,
        properties: feature.properties,
      });
    }
  });

  // 查询 POI
  mockPOIData.features.forEach((feature) => {
    const distance = Math.sqrt(
      Math.pow(point[0] - feature.geometry.coordinates[0], 2) +
      Math.pow(point[1] - feature.geometry.coordinates[1], 2)
    );
    if (distance < queryRadius) {
      results.push({
        id: feature.id,
        type: 'POI',
        geometry: feature.geometry,
        properties: feature.properties,
      });
    }
  });

  queryResults.value = results;
  highlightResults(results);
};

// ============================================
// 矩形查询
// ============================================
const startRectQuery = () => {
  const ol = (window as any).ol;
  const mapContainer = document.getElementById('supermap-map');

  let isDrawing = false;
  let startCoord: number[] | null = null;
  let rectFeature: any = null;

  // 禁用地图拖拽
  mapInstance.set('cursor', 'crosshair');

  const onMouseMove = (e: MouseEvent) => {
    if (!isDrawing || !startCoord || !mapContainer) return;

    const rect = mapContainer.getBoundingClientRect();
    const pixel = new ol.Pixel(e.clientX - rect.left, e.clientY - rect.top);
    const currentCoord = mapInstance.getCoordinateFromPixel(pixel);

    tempDrawSource.clear();

    const minX = Math.min(startCoord[0], currentCoord[0]);
    const minY = Math.min(startCoord[1], currentCoord[1]);
    const maxX = Math.max(startCoord[0], currentCoord[0]);
    const maxY = Math.max(startCoord[1], currentCoord[1]);

    rectFeature = new ol.Feature({
      geometry: ol.geom.Polygon.fromExtent([minX, minY, maxX, maxY]),
    });
    tempDrawSource.addFeature(rectFeature);
  };

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || !mapContainer) return;

    const rect = mapContainer.getBoundingClientRect();
    const pixel = new ol.Pixel(e.clientX - rect.left, e.clientY - rect.top);
    startCoord = mapInstance.getCoordinateFromPixel(pixel);
    isDrawing = true;
    console.log('【矩形查询】开始绘制:', ol.proj.toLonLat(startCoord));

    e.preventDefault();
    e.stopPropagation();
  };

  const onMouseUp = (e: MouseEvent) => {
    if (!isDrawing || !startCoord || !mapContainer) return;
    isDrawing = false;

    const rect = mapContainer.getBoundingClientRect();
    const pixel = new ol.Pixel(e.clientX - rect.left, e.clientY - rect.top);
    const endCoord = mapInstance.getCoordinateFromPixel(pixel);
    console.log('【矩形查询】结束绘制:', ol.proj.toLonLat(endCoord));

    executeRectQuery([startCoord, endCoord]);

    // 恢复
    mapInstance.set('cursor', '');
    mapContainer.removeEventListener('mousemove', onMouseMove);
    mapContainer.removeEventListener('mousedown', onMouseDown);
    mapContainer.removeEventListener('mouseup', onMouseUp);

    if (cleanupDrawEvents) {
      cleanupDrawEvents = null;
    }
  };

  mapContainer?.addEventListener('mousemove', onMouseMove);
  mapContainer?.addEventListener('mousedown', onMouseDown);
  mapContainer?.addEventListener('mouseup', onMouseUp);

  cleanupDrawEvents = () => {
    mapInstance.set('cursor', '');
    mapContainer?.removeEventListener('mousemove', onMouseMove);
    mapContainer?.removeEventListener('mousedown', onMouseDown);
    mapContainer?.removeEventListener('mouseup', onMouseUp);
    tempDrawSource.clear();
  };
};

const executeRectQuery = (coords: number[][]) => {
  const ol = (window as any).ol;

  const minX = Math.min(coords[0][0], coords[1][0]);
  const minY = Math.min(coords[0][1], coords[1][1]);
  const maxX = Math.max(coords[0][0], coords[1][0]);
  const maxY = Math.max(coords[0][1], coords[1][1]);

  const extent: [number, number, number, number] = [minX, minY, maxX, maxY];
  const extentLonLat = [ol.proj.toLonLat([minX, minY]), ol.proj.toLonLat([maxX, maxY])];
  const queryExtent: [number, number, number, number] = [
    extentLonLat[0][0], extentLonLat[0][1],
    extentLonLat[1][0], extentLonLat[1][1]
  ];

  const results: QueryResult[] = [];

  // 查询行政区划
  mockDistrictData.features.forEach((feature) => {
    const coords = feature.geometry.coordinates[0];
    if (isPolygonIntersectRect(coords, queryExtent)) {
      results.push({
        id: feature.id,
        type: '行政区划',
        geometry: feature.geometry,
        properties: feature.properties,
      });
    }
  });

  // 查询道路
  mockRoadData.features.forEach((feature) => {
    if (isLineIntersectRect(feature.geometry.coordinates, queryExtent)) {
      results.push({
        id: feature.id,
        type: '道路',
        geometry: feature.geometry,
        properties: feature.properties,
      });
    }
  });

  // 查询 POI
  mockPOIData.features.forEach((feature) => {
    const [x, y] = feature.geometry.coordinates;
    if (x >= queryExtent[0] && x <= queryExtent[2] && y >= queryExtent[1] && y <= queryExtent[3]) {
      results.push({
        id: feature.id,
        type: 'POI',
        geometry: feature.geometry,
        properties: feature.properties,
      });
    }
  });

  queryResults.value = results;
  highlightResults(results);
};

// ============================================
// 多边形查询
// ============================================
const startPolygonQuery = () => {
  const ol = (window as any).ol;

  const points: number[][] = [];
  let tempLine: any = null;

  // 禁用地图拖拽
  mapInstance.set('cursor', 'crosshair');

  const finishPolygon = () => {
    if (points.length < 3) {
      alert('多边形至少需要3个顶点');
      return;
    }

    // 关闭多边形
    const polygonCoords = [...points, points[0]];
    tempDrawSource.clear();

    const polygonFeature = new ol.Feature({
      geometry: new ol.geom.Polygon([polygonCoords]),
    });
    tempDrawSource.addFeature(polygonFeature);

    // 保存几何对象供后续使用
    tempGeometry.value = { type: 'polygon', coordinates: points.map(p => ol.proj.toLonLat(p)) };

    // 执行多边形查询
    executePolygonQuery(points.map(p => ol.proj.toLonLat(p)));

    // 恢复地图拖拽
    mapInstance.set('cursor', '');

    mapInstance.un('click', onClick);
    mapInstance.un('dblclick', onDblClick);
    mapInstance.un('contextmenu', onContextMenu);
    points.length = 0;
  };

  const onClick = (evt: any) => {
    const coord = evt.coordinate;
    const lonLat = ol.proj.toLonLat(coord);
    points.push(coord);
    console.log('【多边形查询】添加顶点:', lonLat);

    // 绘制顶点标记
    const marker = new ol.Feature({
      geometry: new ol.geom.Point(coord),
    });
    tempDrawSource.addFeature(marker);

    // 绘制连线
    if (points.length >= 2) {
      if (tempLine) {
        tempDrawSource.removeFeature(tempLine);
      }
      tempLine = new ol.Feature({
        geometry: new ol.geom.LineString([...points]),
      });
      tempDrawSource.addFeature(tempLine);
    }
  };

  const onContextMenu = (evt: any) => {
    evt.preventDefault();
    console.log('【多边形查询】右键点击, points.length:', points.length);
    finishPolygon();
  };

  // 双击结束
  const onDblClick = (evt: any) => {
    evt.preventDefault();
    console.log('【多边形查询】双击, points.length:', points.length);
    finishPolygon();
  };

  mapInstance.on('click', onClick);
  mapInstance.on('dblclick', onDblClick);
  mapInstance.on('contextmenu', onContextMenu);

  cleanupDrawEvents = () => {
    mapInstance.set('cursor', '');
    mapInstance.un('click', onClick);
    mapInstance.un('dblclick', onDblClick);
    mapInstance.un('contextmenu', onContextMenu);
    tempDrawSource.clear();
    points.length = 0;
  };
};

const executePolygonQuery = (polygonCoords: number[][]) => {
  const results: QueryResult[] = [];

  // 查询行政区划
  mockDistrictData.features.forEach((feature) => {
    if (isPolygonIntersectPolygon(polygonCoords, feature.geometry.coordinates[0])) {
      results.push({
        id: feature.id,
        type: '行政区划',
        geometry: feature.geometry,
        properties: feature.properties,
      });
    }
  });

  // 查询道路
  mockRoadData.features.forEach((feature) => {
    if (isLineIntersectPolygon(feature.geometry.coordinates, polygonCoords)) {
      results.push({
        id: feature.id,
        type: '道路',
        geometry: feature.geometry,
        properties: feature.properties,
      });
    }
  });

  // 查询 POI
  mockPOIData.features.forEach((feature) => {
    if (isPointInPolygon(feature.geometry.coordinates, polygonCoords)) {
      results.push({
        id: feature.id,
        type: 'POI',
        geometry: feature.geometry,
        properties: feature.properties,
      });
    }
  });

  queryResults.value = results;
  highlightResults(results);
};

// ============================================
// 缓冲区分析
// ============================================
const startBufferAnalysis = () => {
  const ol = (window as any).ol;

  const onClick = (evt: any) => {
    const coord = evt.coordinate;
    const lonLat = ol.proj.toLonLat(coord);
    console.log('【缓冲区分析】点击坐标:', lonLat);

    // 查询最近的道路
    const nearestRoad = findNearestRoad(lonLat);
    if (nearestRoad) {
      tempGeometry.value = nearestRoad;
      // 高亮选中的道路
      highlightResults([{
        id: nearestRoad.id,
        type: '道路',
        geometry: nearestRoad.geometry,
        properties: nearestRoad.properties,
      }]);
    }

    mapInstance.un('click', onClick);
  };

  mapInstance.on('click', onClick);

  cleanupDrawEvents = () => {
    mapInstance.un('click', onClick);
  };
};

const findNearestRoad = (point: number[]): QueryResult | null => {
  let minDistance = Infinity;
  let nearest: QueryResult | null = null;

  mockRoadData.features.forEach((feature) => {
    const distance = pointToLineDistance(point, feature.geometry.coordinates);
    if (distance < minDistance && distance < 0.01) { // 约1公里范围内
      minDistance = distance;
      nearest = {
        id: feature.id,
        type: '道路',
        geometry: feature.geometry,
        properties: feature.properties,
      };
    }
  });

  return nearest;
};

const executeBufferAnalysis = () => {
  if (!tempGeometry.value || tempGeometry.value.type !== 'road') {
    alert('请先选择一条道路');
    return;
  }

  const ol = (window as any).ol;
  const road = tempGeometry.value;
  const roadCoords = road.geometry.coordinates;

  // 计算缓冲区（简化的缓冲区实现）
  const bufferCoords = calculateBuffer(roadCoords, bufferRadius.value / 111000); // 转换为度

  // 绘制缓冲区
  bufferResultLayer.getSource().clear();
  const bufferFeature = new ol.Feature({
    geometry: new ol.geom.Polygon([bufferCoords.map(c => ol.proj.fromLonLat(c))]),
  });
  bufferResultLayer.getSource().addFeature(bufferFeature);

  // 查询缓冲区内的 POI
  const results: QueryResult[] = [];
  mockPOIData.features.forEach((feature) => {
    if (isPointInPolygon(feature.geometry.coordinates, bufferCoords)) {
      results.push({
        id: feature.id,
        type: 'POI',
        geometry: feature.geometry,
        properties: feature.properties,
      });
    }
  });

  queryResults.value = results;
  highlightResults(results);
};

/**
 * 简化缓冲区计算
 * 将线段转换为带厚度的多边形
 */
const calculateBuffer = (lineCoords: number[][], radiusInDegrees: number): number[][] => {
  const leftSide: number[][] = [];
  const rightSide: number[][] = [];

  for (let i = 0; i < lineCoords.length; i++) {
    const [x, y] = lineCoords[i];

    // 计算法向量方向
    let dx = 0, dy = 0;
    if (i < lineCoords.length - 1) {
      dx = lineCoords[i + 1][0] - x;
      dy = lineCoords[i + 1][1] - y;
    } else {
      dx = x - lineCoords[i - 1][0];
      dy = y - lineCoords[i - 1][1];
    }

    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;

    leftSide.push([x + nx * radiusInDegrees, y + ny * radiusInDegrees]);
    rightSide.push([x - nx * radiusInDegrees, y - ny * radiusInDegrees]);
  }

  return [...leftSide, ...rightSide.reverse()];
};

// ============================================
// 几何判断工具函数
// ============================================

/**
 * 点是否在多边形内（射线法）
 */
const isPointInPolygon = (point: number[], polygon: number[][]): boolean => {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
};

/**
 * 点是否在线段附近
 */
const isPointNearLine = (point: number[], lineCoords: number[][], threshold: number): boolean => {
  for (let i = 0; i < lineCoords.length - 1; i++) {
    const dist = pointToSegmentDistance(point, lineCoords[i], lineCoords[i + 1]);
    if (dist < threshold) return true;
  }
  return false;
};

/**
 * 点到线段的距离
 */
const pointToSegmentDistance = (point: number[], segStart: number[], segEnd: number[]): number => {
  const [px, py] = point;
  const [x1, y1] = segStart;
  const [x2, y2] = segEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const nearestX = x1 + t * dx;
  const nearestY = y1 + t * dy;

  return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2);
};

/**
 * 点到线的距离
 */
const pointToLineDistance = (point: number[], lineCoords: number[][]): number => {
  let minDist = Infinity;
  for (let i = 0; i < lineCoords.length - 1; i++) {
    const dist = pointToSegmentDistance(point, lineCoords[i], lineCoords[i + 1]);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
};

/**
 * 多边形与矩形是否相交
 */
const isPolygonIntersectRect = (polygon: number[][], rect: [number, number, number, number]): boolean => {
  // 检查多边形任一点是否在矩形内
  for (const [x, y] of polygon) {
    if (x >= rect[0] && x <= rect[2] && y >= rect[1] && y <= rect[3]) {
      return true;
    }
  }
  // 检查矩形任一点是否在多边形内
  const rectCenter: [number, number] = [(rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2];
  if (isPointInPolygon(rectCenter, polygon)) {
    return true;
  }
  return false;
};

/**
 * 线与矩形是否相交
 */
const isLineIntersectRect = (lineCoords: number[][], rect: [number, number, number, number]): boolean => {
  for (let i = 0; i < lineCoords.length - 1; i++) {
    const [x1, y1] = lineCoords[i];
    const [x2, y2] = lineCoords[i + 1];

    // 线段与矩形四条边相交检测
    if (lineIntersectsRect(x1, y1, x2, y2, rect)) {
      return true;
    }
  }
  return false;
};

/**
 * 线段与矩形相交检测
 */
const lineIntersectsRect = (x1: number, y1: number, x2: number, y2: number, rect: [number, number, number, number]): boolean => {
  const [minX, minY, maxX, maxY] = rect;

  // 线段完全在矩形内
  if ((x1 >= minX && x1 <= maxX && y1 >= minY && y1 <= maxY) ||
      (x2 >= minX && x2 <= maxX && y2 >= minY && y2 <= maxY)) {
    return true;
  }

  // 线段与矩形四条边相交
  return (
    lineSegmentsIntersect(x1, y1, x2, y2, minX, minY, maxX, minY) ||
    lineSegmentsIntersect(x1, y1, x2, y2, maxX, minY, maxX, maxY) ||
    lineSegmentsIntersect(x1, y1, x2, y2, maxX, maxY, minX, maxY) ||
    lineSegmentsIntersect(x1, y1, x2, y2, minX, maxY, minX, minY)
  );
};

/**
 * 两线段是否相交
 */
const lineSegmentsIntersect = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): boolean => {
  const d1 = direction(x3, y3, x4, y4, x1, y1);
  const d2 = direction(x3, y3, x4, y4, x2, y2);
  const d3 = direction(x1, y1, x2, y2, x3, y3);
  const d4 = direction(x1, y1, x2, y2, x4, y4);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }

  return false;
};

const direction = (xi: number, yi: number, xj: number, yj: number, xk: number, yk: number): number => {
  return (xk - xi) * (yj - yi) - (xj - xi) * (yk - yi);
};

/**
 * 多边形与多边形是否相交
 */
const isPolygonIntersectPolygon = (poly1: number[][], poly2: number[][]): boolean => {
  // 检查 poly1 的任一点是否在 poly2 内
  for (const point of poly1) {
    if (isPointInPolygon(point, poly2)) return true;
  }
  // 检查 poly2 的任一点是否在 poly1 内
  for (const point of poly2) {
    if (isPointInPolygon(point, poly1)) return true;
  }
  return false;
};

/**
 * 线与多边形是否相交
 */
const isLineIntersectPolygon = (lineCoords: number[][], polygon: number[][]): boolean => {
  for (let i = 0; i < lineCoords.length - 1; i++) {
    const [x1, y1] = lineCoords[i];
    const [x2, y2] = lineCoords[i + 1];
    for (let j = 0; j < polygon.length - 1; j++) {
      const [x3, y3] = polygon[j];
      const [x4, y4] = polygon[j + 1];
      if (lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4)) {
        return true;
      }
    }
  }
  return false;
};

// ============================================
// 高亮显示
// ============================================
const highlightResults = (results: QueryResult[]) => {
  const ol = (window as any).ol;

  highlightLayer.getSource().clear();

  results.forEach((result) => {
    let feature: any;

    if (result.geometry.type === 'Point') {
      feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(result.geometry.coordinates)),
      });
    } else if (result.geometry.type === 'LineString') {
      feature = new ol.Feature({
        geometry: new ol.geom.LineString(result.geometry.coordinates.map((c: number[]) => ol.proj.fromLonLat(c))),
      });
    } else if (result.geometry.type === 'Polygon') {
      feature = new ol.Feature({
        geometry: new ol.geom.Polygon(result.geometry.coordinates.map((ring: number[][]) =>
          ring.map((c: number[]) => ol.proj.fromLonLat(c))
        )),
      });
    }

    if (feature) {
      feature.setProperties(result.properties);
      highlightLayer.getSource().addFeature(feature);
    }
  });

  // 地图缩放适应所有结果
  if (results.length > 0) {
    const extent = highlightLayer.getSource().getExtent();
    mapInstance.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });
  }
};

const highlightFeature = (result: QueryResult) => {
  selectedFeature.value = {
    geometry: result.geometry,
    properties: result.properties,
    projection: 'EPSG:4326',
  };

  // 定位到该要素
  const ol = (window as any).ol;
  if (result.geometry.type === 'Point') {
    const coord = ol.proj.fromLonLat(result.geometry.coordinates);
    mapInstance.getView().animate({ center: coord, zoom: 16 });
  }
};

// ============================================
// 坐标转换
// ============================================
const transformCoord = () => {
  const ol = (window as any).ol;

  let sourceProj = sourceCRS.value;
  let targetProj = targetCRS.value;

  // 如果源坐标系是 EPSG:4326 (lonLat)，需要转换
  let coord: number[];

  if (sourceProj === 'EPSG:4326') {
    coord = ol.proj.fromLonLat([inputCoord.lng, inputCoord.lat]);
  } else if (sourceProj === 'EPSG:3857') {
    coord = [inputCoord.lng, inputCoord.lat];
  } else {
    coord = [inputCoord.lng, inputCoord.lat];
  }

  // 执行投影转换
  let result: number[];
  if (targetProj === 'EPSG:4326') {
    result = ol.proj.toLonLat(coord);
  } else if (targetProj === 'EPSG:3857') {
    result = ol.proj.transform(coord, sourceProj, targetProj);
  } else {
    result = ol.proj.transform(coord, sourceProj, targetProj);
  }

  outputCoord.value = { lng: result[0], lat: result[1] };
};

// ============================================
// 清除操作
// ============================================
const clearAll = () => {
  activeTool.value = null;

  if (cleanupDrawEvents) {
    cleanupDrawEvents();
    cleanupDrawEvents = null;
  }

  // 清除所有临时绘制
  if (tempDrawSource) tempDrawSource.clear();
  if (highlightLayer) highlightLayer.getSource().clear();
  if (bufferResultLayer) bufferResultLayer.getSource().clear();

  // 清除查询结果
  queryResults.value = [];
  selectedFeature.value = null;
  tempGeometry.value = null;

  // 恢复平移模式
  enablePanMode();
};

// ============================================
// 生命周期
// ============================================
onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (cleanupDrawEvents) {
    cleanupDrawEvents();
  }
  if (mapInstance) {
    mapInstance.setTarget(null);
    mapInstance = null;
  }
});
</script>

<style scoped>
.spatial-analysis-container {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #0a0a0a;
}

/* 左侧地图 */
.map-section {
  flex: 1;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-tips {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tip-action {
  color: #1890ff;
  font-weight: 600;
}

/* 右侧控制面板 */
.control-section {
  width: 340px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.panel {
  background: rgba(26, 26, 46, 0.95);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* 工具栏 */
.tool-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-group-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.tool-btn.active {
  background: rgba(24, 144, 255, 0.2);
  border-color: #1890ff;
  color: #1890ff;
}

.tool-btn.secondary {
  background: rgba(255, 255, 255, 0.04);
}

.tool-icon {
  font-size: 16px;
}

/* 缓冲区设置 */
.buffer-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.form-item input,
.form-item select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
}

.form-item input:focus,
.form-item select:focus {
  outline: none;
  border-color: #1890ff;
}

/* 图层控制 */
.layer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #fff;
}

.layer-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.layer-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #1890ff;
}

.layer-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.layer-name {
  flex: 1;
}

/* 查询结果 */
.result-panel {
  flex: 1;
  min-height: 200px;
}

.result-list {
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  padding: 10px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.result-index {
  width: 20px;
  height: 20px;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.result-type {
  font-size: 11px;
  color: #2ecc71;
  padding: 2px 6px;
  background: rgba(46, 204, 113, 0.2);
  border-radius: 4px;
}

.result-info {
  font-size: 12px;
}

.result-row {
  display: flex;
  gap: 6px;
  margin-bottom: 3px;
  color: rgba(255, 255, 255, 0.6);
}

.result-key {
  color: rgba(255, 255, 255, 0.4);
}

.result-value {
  color: #fff;
  word-break: break-all;
}

/* 坐标转换 */
.coord-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coord-input label,
.coord-select label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
}

.coord-fields {
  display: flex;
  gap: 8px;
}

.coord-fields input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
}

.coord-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coord-select select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
}

.coord-output {
  padding: 12px;
  background: rgba(24, 144, 255, 0.1);
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 8px;
}

.coord-output label {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.coord-result {
  font-size: 14px;
  color: #1890ff;
  font-weight: 600;
  font-family: 'SF Mono', monospace;
}

.coord-crs {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

/* 按钮 */
.btn {
  padding: 10px 16px;
  background: #1890ff;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #40a9ff;
}

.btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

/* 要素属性面板 */
.feature-panel {
  position: fixed;
  top: 80px;
  right: 380px;
  width: 280px;
  background: rgba(26, 26, 46, 0.98);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  z-index: 100;
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(24, 144, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.close-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.feature-content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.feature-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
}

.feature-key {
  color: rgba(255, 255, 255, 0.5);
  min-width: 60px;
}

.feature-value {
  color: #fff;
  word-break: break-all;
}

.empty-tip {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
  padding: 20px;
}
</style>
