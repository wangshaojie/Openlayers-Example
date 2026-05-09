<template>
  <div class="track-playback-container">
    <div id="amap-container" class="map-container"></div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-header">
        <span class="control-title">智驾轨迹回放</span>
        <div class="status-badge" :class="isPlaying ? 'playing' : 'paused'">
          {{ isPlaying ? "播放中" : "已暂停" }}
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-section">
        <span class="time-label">{{ formatTime(currentTime) }}</span>
        <input
          type="range"
          class="progress-slider"
          :min="0"
          :max="totalDuration"
          :value="currentTime"
          step="0.01"
          @input="onSeek"
        />
        <span class="time-label">{{ formatTime(totalDuration) }}</span>
      </div>

      <!-- 播放控制 -->
      <div class="playback-controls">
        <button class="control-btn primary" @click="togglePlay">
          {{ isPlaying ? "⏸" : "▶" }}
        </button>
        <button class="control-btn" @click="resetPlay">⏮</button>
        <div class="speed-controls">
          <button
            v-for="speed in speedOptions"
            :key="speed.value"
            class="speed-btn"
            :class="{ active: playbackSpeed === speed.value }"
            @click="setSpeed(speed.value)"
          >
            {{ speed.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 实时信息面板 -->
    <div class="info-panel">
      <div class="info-title">实时数据</div>
      <div class="info-row">
        <div class="info-item full">
          <span class="info-label">当前速度</span>
          <span class="info-value speed-value">{{
            currentSpeed.toFixed(1)
          }}</span>
          <span class="info-unit">km/h</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">经度</span>
          <span class="info-value">{{ currentLng.toFixed(6) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">纬度</span>
          <span class="info-value">{{ currentLat.toFixed(6) }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">方向角</span>
          <span class="info-value">{{ currentHeading.toFixed(0) }}°</span>
        </div>
        <div class="info-item">
          <span class="info-label">当前时间</span>
          <span class="info-value time">{{ formatTime(currentTime) }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item full">
          <span class="info-label">轨迹点数</span>
          <span class="info-value"
            >{{ displayPoints.length }} / {{ rawPoints.length }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

// ============================================
// 类型定义
// ============================================
interface TrajectoryPoint {
  lng: number; // 经度
  lat: number; // 纬度
  speed: number; // 速度 km/h
  heading: number; // 方向角 度
  time: number; // 时间戳
}

let currentIndex = 1;

let lastRotation = 0;

let lastCenterTime = 0;

const traveledPath: number[][] = [];

// ============================================
// 常量配置
// ============================================
const AMAP_KEY = "21ff7e3372d0390da8c0a309f065d14d";
const AMAP_VERSION = "2.0";

const smoothStep = (t: number) => {
  return t * t * (3 - 2 * t);
};

const lerpAngle = (a: number, b: number, t: number) => {
  let delta = b - a;

  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  return a + delta * t;
};

const calculateHeading = (
  prevLng: number,
  prevLat: number,
  lng: number,
  lat: number,
) => {
  const angle = (Math.atan2(lat - prevLat, lng - prevLng) * 180) / Math.PI;

  return (90 - angle + 360) % 360;
};
// ============================================
// 模拟真实轨迹数据
// 基于北京望京->中关村->国贸的实际路线
// ============================================
const generateRealTrajectory = (): TrajectoryPoint[] => {
  const points: TrajectoryPoint[] = [];

  // 基准时间
  const startTime = new Date("2024-03-15 08:30:00").getTime();

  // 真实的道路坐标点序列 (北京主要道路)
  // 模拟从望京SOHO -> 阜通东大街 -> 望京街 -> 广顺南大街 -> 望京SOHO的环形路线
  const waypoints = [
    [116.4702, 39.9965], // 望京SOHO
    [116.4715, 39.995], // 阜通东大街南口
    [116.473, 39.9935], // 望京街西口
    [116.475, 39.992], // 广顺南大街
    [116.477, 39.9905], // 宏昌路
    [116.479, 39.989], // 望京路
    [116.481, 39.9875], // 阜通东大街
    [116.483, 39.986], // 望京街
    [116.485, 39.9845], // 广顺南大街
    [116.4835, 39.983], // 望京SOHO北
    [116.4815, 39.9845], // 返程
    [116.4795, 39.986],
    [116.4775, 39.9875],
    [116.4755, 39.989],
    [116.4735, 39.9905],
    [116.4715, 39.992],
    [116.4702, 39.9965], // 回到起点
  ];

  // 将每个航点之间进行插值，生成更密集的点
  const interpolatePoints = (
    start: number[],
    end: number[],
    count: number,
  ): number[][] => {
    const result: number[][] = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      result.push([
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
      ]);
    }
    return result;
  };

  // 生成所有轨迹点
  const allCoords: number[][] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const interpolated = interpolatePoints(waypoints[i], waypoints[i + 1], 20);
    allCoords.push(...interpolated.slice(0, -1));
  }
  allCoords.push(waypoints[waypoints.length - 1]);

  // 为每个坐标点生成速度和时间
  const baseSpeed = 40; // 基础速度 km/h
  let currentTime = startTime;
  let prevLng = allCoords[0][0];
  let prevLat = allCoords[0][1];

  allCoords.forEach((coord, index) => {
    const lng = coord[0];
    const lat = coord[1];

    // 计算方向角
    const dLng = lng - prevLng;
    const dLat = lat - prevLat;

    // 计算方向角
    const heading = calculateHeading(prevLng, prevLat, lng, lat);

    // 模拟速度变化: 路口减速、直线加速
    const isIntersection = index % 50 < 10;
    const speed = isIntersection
      ? baseSpeed * 0.4 + Math.random() * 10
      : baseSpeed * 0.8 + Math.random() * 20;

    // 时间增量 (基于速度，100m间隔)
    const distance = Math.sqrt(dLng * dLng + dLat * dLat) * 111000; // 约等于米
    const timeIncrement = (distance / speed) * 3.6 * 1000; // 转换为毫秒

    points.push({
      lng,
      lat,
      speed: Math.max(15, Math.min(80, speed)),
      heading,
      time: currentTime,
    });

    currentTime += timeIncrement;
    prevLng = lng;
    prevLat = lat;
  });

  return points;
};

// ============================================
// 道格拉斯-普克算法
// ============================================
const douglasPeucker = (
  points: TrajectoryPoint[],
  epsilon: number,
): TrajectoryPoint[] => {
  if (points.length < 3) return points;

  const first = points[0];
  const last = points[points.length - 1];

  let maxDistance = 0;
  let maxIndex = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  if (maxDistance > epsilon) {
    const left = douglasPeucker(points.slice(0, maxIndex + 1), epsilon);
    const right = douglasPeucker(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
};

const perpendicularDistance = (
  point: TrajectoryPoint,
  lineStart: TrajectoryPoint,
  lineEnd: TrajectoryPoint,
): number => {
  const dx = lineEnd.lng - lineStart.lng;
  const dy = lineEnd.lat - lineStart.lat;

  if (dx === 0 && dy === 0) {
    return Math.sqrt(
      Math.pow(point.lng - lineStart.lng, 2) +
        Math.pow(point.lat - lineStart.lat, 2),
    );
  }

  const t =
    ((point.lng - lineStart.lng) * dx + (point.lat - lineStart.lat) * dy) /
    (dx * dx + dy * dy);

  const nearestLng = lineStart.lng + t * dx;
  const nearestLat = lineStart.lat + t * dy;

  return Math.sqrt(
    Math.pow(point.lng - nearestLng, 2) + Math.pow(point.lat - nearestLat, 2),
  );
};

// ============================================
// 速度颜色映射
// ============================================
const getSpeedColor = (speed: number): string => {
  // 0-80 km/h 映射到 绿-黄-红
  const normalizedSpeed = Math.min(80, Math.max(0, speed)) / 80;

  if (normalizedSpeed < 0.5) {
    const r = Math.round(normalizedSpeed * 2 * 255);
    const g = 200;
    return `rgb(${r}, ${g}, 0)`;
  } else {
    const r = 255;
    const g = Math.round((1 - (normalizedSpeed - 0.5) * 2) * 200);
    return `rgb(${r}, ${g}, 0)`;
  }
};

// ============================================
// 状态
// ============================================
const AMapLoader = ref<any>(null);
const map = ref<any>(null);
const backgroundLine = ref<any>(null);
const trajectoryPolyline = ref<any>(null);
const vehicleMarker = ref<any>(null);

// 轨迹数据
const rawPoints = ref<TrajectoryPoint[]>([]);
const simplifiedPoints = ref<TrajectoryPoint[]>([]);

// 播放状态
const isPlaying = ref(false);
const currentTime = ref(0);
const playbackSpeed = ref(1);
const speedOptions = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
];

// 实时数据
const currentSpeed = ref(0);
const currentLng = ref(0);
const currentLat = ref(0);
const currentHeading = ref(0);

let animationFrameId: number | null = null;
let lastFrameTime = 0;

const totalDuration = computed(() => {
  if (!rawPoints.value.length) return 0;

  return (
    (rawPoints.value[rawPoints.value.length - 1].time -
      rawPoints.value[0].time) /
    1000
  );
});
const displayPoints = computed(() => simplifiedPoints.value);

// ============================================
// 时间格式化
// ============================================
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// ============================================
// 播放控制
// ============================================
const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    stopAnimation();
    lastFrameTime = performance.now();
    animate();
  } else {
    stopAnimation();
  }
};

const resetPlay = () => {
  stopAnimation();

  isPlaying.value = false;

  currentTime.value = 0;

  currentIndex = 1;

  traveledPath.length = 0;

  updatePositionByTimestamp(0);
};

const setSpeed = (speed: number) => {
  playbackSpeed.value = speed;
};

const onSeek = (event: Event) => {
  const target = event.target as HTMLInputElement;

  const time = parseFloat(target.value);

  currentTime.value = time;

  // 直接按真实时间更新
  updatePositionByTimestamp(time);
};

const stopAnimation = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

// ============================================
// 动画循环
// ============================================
const animate = () => {
  if (!isPlaying.value) return;

  const now = performance.now();

  // 防止掉帧瞬移
  const delta = Math.min((now - lastFrameTime) / 1000, 0.032);

  lastFrameTime = now;

  currentTime.value += delta * playbackSpeed.value;

  if (currentTime.value >= totalDuration.value) {
    currentTime.value = totalDuration.value;

    isPlaying.value = false;

    updatePositionByTimestamp(currentTime.value);

    return;
  }

  updatePositionByTimestamp(currentTime.value);

  animationFrameId = requestAnimationFrame(animate);
};

const updatePositionByTimestamp = (elapsedSeconds: number) => {
  if (rawPoints.value.length < 2) return;

  const startTime = rawPoints.value[0].time;

  const targetTime = startTime + elapsedSeconds * 1000;

  // 高性能 index 缓存
  while (
    currentIndex < rawPoints.value.length &&
    rawPoints.value[currentIndex].time < targetTime
  ) {
    currentIndex++;
  }

  const nextIndex = Math.min(currentIndex, rawPoints.value.length - 1);

  const prevIndex = Math.max(0, nextIndex - 1);

  const p1 = rawPoints.value[prevIndex];
  const p2 = rawPoints.value[nextIndex];

  const duration = p2.time - p1.time;

  let t = duration === 0 ? 0 : (targetTime - p1.time) / duration;

  t = Math.max(0, Math.min(1, t));

  // 平滑插值
  const smoothT = smoothStep(t);

  // 经纬度插值
  const lng = p1.lng + (p2.lng - p1.lng) * smoothT;

  const lat = p1.lat + (p2.lat - p1.lat) * smoothT;

  // 速度插值
  const speed = p1.speed + (p2.speed - p1.speed) * smoothT;

  // 方向角插值
  const heading = lerpAngle(p1.heading, p2.heading, smoothT);

  // 更新实时数据
  currentSpeed.value = speed;
  currentLng.value = lng;
  currentLat.value = lat;
  currentHeading.value = heading;

  // 更新车辆
  if (vehicleMarker.value) {
    vehicleMarker.value.setPosition([lng, lat]);

    vehicleMarker.value.setAngle(heading);
  }

  // 地图跟随节流
  if (performance.now() - lastCenterTime > 60) {
    map.value.setCenter([lng, lat], true);

    lastCenterTime = performance.now();
  }

  // 地图旋转节流
  if (Math.abs(lastRotation - heading) > 3) {
    lastRotation = heading;
  }

  // 轨迹增量更新
  if (traveledPath.length === 0) {
    traveledPath.push([lng, lat]);

    trajectoryPolyline.value.setPath(traveledPath);
  } else {
    const last = traveledPath[traveledPath.length - 1];

    const dx = lng - last[0];

    const dy = lat - last[1];

    if (dx * dx + dy * dy > 0.000000001) {
      traveledPath.push([lng, lat]);

      trajectoryPolyline.value.setPath(traveledPath);
    }
  }
};

const updateTrajectory = (rawIndex: number) => {
  if (!trajectoryPolyline.value || !rawPoints.value.length) return;

  const traveledPath = rawPoints.value
    .slice(0, Math.max(2, rawIndex))
    .map((p) => [p.lng, p.lat]);

  trajectoryPolyline.value.setPath(traveledPath);
};

// ============================================
// 地图初始化
// ============================================
const initMap = async () => {
  // 动态加载高德地图
  if (!window.AMap) {
    await loadAmapScript();
  }

  // 创建地图
  map.value = new window.AMap.Map("amap-container", {
    zoom: 17,
    center: [116.477, 39.989],
    viewMode: "3D",
    pitch: 35,
    rotation: 0,
    mapStyle: "amap://styles/darkblue",
  });
  // 添加控件
  map.value.addControl(new window.AMap.Scale());
  map.value.addControl(
    new window.AMap.MapType({ defaultType: window.AMap.MapType.SATELLITE_MAP }),
  );

  // 初始化轨迹数据
  rawPoints.value = generateRealTrajectory();
  simplifiedPoints.value = douglasPeucker(rawPoints.value, 0.00005);

  // 创建轨迹线
  createTrajectoryLine();

  // 创建车辆标记
  createVehicleMarker();

  // 调整视野
  map.value.setFitView();
};

const loadAmapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=${AMAP_VERSION}&key=${AMAP_KEY}&plugin=AMap.Scale,AMap.MapType,AMap.MouseTool,AMap.GeometryUtil`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load AMap"));
    document.head.appendChild(script);
  });
};

const createTrajectoryLine = () => {
  if (!map.value || simplifiedPoints.value.length < 2) return;

  const fullPath = rawPoints.value.map((p) => [p.lng, p.lat]);

  // =========================
  // 灰色背景轨迹（完整路线）
  // =========================
  backgroundLine.value = new window.AMap.Polyline({
    path: fullPath,
    strokeColor: "rgba(150,150,150,0.35)",
    strokeWeight: 6,
    strokeOpacity: 0.5,
    strokeLineJoin: "round",
    strokeLineCap: "round",
    zIndex: 10,
  });

  // =========================
  // 蓝色已行驶轨迹
  // =========================
  trajectoryPolyline.value = new window.AMap.Polyline({
    path: [],
    strokeColor: "#00D4FF",
    strokeWeight: 8,
    strokeOpacity: 0.95,
    strokeLineJoin: "round",
    strokeLineCap: "round",
    outlineColor: "#0A1F44",
    borderWeight: 2,
    zIndex: 20,
  });

  map.value.add(backgroundLine.value);
  map.value.add(trajectoryPolyline.value);
};

const createVehicleMarker = () => {
  if (!map.value) return;

  const firstPoint = rawPoints.value[0] || { lng: 116.477, lat: 39.989 };

  vehicleMarker.value = new window.AMap.Marker({
    position: [firstPoint.lng, firstPoint.lat],

    anchor: "center",

    autoRotation: false,

    icon: new window.AMap.Icon({
      size: new window.AMap.Size(64, 32),

      image: "https://a.amap.com/jsapi_demos/static/demo-center-v2/car.png",

      imageSize: new window.AMap.Size(64, 32),
    }),

    offset: new window.AMap.Pixel(-32, -16),

    angle: 0,

    zIndex: 999,
  });

  map.value.add(vehicleMarker.value);
};

// ============================================
// 生命周期
// ============================================
onMounted(() => {
  initMap();
});

onUnmounted(() => {
  stopAnimation();
  if (map.value) {
    map.value.destroy();
    map.value = null;
  }
});
</script>

<style scoped>
.track-playback-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a1a2e;
}

.map-container {
  width: 100%;
  height: 100%;
}

/* 控制面板 */
.control-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 300px;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 12px;
  padding: 16px 20px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.control-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.playing {
  background: rgba(39, 174, 96, 0.2);
  color: #27ae60;
}

.status-badge.paused {
  background: rgba(241, 196, 15, 0.2);
  color: #f1c40f;
}

/* 进度条 */
.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.time-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 45px;
  font-family: "SF Mono", "Consolas", monospace;
}

.progress-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #1890ff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.4);
  transition: transform 0.15s;
}

.progress-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

/* 播放控制 */
.playback-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.control-btn.primary {
  width: 48px;
  height: 48px;
  background: #1890ff;
  border-color: #1890ff;
  font-size: 18px;
}

.control-btn.primary:hover {
  background: #40a9ff;
}

.speed-controls {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.speed-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.speed-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.speed-btn.active {
  background: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

/* 信息面板 */
.info-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 240px;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.info-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-item.full {
  flex: none;
  width: 100%;
}

.info-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  font-family: "SF Mono", "Consolas", monospace;
}

.info-value.speed-value {
  font-size: 28px;
  font-weight: 700;
  color: #e74c3c;
  line-height: 1;
}

.info-value.time {
  font-size: 16px;
}

.info-unit {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-left: 4px;
}
</style>
