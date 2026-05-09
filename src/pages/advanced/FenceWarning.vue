<template>
  <div class="fence-warning-container">
    <!-- 左侧地图区域 -->
    <div class="map-section">
      <div id="fence-amap" class="map-container"></div>

      <!-- 地图操作提示 -->
      <div class="map-tips">
        <span v-if="drawMode">绘制模式：{{ drawMode === 'circle' ? '圆形围栏' : '多边形围栏' }}，左键拖动调整大小，右键结束绘制</span>
        <span v-else>点击"绘制围栏"开始绘制</span>
      </div>
    </div>

    <!-- 右侧控制面板 -->
    <div class="control-section">
      <!-- 围栏绘制控制 -->
      <div class="panel">
        <div class="panel-title">围栏绘制</div>
        <div class="draw-controls">
          <button class="btn" :class="{ active: drawMode === 'circle' }" @click="startDraw('circle')">
            绘制圆形
          </button>
          <button class="btn" :class="{ active: drawMode === 'polygon' }" @click="startDraw('polygon')">
            绘制多边形
          </button>
          <button class="btn secondary" @click="cancelDraw">取消绘制</button>
        </div>
      </div>

      <!-- 围栏列表管理 -->
      <div class="panel">
        <div class="panel-title">围栏列表 ({{ fenceList.length }})</div>
        <div class="fence-list">
          <div v-for="fence in fenceList" :key="fence.id" class="fence-item" :class="{ selected: selectedFenceId === fence.id }">
            <div class="fence-info" @click="selectFence(fence.id)">
              <span class="fence-name">{{ fence.name }}</span>
              <span class="fence-type">{{ fence.type === 'circle' ? '圆形' : '多边形' }}</span>
            </div>
            <div class="fence-actions">
              <button class="icon-btn" @click="toggleFenceVisible(fence.id)" :title="fence.visible ? '隐藏' : '显示'">
                {{ fence.visible ? '👁' : '👁‍🗨' }}
              </button>
              <button class="icon-btn danger" @click="deleteFence(fence.id)" title="删除">🗑</button>
            </div>
          </div>
          <div v-if="fenceList.length === 0" class="empty-tip">
            暂无围栏，请先绘制
          </div>
        </div>
      </div>

      <!-- 轨迹控制 -->
      <div class="panel">
        <div class="panel-title">轨迹回放</div>
        <div class="track-controls">
          <button class="btn" @click="toggleTrack">
            {{ trackPlaying ? '⏸ 暂停' : '▶ 开始' }}
          </button>
          <button class="btn secondary" @click="resetTrack">⏮ 重置</button>
          <div class="speed-select">
            <span>速度:</span>
            <select v-model="trackSpeed">
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 预警日志 -->
      <div class="panel log-panel">
        <div class="panel-title">预警日志 ({{ warningLogs.length }})</div>
        <div class="log-list">
          <div v-for="(log, index) in warningLogs" :key="index" class="log-item" :class="log.type">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="warningLogs.length === 0" class="empty-tip">
            暂无预警记录
          </div>
        </div>
      </div>
    </div>

    <!-- 预警弹窗 -->
    <div v-if="alertDialog.visible" class="alert-dialog" :class="alertDialog.type">
      <div class="alert-content">
        <div class="alert-icon">{{ alertDialog.type === 'enter' ? '🚨' : '✅' }}</div>
        <div class="alert-title">{{ alertDialog.type === 'enter' ? '越界告警' : '驶出告警' }}</div>
        <div class="alert-message">{{ alertDialog.message }}</div>
        <div class="alert-actions">
          <button class="btn" @click="closeAlert">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';

// ============================================
// 常量配置
// ============================================
const AMAP_KEY = '21ff7e3372d0390da8c0a309f065d14d';
const AMAP_VERSION = '2.0';

// ============================================
// 类型定义
// ============================================
interface CircleFence {
  id: string;
  name: string;
  type: 'circle';
  center: [number, number]; // [lng, lat]
  radius: number; // 米
  centerMarker: any;
  circleEditor: any;
  polygon: any;
  visible: boolean;
}

