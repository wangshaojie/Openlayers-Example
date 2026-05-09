# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Vue 3 + TypeScript + Vite 的地图可视化项目，基于 OpenLayers 实现多种地图功能演示。

## 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本（包含类型检查）
pnpm preview      # 预览生产构建
```

## 技术栈

- **框架**: Vue 3 (script setup) + TypeScript + Vite
- **UI**: Ant Design Vue 4.x + Tailwind CSS
- **地图**: OpenLayers (vue3-openlayers) + Cesium
- **图表**: ECharts (ol-echarts)
- **3D**: Three.js

## 架构

### 路由结构

路由按功能模块划分在 `src/router/modules/` 目录下：
- `basic.ts` - 基础功能（地图切换、标注、区域颜色等）
- `advanced.ts` - 高级功能（热力图、轨迹动画、电子围栏、点线面绘制等）
- `cesium.ts` - Cesium 3D 地球
- `echarts.ts` - ECharts 集成示例

主布局使用 `src/layouts/Layout.vue`，通过 Ant Design Vue Sider 实现菜单导航。

### 页面组织

```
src/pages/
├── basic/          # 基础示例
├── advanced/       # 高级示例
├── cesium/          # Cesium 示例
├── threejs/         # Three.js 示例
└── echartsDemo/     # ECharts 示例
```

### 核心概念（来自 README）

- **Layer（图层）**: Tile（瓦片）、Vector（矢量）、VectorTile（矢量瓦片）
- **Source（数据源）**: OSM、XYZ、GeoJSON、Vector
- **Control（控件）**: Zoom、ScaleLine、FullScreen、LayerSwitcher 等
- **Interaction（交互）**: Draw、Drag、Select 等
- **Style**: Fill、Stroke、Text、Icon、Circle

### 坐标系

- **OSM/OpenStreetMap**: EPSG:3857 (Web Mercator)
- **高德/腾讯**: GCJ-02（国测局加密坐标）
- **百度**: BD-09（百度加密坐标）
- **WGS-84**: EPSG:4326（GPS 原始坐标）

注意：geojson.io 绘制的坐标是 EPSG:4326，与国内地图服务不兼容，需要坐标转换。

## 配置文件

- `vite.config.ts` - Vite 配置，包含 vue、cesium 插件
- `tailwind.config.js` - Tailwind CSS 配置
- `postcss.config.js` - PostCSS 配置
