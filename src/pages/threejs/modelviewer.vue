
<template>
  <div class="home">
    <div class="canvas-container" ref="canvas"></div>
  </div>
</template>
 
<script setup>
import * as THREE from "three"
import { onMounted,ref } from "vue";
// 添加轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
// 引入gui.js库
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
// 实例化一个gui对象
const gui = new GUI()
 
const url = "../../../public/su7/source/SU7.glb";
let canvas = ref(null)
 
// 创建场景
const scene = new THREE.Scene()
// 创建相机
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000)
camera.position.set(0,2,6)
// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true // 设置抗锯齿
})
renderer.setSize(window.innerWidth,window.innerHeight)
 
// 设置渲染函数
const render = () =>{ 
  renderer.render(scene,camera)
  requestAnimationFrame(render)
}
 
// 监听页面变化
window.addEventListener("resize",()=>{ 
  renderer.setSize(window.innerWidth,window.innerHeight)
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
})
 
onMounted(()=>{
  // 添加控制器
  const controls = new OrbitControls(camera,canvas.value)
  controls.enableDamping = true 
  canvas.value.appendChild(renderer.domElement) // 将渲染器插入到dom中
  // 初始化渲染器，渲染背景
  scene.background = new THREE.Color("#ccc")
  scene.environment = new THREE.Color("#ccc")
  render()
})
 
// 添加网格地面
const gridHelper = new THREE.GridHelper(10,10)
gridHelper.material.opacity = 0.2
gridHelper.material.transparent = true
scene.add(gridHelper)
 
 
// 添加gltf汽车模型
const loader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("/draco/")
loader.setDRACOLoader(dracoLoader)
loader.load(url,(gltf)=>{
  scene.add(gltf.scene)
})
 
// 添加灯光
const light1 = new THREE.DirectionalLight(0xffffff, 0.7);
light1.position.set(0, 0, 10);
scene.add(light1);
const light2 = new THREE.DirectionalLight(0xffffff, 0.7);
light2.position.set(0, 0, -10);
scene.add(light2);
const light3 = new THREE.DirectionalLight(0xffffff, 0.7);
light3.position.set(10, 0, 0);
scene.add(light3);
const light4 = new THREE.DirectionalLight(0xffffff, 0.7);
light4.position.set(-10, 0, 0);
scene.add(light4);
const light5 = new THREE.DirectionalLight(0xffffff, 0.7);
light5.position.set(0, 10, 0);
scene.add(light5);
const light6 = new THREE.DirectionalLight(0xffffff, 0.3);
light6.position.set(5, 10, 0);
scene.add(light6);
const light7 = new THREE.DirectionalLight(0xffffff, 0.3);
light7.position.set(0, 10, 5);
scene.add(light7);
const light8 = new THREE.DirectionalLight(0xffffff, 0.3);
light8.position.set(0, 10, -5);
scene.add(light8);
const light9 = new THREE.DirectionalLight(0xffffff, 0.3);
light9.position.set(-5, 10, 0);
scene.add(light9);
</script>