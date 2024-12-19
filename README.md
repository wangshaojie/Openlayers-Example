# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).


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