interface PolygonFence {
  id: string;
  name: string;
  type: 'polygon';
  path: [number, number][]; // [[lng, lat], ...]
  polygon: any;
  editor: any;
  visible: boolean;
}

type Fence = CircleFence | PolygonFence;

interface WarningLog {
  time: string;
  message: string;
  type: 'enter' | 'exit';
}

interface TrajectoryPoint {
  lng: number;
  lat: number;
  heading: number;
  speed: number;
}

// ============================================
// 地图实例管理 (useAmap)
// ============================================
let mapInstance: any = null;
let mapLoaded = false;

// 绘制事件的清理函数
let cleanupDrawEvents: (() => void) | null = null;

const loadAmapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=${AMAP_VERSION}&key=${AMAP_KEY}&plugin=AMap.Scale,AMap.MapType,AMap.CircleEditor,AMap.PolyEditor`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load AMap'));
    document.head.appendChild(script);
  });
};

const initMap = async () => {
  await loadAmapScript();

  // 地图实例单例，避免重复创建
  if (mapInstance) {
    return mapInstance;
  }

  mapInstance = new window.AMap.Map('fence-amap', {
    zoom: 15,
    center: [116.477, 39.989], // 北京望京
    viewMode: '2D',
    // 标准路网底图
    mapStyle: 'amap://styles/normal',
    // 关闭无关POI
    features: ['road', 'building'],
    showLabel: false,
  });

  // 添加控件
  mapInstance.addControl(new window.AMap.Scale());
  mapInstance.addControl(new window.AMap.MapType());

  mapLoaded = true;
  return mapInstance;
};

const destroyMap = () => {
  if (mapInstance) {
    mapInstance.destroy();
    mapInstance = null;
    mapLoaded = false;
  }
};

// ============================================
// 电子围栏管理 (useFence)
// ============================================
const fenceList = ref<Fence[]>([]);
const selectedFenceId = ref<string | null>(null);
const drawMode = ref<'circle' | 'polygon' | null>(null);

let fenceIdCounter = 1;

const generateFenceId = () => `fence_${fenceIdCounter++}`;

const generateFenceName = (type: 'circle' | 'polygon') => {
  const count = fenceList.value.filter(f => f.type === type).length + 1;
  return `${type === 'circle' ? '圆形围栏' : '多边形围栏'}${count}`;
};

/**
 * 绘制圆形围栏
 * 点击地图拖动设置半径，释放鼠标完成绘制
 */
const startDrawCircle = (map: any) => {
  let circleCenter: any = null;
  let tempCircle: any = null;
  let isDragging = false; // 是否在拖动中

  // 禁用地图拖拽
  map.setStatus({ dragEnable: false });
  console.log('【startDrawCircle】开始绘制圆形');

  // 左键点击：确定圆心
  const onClick = (e: any) => {
    if (tempCircle) return; // 已经创建了圆形，不再响应

    const lnglat = e.lnglat;
    circleCenter = lnglat;
    console.log('【Click】圆心:', lnglat.lng, lnglat.lat);

    tempCircle = new window.AMap.Circle({
      center: circleCenter,
      radius: 100, // 默认半径100米
      strokeColor: '#1890ff',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#1890ff',
      fillOpacity: 0.2,
    });
    map.add(tempCircle);
  };

  // 鼠标移动：调整半径
  const onMouseMove = (e: any) => {
    if (!tempCircle || !circleCenter) return;
    isDragging = true;
    const lnglat = e.lnglat;
    const radius = circleCenter.distance(lnglat);
    console.log('【MouseMove】radius:', radius);
    tempCircle.setRadius(radius);
  };

  // 右键点击：结束绘制
  const onRightClick = (e: any) => {
    if (!tempCircle || !circleCenter) return;

    // 如果没有拖动过，给一个默认半径
    if (!isDragging) {
      tempCircle.setRadius(100);
    }

    const radius = tempCircle.getRadius();
    const centerArr: [number, number] = [circleCenter.lng, circleCenter.lat];

    const fence: CircleFence = {
      id: generateFenceId(),
      name: generateFenceName('circle'),
      type: 'circle',
      center: centerArr,
      radius,
      centerMarker: null,
      circleEditor: null,
      polygon: tempCircle,
      visible: true,
    };

    console.log('【Circle Created】center:', centerArr, 'radius:', radius);

    fenceList.value.push(fence);

    // 初始化该围栏的状态
    if (trajectoryPoints.value.length > 0) {
      const currentIndex = Math.floor(currentTrackIndex.value);
      const point = trajectoryPoints.value[Math.min(currentIndex, trajectoryPoints.value.length - 1)];
      const isInside = isPointInCircle([point.lng, point.lat], fence.center, fence.radius);
      fenceStatusMap.value.set(fence.id, isInside);
      console.log('【Circle Fence Initialized】fenceId:', fence.id, 'isInside:', isInside, 'at point:', point.lng, point.lat);
    } else {
      fenceStatusMap.value.set(fence.id, false);
      console.log('【Circle Fence Initialized】fenceId:', fence.id, 'trajectory not ready, default to false');
    }

    startEditFence(fence.id);

    // 清理
    map.off('click', onClick);
    map.off('mousemove', onMouseMove);
    map.off('rightclick', onRightClick);
    map.setStatus({ dragEnable: true });
    tempCircle = null;
    circleCenter = null;
    isDragging = false;
    drawMode.value = null;
  };

  map.on('click', onClick);
  map.on('mousemove', onMouseMove);
  map.on('rightclick', onRightClick);

  // 设置清理函数
  cleanupDrawEvents = () => {
    map.off('click', onClick);
    map.off('mousemove', onMouseMove);
    map.off('rightclick', onRightClick);
    if (tempCircle && map) {
      map.remove(tempCircle);
    }
    map.setStatus({ dragEnable: true });
    tempCircle = null;
    circleCenter = null;
    isDragging = false;
  };
};

/**
 * 绘制多边形围栏
 * 点击添加顶点，右键完成绘制
 */
const startDrawPolygon = (map: any) => {
  // 禁用地图拖拽
  map.setStatus({ dragEnable: false });

  const points: [number, number][] = [];
  let tempPolyline: any = null;
  let tempPolygon: any = null;
  let tempMarkers: any[] = [];

  // 点击添加顶点
  const onClick = (e: any) => {
    const point: [number, number] = [e.lnglat.lng, e.lnglat.lat];
    points.push(point);

    // 添加临时标记
    const marker = new window.AMap.Marker({
      position: point,
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(12, 12),
        image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHJlY3Qgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiBmaWxsPSIjMTg5MGZmIi8+PC9zdmc+',
        imageSize: new window.AMap.Size(12, 12),
      }),
      offset: new window.AMap.Pixel(-6, -6),
    });
    map.add(marker);
    tempMarkers.push(marker);

    // 移除旧的线
    if (tempPolyline) {
      map.remove(tempPolyline);
    }
    // 移除旧的多边形
    if (tempPolygon) {
      map.remove(tempPolygon);
    }

    // 显示连线（2个点以上）
    if (points.length >= 2) {
      tempPolyline = new window.AMap.Polyline({
        path: points,
        strokeColor: '#1890ff',
        strokeOpacity: 0.8,
        strokeWeight: 2,
      });
      map.add(tempPolyline);
    }

    // 显示多边形预览（3个点以上）
    if (points.length >= 3) {
      tempPolygon = new window.AMap.Polygon({
        path: points,
        strokeColor: '#1890ff',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#1890ff',
        fillOpacity: 0.2,
      });
      map.add(tempPolygon);
    }
  };

  // 右键完成绘制
  const onRightClick = (e: any) => {
    if (points.length < 3) {
      alert('多边形至少需要3个顶点');
      return;
    }

    // 创建最终的多边形
    const finalPolygon = new window.AMap.Polygon({
      path: points,
      strokeColor: '#1890ff',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#1890ff',
      fillOpacity: 0.2,
    });

    // 添加到地图
    map.add(finalPolygon);

    const fence: PolygonFence = {
      id: generateFenceId(),
      name: generateFenceName('polygon'),
      type: 'polygon',
      path: [...points], // 存储副本，避免被清空
      polygon: finalPolygon,
      editor: null,
      visible: true,
    };

    fenceList.value.push(fence);

    // 初始化该围栏的状态
    if (trajectoryPoints.value.length > 0) {
      const currentIndex = Math.floor(currentTrackIndex.value);
      const point = trajectoryPoints.value[Math.min(currentIndex, trajectoryPoints.value.length - 1)];
      const isInside = isPointInPolygon([point.lng, point.lat], fence.path);
      fenceStatusMap.value.set(fence.id, isInside);
      console.log('【Fence Initialized】fenceId:', fence.id, 'isInside:', isInside, 'at point:', point.lng, point.lat);
      console.log('  polygon path:', fence.path);
    } else {
      // 轨迹还没准备好，先设置一个默认状态
      fenceStatusMap.value.set(fence.id, false);
      console.log('【Fence Initialized】fenceId:', fence.id, 'trajectory not ready, default to false');
    }

    startEditFence(fence.id);

    // 清理临时元素
    tempMarkers.forEach(m => map.remove(m));
    if (tempPolyline) map.remove(tempPolyline);
    if (tempPolygon) map.remove(tempPolygon);

    map.off('click', onClick);
    map.off('rightclick', onRightClick);
    tempPolyline = null;
    tempPolygon = null;
    tempMarkers = [];
    points.length = 0;
    drawMode.value = null;
  };

  map.on('click', onClick);
  map.on('rightclick', onRightClick);

  // 设置清理函数
  cleanupDrawEvents = () => {
    map.off('click', onClick);
    map.off('rightclick', onRightClick);
    tempMarkers.forEach(m => map.remove(m));
    if (tempPolyline) map.remove(tempPolyline);
    if (tempPolygon) map.remove(tempPolygon);
    // 恢复地图拖拽
    map.setStatus({ dragEnable: true });
    tempPolyline = null;
    tempPolygon = null;
    tempMarkers = [];
    points.length = 0;
  };
};

const startDraw = (type: 'circle' | 'polygon') => {
  if (!mapLoaded || !mapInstance) return;

  // 调用之前的清理函数
  if (cleanupDrawEvents) {
    cleanupDrawEvents();
    cleanupDrawEvents = null;
  }

  if (type === 'circle') {
    startDrawCircle(mapInstance);
  } else {
    startDrawPolygon(mapInstance);
  }
};

const cancelDraw = () => {
  // 调用清理函数
  if (cleanupDrawEvents) {
    cleanupDrawEvents();
    cleanupDrawEvents = null;
  }
  drawMode.value = null;
};

/**
 * 开始编辑围栏
 * 圆形使用 CircleEditor，多边形使用 PolyEditor
 */
const startEditFence = (fenceId: string) => {
  const fence = fenceList.value.find(f => f.id === fenceId);
  if (!fence || !mapInstance) return;

  // 停止之前的编辑
  if (selectedFenceId.value) {
    stopEditFence(selectedFenceId.value);
  }

  if (fence.type === 'circle') {
    // 圆形编辑器
    console.log('【CircleEditor】Creating editor for polygon:', fence.polygon);
    console.log('【CircleEditor】Polygon center:', fence.polygon.getCenter(), 'radius:', fence.polygon.getRadius());

    const circleEditor = new window.AMap.CircleEditor(mapInstance, fence.polygon);
    (fence as CircleFence).circleEditor = circleEditor;

    // 监听编辑变化，更新数据
    circleEditor.on('adjust', (e: any) => {
      const center = fence.polygon.getCenter();
      const radius = fence.polygon.getRadius();
      (fence as CircleFence).center = [center.lng, center.lat];
      (fence as CircleFence).radius = radius;
      console.log('Circle adjusted: center =', center, 'radius =', radius);
    });

    circleEditor.open();
    console.log('【CircleEditor】Editor opened');
    console.log('【CircleEditor】After open - center:', fence.polygon.getCenter(), 'radius:', fence.polygon.getRadius());
  } else {
    // 多边形编辑器
    const polyEditor = new window.AMap.PolyEditor(mapInstance, fence.polygon);
    (fence as PolygonFence).editor = polyEditor;

    polyEditor.on('adjust', (e: any) => {
      const path = fence.polygon.getPath();
      const newPath = path.map((p: any) => [p.lng, p.lat] as [number, number]);
      (fence as PolygonFence).path = newPath;
      console.log('Polygon adjusted: new path =', newPath);
    });

    polyEditor.open();
  }

  selectedFenceId.value = fenceId;
};

/**
 * 停止编辑围栏
 */
const stopEditFence = (fenceId: string) => {
  const fence = fenceList.value.find(f => f.id === fenceId);
  if (!fence) return;

  if (fence.type === 'circle' && (fence as CircleFence).circleEditor) {
    (fence as CircleFence).circleEditor.close();
  } else if (fence.type === 'polygon' && (fence as PolygonFence).editor) {
    (fence as PolygonFence).editor.close();
  }
};

/**
 * 选择围栏
 */
const selectFence = (fenceId: string) => {
  // 先停止之前的编辑
  if (selectedFenceId.value) {
    stopEditFence(selectedFenceId.value);
  }

  selectedFenceId.value = fenceId;
  startEditFence(fenceId);
};

/**
 * 切换围栏显隐
 */
const toggleFenceVisible = (fenceId: string) => {
  const fence = fenceList.value.find(f => f.id === fenceId);
  if (!fence || !mapInstance) return;

  fence.visible = !fence.visible;

  if (fence.visible) {
    mapInstance.add(fence.polygon);
  } else {
    mapInstance.remove(fence.polygon);
  }
};

/**
 * 删除围栏
 */
const deleteFence = (fenceId: string) => {
  const fence = fenceList.value.find(f => f.id === fenceId);
  if (!fence || !mapInstance) return;

  // 停止编辑
  stopEditFence(fenceId);

  // 从地图移除
  mapInstance.remove(fence.polygon);

  // 从列表移除
  const index = fenceList.value.findIndex(f => f.id === fenceId);
  if (index > -1) {
    fenceList.value.splice(index, 1);
  }

  if (selectedFenceId.value === fenceId) {
    selectedFenceId.value = null;
  }
};

// ============================================
// 轨迹与越界判断 (useTrackJudge)
// ============================================
/**
 * 生成模拟轨迹数据
 * 基于北京望京地区的一段环形路线
 */
const generateTrajectory = (): TrajectoryPoint[] => {
  const points: TrajectoryPoint[] = [];

  // 模拟从围栏外向围栏内行驶，再驶出的轨迹
  const waypoints = [
    { lng: 116.470, lat: 39.992 }, // 起点（围栏外）
    { lng: 116.472, lat: 39.991 },
    { lng: 116.474, lat: 39.990 }, // 进入圆形围栏边缘
    { lng: 116.476, lat: 39.989 }, // 进入围栏内
    { lng: 116.478, lat: 39.988 },
    { lng: 116.480, lat: 39.987 },
    { lng: 116.482, lat: 39.986 }, // 驶出围栏
    { lng: 116.484, lat: 39.985 },
    { lng: 116.486, lat: 39.984 }, // 终点（围栏外）
  ];

  // 插值生成更多点
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    const count = 30; // 每段30个点

    for (let j = 0; j < count; j++) {
      const t = j / count;
      const lng = start.lng + (end.lng - start.lng) * t;
      const lat = start.lat + (end.lat - start.lat) * t;

      // 计算方向角
      let heading = 0;
      if (i > 0 || j > 0) {
        const dLng = lng - (j > 0 ? waypoints[i].lng + (waypoints[i + 1].lng - waypoints[i].lng) * ((j - 1) / count) : waypoints[i - 1].lng);
        const dLat = lat - (j > 0 ? waypoints[i].lat + (waypoints[i + 1].lat - waypoints[i].lat) * ((j - 1) / count) : waypoints[i - 1].lat);
        heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;
        if (heading < 0) heading += 360;
      }

      // 模拟速度变化
      const speed = 30 + Math.random() * 20;

      points.push({ lng, lat, heading, speed });
    }
  }

  return points;
};

/**
 * GIS空间判断：点是否在圆形内
 * 原理：计算点到圆心的距离，与半径比较
 * @param point [lng, lat]
 * @param center [lng, lat]
 * @param radius 半径（米）
 */
const isPointInCircle = (point: [number, number], center: [number, number], radius: number): boolean => {
  const pt = new window.AMap.LngLat(point[0], point[1]);
  const c = new window.AMap.LngLat(center[0], center[1]);
  const distance = pt.distance(c);
  return distance <= radius;
};

/**
 * GIS空间判断：点是否在多边形内
 * 原理：射线法（Ray Casting Algorithm）
 * 从点向右发射射线，计算与多边形边界的交点个数
 * 奇数个交点 = 在多边形内，偶数个交点 = 在多边形外
 */
const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
  if (!polygon || polygon.length < 3) return false;
  const ring = polygon.map(p => new window.AMap.LngLat(p[0], p[1]));
  const pt = new window.AMap.LngLat(point[0], point[1]);
  return window.AMap.GeometryUtil.isPointInRing(pt, ring);
};

// 轨迹状态
const trajectoryPoints = ref<TrajectoryPoint[]>([]);
const trackPlaying = ref(false);
const trackSpeed = ref('1');
const currentTrackIndex = ref(0);
const vehicleMarker = ref<any>(null);

let trackAnimationId: number | null = null;
let lastTrackTime = 0;

// 预警相关
const warningLogs = ref<WarningLog[]>([]);
const alertDialog = reactive({
  visible: false,
  type: 'enter' as 'enter' | 'exit',
  message: '',
});

// 记录上一个状态，用于检测进入/驶出
const fenceStatusMap = ref<Map<string, boolean>>(new Map());

/**
 * 初始化轨迹
 */
const initTrack = (map: any) => {
  trajectoryPoints.value = generateTrajectory();

  // 创建车辆标记
  if (trajectoryPoints.value.length > 0) {
    const first = trajectoryPoints.value[0];
    vehicleMarker.value = new window.AMap.Marker({
      position: [first.lng, first.lat],
      content: '<div style="width:20px;height:20px;background:#e74c3c;border-radius:50%;border:2px solid #fff;"></div>',
      offset: new window.AMap.Pixel(-10, -10),
    });
    map.add(vehicleMarker.value);
  }

  // 绘制轨迹线
  const trackPath = trajectoryPoints.value.map(p => [p.lng, p.lat] as [number, number]);
  const trackLine = new window.AMap.Polyline({
    path: trackPath,
    strokeColor: 'rgba(150, 150, 150, 0.5)',
    strokeWeight: 3,
    strokeOpacity: 0.5,
  });
  map.add(trackLine);

  // 初始化围栏状态
  updateFenceStatus();
};

/**
 * 更新所有围栏的状态
 */
const updateFenceStatus = () => {
  // 使用 Math.floor 确保索引是整数
  const currentIndex = Math.floor(currentTrackIndex.value);
  console.log('updateFenceStatus called, index =', currentIndex);

  if (currentIndex >= trajectoryPoints.value.length) {
    console.log('updateFenceStatus: index out of bounds');
    return;
  }

  const point = trajectoryPoints.value[currentIndex];
  if (!point) {
    console.log('updateFenceStatus: point is undefined');
    return;
  }
  console.log('updateFenceStatus: point =', point.lng, point.lat);
  const pointLngLat: [number, number] = [point.lng, point.lat];

  console.log('updateFenceStatus: fenceList length =', fenceList.value.length);
  for (const fence of fenceList.value) {
    console.log('Checking fence:', fence.name, fence.type);
    let isInside: boolean;
    if (fence.type === 'circle') {
      isInside = isPointInCircle(pointLngLat, (fence as CircleFence).center, (fence as CircleFence).radius);
      console.log('Circle check: center =', (fence as CircleFence).center, 'radius =', (fence as CircleFence).radius);
    } else {
      console.log('Polygon path:', (fence as PolygonFence).path);
      isInside = isPointInPolygon(pointLngLat, (fence as PolygonFence).path);
    }
    console.log('Fence', fence.name, 'isInside:', isInside);

    const wasInside = fenceStatusMap.value.get(fence.id);
    console.log('  wasInside:', wasInside, '-> isInside:', isInside);

    // 如果是第一次检测，不触发预警，只记录状态
    if (wasInside === undefined || wasInside === null) {
      fenceStatusMap.value.set(fence.id, isInside);
      console.log('  -> Initial state recorded, skipping, fenceId =', fence.id);
      continue;
    }

    // 更新状态
    fenceStatusMap.value.set(fence.id, isInside);

    // 检测状态变化
    if (!wasInside && isInside) {
      // 进入围栏
      console.log('  -> TRIGGER ENTER WARNING');
      triggerWarning('enter', fence.name, point);
    } else if (wasInside && !isInside) {
      // 驶出围栏
      console.log('  -> TRIGGER EXIT WARNING');
      triggerWarning('exit', fence.name, point);
    } else {
      console.log('  -> No state change, wasInside =', wasInside, 'isInside =', isInside);
    }
  }
};

/**
 * 触发预警
 */
const triggerWarning = (type: 'enter' | 'exit', fenceName: string, point: TrajectoryPoint) => {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const message = type === 'enter'
    ? `车辆进入【${fenceName}】围栏`
    : `车辆驶出【${fenceName}】围栏`;

  // 添加日志
  warningLogs.value.unshift({ time, message, type });

  // 限制日志数量
  if (warningLogs.value.length > 50) {
    warningLogs.value.pop();
  }

  // 显示弹窗
  alertDialog.visible = true;
  alertDialog.type = type;
  alertDialog.message = `${message}\n位置: ${point.lng.toFixed(6)}, ${point.lat.toFixed(6)}`;
};

const closeAlert = () => {
  alertDialog.visible = false;
};

/**
 * 轨迹动画循环
 */
const animateTrack = () => {
  if (!trackPlaying.value) return;
  if (trajectoryPoints.value.length === 0) {
    console.log('animateTrack: trajectoryPoints is empty!');
    return;
  }
  if (fenceList.value.length === 0) {
    console.log('animateTrack: no fences defined');
  } else {
    console.log('animateTrack: fences count =', fenceList.value.length);
  }

  const now = performance.now();
  const delta = now - lastTrackTime;
  lastTrackTime = now;

  // 根据速度更新位置
  const speedFactor = parseFloat(trackSpeed.value) * 0.05;
  currentTrackIndex.value += delta * speedFactor * 0.1;

  if (currentTrackIndex.value >= trajectoryPoints.value.length - 1) {
    currentTrackIndex.value = trajectoryPoints.value.length - 1;
    trackPlaying.value = false;
  }

  // 更新车辆位置（带插值）
  updateVehiclePosition();

  // 检测越界
  updateFenceStatus();

  trackAnimationId = requestAnimationFrame(animateTrack);
};

const updateVehiclePosition = () => {
  if (!vehicleMarker.value || trajectoryPoints.value.length === 0) return;

  const index = Math.floor(currentTrackIndex.value);
  const nextIndex = Math.min(index + 1, trajectoryPoints.value.length - 1);
  const t = currentTrackIndex.value - index;

  const p1 = trajectoryPoints.value[index];
  const p2 = trajectoryPoints.value[nextIndex];

  // 线性插值位置
  const lng = p1.lng + (p2.lng - p1.lng) * t;
  const lat = p1.lat + (p2.lat - p1.lat) * t;

  // 插值方向角
  let heading = p1.heading + (p2.heading - p1.heading) * t;
  if (Math.abs(p2.heading - p1.heading) > 180) {
    heading = p2.heading > p1.heading
      ? p1.heading - (360 - (p2.heading - p1.heading)) * t
      : p1.heading + (360 - (p1.heading - p2.heading)) * t;
  }
  heading = (heading + 360) % 360;

  // 更新标记
  vehicleMarker.value.setPosition([lng, lat]);
  vehicleMarker.value.setAngle(heading);

  // 地图跟随
  if (mapInstance) {
    mapInstance.setCenter([lng, lat]);
  }
};

const toggleTrack = () => {
  trackPlaying.value = !trackPlaying.value;

  if (trackPlaying.value) {
    lastTrackTime = performance.now();
    console.log('Starting animation');
    trackAnimationId = requestAnimationFrame(animateTrack);
  } else {
    if (trackAnimationId) {
      cancelAnimationFrame(trackAnimationId);
      trackAnimationId = null;
    }
  }
};

const resetTrack = () => {
  trackPlaying.value = false;
  if (trackAnimationId) {
    cancelAnimationFrame(trackAnimationId);
    trackAnimationId = null;
  }
  currentTrackIndex.value = 0;
  updateVehiclePosition();
};

// ============================================
// 生命周期
// ============================================
onMounted(async () => {
  const map = await initMap();
  initTrack(map);
});

onUnmounted(() => {
  // 清理动画
  if (trackAnimationId) {
    cancelAnimationFrame(trackAnimationId);
  }

  // 清理地图监听器
  if (mapInstance) {
    mapInstance.off('click');
    mapInstance.off('mousedown');
    mapInstance.off('mousemove');
    mapInstance.off('mouseup');
    mapInstance.off('rightclick');
  }

  // 清理围栏编辑器
  fenceList.value.forEach(fence => {
    stopEditFence(fence.id);
  });

  // 销毁地图
  destroyMap();
});
</script>

<style scoped>
.fence-warning-container {
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
}

/* 右侧控制面板 */
.control-section {
  width: 320px;
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

/* 按钮样式 */
.btn {
  padding: 8px 16px;
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

.btn.active {
  background: #096dd9;
  box-shadow: 0 0 12px rgba(24, 144, 255, 0.4);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

/* 绘制控制 */
.draw-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 围栏列表 */
.fence-list {
  max-height: 200px;
  overflow-y: auto;
}

.fence-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.fence-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.fence-item.selected {
  background: rgba(24, 144, 255, 0.2);
  border: 1px solid rgba(24, 144, 255, 0.3);
}

.fence-info {
  flex: 1;
}

.fence-name {
  display: block;
  font-size: 13px;
  color: #fff;
  margin-bottom: 2px;
}

.fence-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.fence-actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.icon-btn.danger:hover {
  background: rgba(231, 76, 60, 0.2);
}

/* 轨迹控制 */
.track-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.speed-select {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.speed-select select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
}

/* 日志面板 */
.log-panel {
  flex: 1;
  min-height: 200px;
}

.log-list {
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 12px;
  display: flex;
  gap: 8px;
}

.log-item.enter {
  border-left: 3px solid #e74c3c;
}

.log-item.exit {
  border-left: 3px solid #27ae60;
}

.log-time {
  color: rgba(255, 255, 255, 0.4);
  font-family: 'SF Mono', monospace;
  flex-shrink: 0;
}

.log-message {
  color: rgba(255, 255, 255, 0.8);
  word-break: break-all;
}

.empty-tip {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
  padding: 20px;
}

/* 预警弹窗 */
.alert-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.alert-content {
  background: rgba(26, 26, 46, 0.98);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  min-width: 320px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.alert-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.alert-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
}

.alert-message {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
  line-height: 1.6;
  white-space: pre-line;
}

.alert-dialog.enter .alert-title {
  color: #e74c3c;
}

.alert-dialog.exit .alert-title {
  color: #27ae60;
}
</style>
