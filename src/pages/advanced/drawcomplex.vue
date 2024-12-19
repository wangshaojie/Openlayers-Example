<template>
  <div id="map"></div>
</template>
<!-- 文档在docs里的了flight -->
<script setup lang="ts">
import { onMounted } from "vue";
import Feature from "ol/Feature.js";
import { LineString, Point } from "ol/geom.js";
import Map from "ol/Map.js";
import StadiaMaps from "ol/source/StadiaMaps.js";
import VectorSource from "ol/source/Vector.js";
import View from "ol/View.js";
import { Stroke, Style, Icon } from "ol/style.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { getVectorContext } from "ol/render.js";
import { getWidth } from "ol/extent.js";
import flightRoute from "@/assets/u328.png";
import arc from "arc";
import flightUrl from "@/assets/json/flights.json";
import { fromLonLat } from "ol/proj";

// 地图初始化逻辑
onMounted(() => {
  /**
   * 创建一个瓦片图层（Tile Layer），用于显示地图底图。
   *
   * @type {TileLayer} 瓦片图层对象
   */
  const tileLayer: TileLayer = new TileLayer({
    /**
     * 设置图层的数据源。
     *
     * @type {StadiaMaps} 数据源对象，使用 Stadia Maps 提供的地图服务
     */
    source: new StadiaMaps({
      /**
       * 指定使用的地图样式。
       *
       * @type {string} 地图样式名称
       *
       * 'outdoors' 样式是一种适合户外活动的地图样式，它提供了丰富的地形和地物信息，
       * 包括道路、建筑物、水体、森林等。这种样式非常适合展示自然景观和城市环境。
       *
       * 其他可用的 Stadia Maps 样式包括：
       * - 'osm': OpenStreetMap 样式，标准的 OSM 地图。
       * - 'satellite': 卫星影像样式，显示卫星图像。
       * - 'terrain': 地形样式，显示地形信息。
       * - 'transport': 交通样式，强调道路和交通设施。
       */
      layer: "outdoors",
    }),
  });

  const map = new Map({
    layers: [tileLayer],
    target: "map",
    view: new View({
      center: fromLonLat([108.591706, 31.578426]),
      zoom: 5,
    }),
  });

  // 定义样式对象
  const style = new Style({
    // 定义线条样式
    stroke: new Stroke({
      color: "#EAE911", // 线条颜色，这里设置为黄色
      width: 2, // 线条宽度，单位为像素
    }),
    // 定义图标样式
    image: new Icon({
      anchor: [0.5, 0.5], // 图标的锚点，表示图标中心点的位置，值为 [x, y]，范围是 [0, 1]
      src: flightRoute, // 图标的图片路径，这里使用的是 `flightRoute` 变量，指向一个飞机图标
      rotation: -0.19931501061749937, // 图标的旋转角度，单位为弧度，负值表示逆时针旋转
      scale: 0.1, // 图标的缩放比例，值为 0.1 表示缩小到原图的 10%
    }),
  });

  // 创建一个矢量数据源
  const flightsSource = new VectorSource({
    // 数据来源的归属信息
    attributions:
      "Flight data by " +
      '<a href="https://openflights.org/data.html">OpenFlights</a>,',
    // 加载数据的函数
    loader: function () {
      // 获取飞行数据
      let flightsData = flightUrl.flights;
      // 遍历每个飞行数据
      for (let i = 0; i < flightsData.length; i++) {
        const flight = flightsData[i];
        const from = flight.from; // 起飞点
        const to = flight.to; // 目的地

        // 在两个位置之间创建一个大圆弧
        const arcGenerator = new arc.GreatCircle(
          { x: from.coordinate[1], y: from.coordinate[0] }, // 起飞点坐标
          { x: to.coordinate[1], y: to.coordinate[0] } // 目的地坐标
        );
        // 生成100个点，offset是偏移量
        const arcLine = arcGenerator.Arc(100, { offset: 10 });

        // 计算角度
        const rotation = calculateRotation(from.coordinate, to.coordinate);

        // 穿过-180°/+180°子午线的路径是分开的
        const features: Feature[] = [];

        // 遍历生成的弧线几何对象
        arcLine.geometries.forEach((geometry: any) => {
          const line = new LineString(geometry.coords); // 创建线对象
          // 将线对象的坐标系从 WGS84（EPSG:4326）转换为 Web Mercator 投影（EPSG:3857）
          line.transform("EPSG:4326", "EPSG:3857");

          // 将线对象添加到特征数组中
          features.push(
            new Feature({
              geometry: line, // 几何对象
              finished: false, // 是否已完成动画
              rotation: rotation, // 旋转角度
            })
          );
        });

        // 动画延迟
        addLater(features, i * 50);
      }

      // tileLayer 图层每次完成渲染之后调用
      tileLayer.on("postrender", animateFlights);
    },
  });

  /**
   * 确保只有当飞行路径的动画完成后，才会在地图上显示最终的线样式和图标。
   * 这样可以实现动态的飞行路径动画效果。
   */
  const flightsLayer = new VectorLayer({
    source: flightsSource, // 设置数据源为之前定义的 flightsSource
    style: (feature) => {
      // 根据特征属性判断是否显示最终的线样式
      if (feature.get("finished")) {
        // 如果特征的 "finished" 属性为 true，则返回最终的线样式
        return [
          new Style({
            stroke: new Stroke({
              color: "#EAE911", // 线条颜色，设置为黄色
              width: 2, // 线条宽度，设置为 2 像素
            }),
          }),
          new Style({
            image: new Icon({
              anchor: [0.5, 0.5], // 图标的锚点，表示图标中心点的位置，值为 [x, y]，范围是 [0, 1]
              src: flightRoute, // 图标的图片路径，这里使用的是 `flightRoute` 变量，指向一个飞机图标
              rotation: feature.get("rotation"), // 图标的旋转角度，从特征属性中获取
            }),
          }),
        ];
      }
      // 如果特征的 "finished" 属性为 false，则不显示任何样式
      return undefined;
    },
  });

  // 创建了一个矢量图层，并将 flightsLayer 添加到地图上
  map.addLayer(flightsLayer);

  const pointsPerMs = 0.05; // 每毫秒绘制的点数
  const step = 0.5; // 飞机图标移动的步长

  /**
   * 实现了飞行路径的动画效果，
   * 包括线段的逐步绘制和飞机图标的移动。
   * 通过控制每个特征的 finished 和 flight 属性，
   * 确保动画在适当的时间内完成，并且飞机图标能够沿着路径平滑移动。
   * @param event 帧事件
   */
  function animateFlights(event: any) {
    const vectorContext = getVectorContext(event); // 获取矢量上下文
    const frameState = event.frameState; // 获取当前帧的状态
    vectorContext.setStyle(style); // 设置矢量上下文的样式

    const features = flightsSource.getFeatures(); // 获取所有特征
    for (let i = 0; i < features.length; i++) {
      const feature = features[i]; // 当前处理的特征
      if (!feature.get("finished")) {
        // 如果动画尚未完成
        const geometry = feature.getGeometry() as LineString | Point; // 获取几何对象
        if (geometry) {
          const coords = geometry.getCoordinates(); // 获取几何对象的坐标

          const elapsedTime = frameState.time - feature.get("start"); // 计算已过去的时间
          if (elapsedTime >= 0) {
            const elapsedPoints = elapsedTime * pointsPerMs; // 计算已过去的点数
            if (elapsedPoints >= coords.length) {
              // 如果已过去的点数超过总点数
              feature.set("finished", true); // 标记动画已完成
              feature.set("flight", true); // 标记为飞行状态
              feature.set("index", 0); // 重置索引
            }

            const maxIndex = Math.min(elapsedPoints, coords.length); // 计算最大索引
            const currentLine = new LineString(coords.slice(0, maxIndex)); // 创建当前线段

            // 在当前和最近相邻的世界中需要动画
            const worldWidth = getWidth(
              map.getView().getProjection().getExtent()
            ); // 获取世界宽度
            const viewCenter = map.getView()?.getCenter(); // 获取视图中心
            const offset = viewCenter
              ? Math.floor(viewCenter[0] / worldWidth)
              : 0; // 计算偏移量
            currentLine.translate(offset * worldWidth, 0); // 平移线段
            vectorContext.drawGeometry(currentLine); // 绘制当前线段
            currentLine.translate(worldWidth, 0); // 再平移一个世界宽度
            vectorContext.drawGeometry(currentLine); // 再次绘制当前线段
          }
        }
      }

      if (feature.get("flight")) {
        // 如果特征处于飞行状态
        const geometry = feature.getGeometry() as LineString | Point; // 获取几何对象
        if (geometry) {
          const coords = geometry.getCoordinates(); // 获取几何对象的坐标
          let index = feature.get("index"); // 获取当前索引
          index += step; // 移动步长
          if (index >= coords.length - 1) {
            // 如果索引超过坐标长度
            index = 0; // 重置索引
          }
          if (index < 0) {
            // 如果索引小于 0
            index = 0; // 重置索引
          }
          feature.set("index", index); // 更新索引
          style.getImage()?.setRotation(feature.get("rotation")); // 更新图标的旋转角度
          vectorContext.setStyle(style); // 设置矢量上下文的样式

          // 确保获取到的坐标是一个数组
          const currentCoord = coords[Math.floor(index)]; // 获取当前坐标
          const currentPoint = new Point(
            typeof currentCoord === "number" ? [currentCoord, 0] : currentCoord
          ); // 创建当前点

          const worldWidth = getWidth(
            map.getView().getProjection().getExtent()
          ); // 获取世界宽度
          const viewCenter = map.getView().getCenter(); // 获取视图中心
          const offset = viewCenter
            ? Math.floor(viewCenter[0] / worldWidth)
            : 0; // 计算偏移量
          currentPoint.translate(offset * worldWidth, 0); // 平移点
          vectorContext.drawGeometry(currentPoint); // 绘制当前点
          currentPoint.translate(worldWidth, 0); // 再平移一个世界宽度
          vectorContext.drawGeometry(currentPoint); // 再次绘制当前点
        }
      }
    }
    map.render(); // 渲染地图
  }

  /**
   * 将一组特征延迟指定时间后添加到 flightsSource 数据源中，并为每个特征设置起始时间。
   * 通过计算每个特征的动画持续时间，确保特征按照顺序依次开始动画，
   * 避免同时开始导致的视觉混乱。
   * 这在实现多个飞行路径的动画时非常有用，可以模拟不同飞机依次起飞的效果。
   */
  function addLater(features: Feature[], timeout: number) {
    window.setTimeout(() => {
      let start = Date.now(); // 获取当前时间，作为起始时间
      features.forEach((feature) => {
        feature.set("start", start); // 设置特征的起始时间
        flightsSource.addFeature(feature); // 将特征添加到数据源中

        const geometry = feature.getGeometry(); // 获取特征的几何对象
        if (geometry instanceof LineString || geometry instanceof Point) {
          // 如果几何对象是线或点
          const duration = (geometry.getCoordinates().length - 1) / pointsPerMs; // 计算动画持续时间
          start += duration; // 更新起始时间，以便下一个特征从上一个特征结束的时间开始
        }
      });
    }, timeout); // 延迟指定时间后执行
  }

  /**
   * 计算从一个点 from 到另一个点 to 的旋转角度
   * 通过计算两个点之间的 x 和 y 方向上的差值，
   * 然后使用 Math.atan2 函数来得到旋转角度
   */
  function calculateRotation(from: number[], to: number[]) {
    const dx = to[0] - from[0]; // 计算 x 轴方向上的差值
    const dy = to[1] - from[1]; // 计算 y 轴方向上的差值
    return Math.atan2(dy, dx); // 使用 atan2 函数计算从点 from 到点 to 的旋转角度
  }
});
</script>
