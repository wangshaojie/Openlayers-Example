<template>
  <div class="home-page">
    <PageHeader title="地图可视化平台" sub-title="基于 OpenLayers 的多功能地图演示项目" />

    <a-row :gutter="[24, 24]">
      <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="category in categories" :key="category.path">
        <router-link :to="category.path">
          <a-card hoverable class="category-card">
            <div class="category-icon">
              <component :is="category.icon" />
            </div>
            <div class="category-info">
              <h3 class="category-title">{{ category.title }}</h3>
              <p class="category-desc">{{ category.description }}</p>
              <span class="category-count">{{ category.count }} 个示例</span>
            </div>
          </a-card>
        </router-link>
      </a-col>
    </a-row>

    <a-divider />

    <div class="project-info">
      <a-typography-title :level="4">项目技术栈</a-typography-title>
      <a-row :gutter="[16, 16]">
        <a-col :xs="12" :sm="8" :md="6" v-for="tech in techStack" :key="tech.name">
          <a-tag :color="tech.color">
            {{ tech.name }}
          </a-tag>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DashboardOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  BarChartOutlined,
  BoxPlotOutlined,
} from '@ant-design/icons-vue';
import PageHeader from '@/components/common/PageHeader.vue';

const categories = [
  {
    path: '/basic',
    title: '基础功能',
    description: '地图切换、瓦片加载、标注绘制等基础功能',
    count: 12,
    icon: DashboardOutlined,
  },
  {
    path: '/advanced',
    title: '高级功能',
    description: '热力图、轨迹动画、电子围栏、点线面绘制',
    count: 12,
    icon: ExperimentOutlined,
  },
  {
    path: '/cesium',
    title: '三维地球',
    description: '基于 Cesium 的三维地球展示',
    count: 2,
    icon: GlobalOutlined,
  },
  {
    path: '/echarts',
    title: '图表联动',
    description: 'ECharts 与 OpenLayers 集成示例',
    count: 1,
    icon: BarChartOutlined,
  },
  {
    path: '/three',
    title: '三维模型',
    description: 'Three.js 3D 模型加载与展示',
    count: 1,
    icon: BoxPlotOutlined,
  },
];

const techStack = [
  { name: 'Vue 3', color: 'green' },
  { name: 'TypeScript', color: 'blue' },
  { name: 'Vite', color: 'purple' },
  { name: 'OpenLayers', color: 'orange' },
  { name: 'Cesium', color: '#fff' },
  { name: 'ECharts', color: 'red' },
  { name: 'Three.js', color: 'geekblue' },
  { name: 'Ant Design Vue', color: 'cyan' },
  { name: 'Tailwind CSS', color: 'teal' },
];
</script>

<style scoped>
.home-page {
  padding: 0;
}

.category-card {
  height: 100%;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.category-icon {
  font-size: 32px;
  color: #1890ff;
  margin-bottom: 16px;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: rgba(0, 0, 0, 0.85);
}

.category-desc {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.category-count {
  font-size: 12px;
  color: #1890ff;
  background: #e6f7ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.project-info {
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
}
</style>
