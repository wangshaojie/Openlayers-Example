import { createApp } from 'vue'
import './style.css'
import Antd from 'ant-design-vue';
import App from './App.vue'
import 'ant-design-vue/dist/reset.css';
import { router } from './router'

import "vue3-openlayers/styles.css";

import OpenLayersMap from "vue3-openlayers";

const app = createApp(App)
app.use(Antd)
app.use(OpenLayersMap)
app.use(router)
app.mount('#app')
