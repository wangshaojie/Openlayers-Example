# 飞行路径文档

## VectorSource 对象:

- VectorSource 是 OpenLayers 中用于存储矢量数据的数据源对象。
- attributions:

- attributions 属性用于指定数据来源的归属信息。这里指明了飞行数据来源于 OpenFlights，并提供了链接。
- loader 函数:

loader 函数用于加载飞行数据并处理。
flightUrl.flights 获取飞行数据。
使用 for 循环遍历每个飞行数据。
创建大圆弧:

- arc.GreatCircle 用于在两个地理位置之间创建大圆弧。
from.coordinate 和 to.coordinate 分别表示起飞点和目的地的坐标。
- arcGenerator.Arc(100, { offset: 10 }) 生成 100 个点，offset 是偏移量。
- 计算旋转角度:

calculateRotation(from.coordinate, to.coordinate) 计算从起飞点到目的地的旋转角度。
- 处理穿过子午线的路径:

arcLine.geometries.forEach 遍历生成的弧线几何对象。
new LineString(geometry.coords) 创建线对象。
line.transform("EPSG:4326", "EPSG:3857") 将线对象的坐标系从 WGS84（EPSG:4326）转换为 Web Mercator 投影（EPSG:3857）。
将线对象添加到特征数组 features 中，每个特征包含几何对象、是否完成动画和旋转角度。
动画延迟:

- addLater(features, i * 50) 用于设置动画的延迟时间，每个飞行路径的动画延迟时间为 i * 50 毫秒。
渲染后调用动画:

- tileLayer.on("postrender", animateFlights) 在 tileLayer 图层每次完成渲染之后调用 animateFlights 函数，用于处理动画效果。
这些代码将飞行数据加载到地图上，并在地图上绘制飞行路径，同时处理路径的动画效果。