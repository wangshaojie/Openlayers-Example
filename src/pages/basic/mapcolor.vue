<template>
  <div id="map" class="map"></div>
  <table class="controls">
    <tr>
      <td><label for="hue">hue</label></td>
      <td><input id="hue" type="range" min="-180" max="180" :value="controlsVlaues.hueVal" @change="changeHue" /></td>
      <td><span id="hueOut">{{ controlsVlaues.hueVal }}</span> °&nbsp;</td>
    </tr>
    <tr>
      <td><label for="chroma">chroma</label></td>
      <td><input id="chroma" type="range" min="0" max="100" :value="controlsVlaues.chromaVal" /></td>
      <td><span id="chromaOut">{{ controlsVlaues.chromaVal }}</span> %</td>
    </tr>
    <tr>
      <td><label for="lightness">lightness</label></td>
      <td>
        <input id="lightness" type="range" min="0" max="100" :value="controlsVlaues.lightnessVal" />
      </td>
      <td><span id="lightnessOut">{{ controlsVlaues.lightnessVal }}</span> %</td>
    </tr>
  </table>
</template>

<script setup lang="ts">
/**
 * 设计思路：
 * 1. 使用 Vue 3 和 TypeScript 构建一个地图颜色调整工具。
 * 2. 利用 OpenLayers 库创建地图，并使用 RasterSource 进行像素级别的颜色调整。
 * 3. 提供三个滑块控件分别调整色调 (hue)、饱和度 (chroma) 和亮度 (lightness)。
 * 4. 当滑块值发生变化时，更新地图的颜色显示。
 * 5. 使用颜色转换函数将 RGB 转换为 HCL，再从 HCL 转换回 RGB。
 */
import { ref, onMounted, watch, reactive } from "vue";
import Map from "ol/Map.js";
import View from "ol/View.js";
import ImageLayer from "ol/layer/Image.js";
import { Raster as RasterSource, StadiaMaps } from "ol/source.js";

interface ControlMap {
  [key: string]: number;
}

const controlsVlaues = reactive({
  hueVal: 0,
  chromaVal: 100,
  lightnessVal: 100,
});

// 定义颜色转换常量
const Xn = 0.95047; // D65 白点的 X 值
const Yn = 1;       // D65 白点的 Y 值
const Zn = 1.08883; // D65 白点的 Z 值
const t0 = 4 / 29;  // 用于 XYZ 到 Lab 转换的常数
const t1 = 6 / 29;  // 用于 XYZ 到 Lab 转换的常数
const t2 = 3 * t1 * t1; // 用于 XYZ 到 Lab 转换的常数
const t3 = t1 * t1 * t1; // 用于 XYZ 到 Lab 转换的常数
const twoPi = 2 * Math.PI; // 2π，用于角度转换

// 将 XYZ 转换为 Lab
function xyz2lab(t: number): number {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

// 将 Lab 转换为 XYZ
function lab2xyz(t: number): number {
  return t > t1 ? t * t * t : t2 * (t - t0);
}

// 将 RGB 转换为 XYZ
function rgb2xyz(x: number): number {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

// 将 XYZ 转换为 RGB
function xyz2rgb(x: number): number {
  return (
    255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055)
  );
}

// 定义颜色转换函数（RGB to HCL 和 HCL to RGB）
function rgb2hcl(pixel: number[]): number[] {
  const red = rgb2xyz(pixel[0]); // 将红色通道从 RGB 转换为 XYZ
  const green = rgb2xyz(pixel[1]); // 将绿色通道从 RGB 转换为 XYZ
  const blue = rgb2xyz(pixel[2]); // 将蓝色通道从 RGB 转换为 XYZ

  const x = xyz2lab(
    (0.4124564 * red + 0.3575761 * green + 0.1804375 * blue) / Xn
  ); // 计算 X 分量
  const y = xyz2lab(
    (0.2126729 * red + 0.7151522 * green + 0.072175 * blue) / Yn
  ); // 计算 Y 分量
  const z = xyz2lab(
    (0.0193339 * red + 0.119192 * green + 0.9503041 * blue) / Zn
  ); // 计算 Z 分量

  const l = 116 * y - 16; // 计算 L* 分量
  const a = 500 * (x - y); // 计算 a* 分量
  const b = 200 * (y - z); // 计算 b* 分量

  const c = Math.sqrt(a * a + b * b); // 计算 C* 分量
  let h = Math.atan2(b, a); // 计算 H* 分量
  if (h < 0) {
    h += twoPi; // 确保 H* 在 [0, 2π] 范围内
  }

  pixel[0] = h; // 设置 H* 分量
  pixel[1] = c; // 设置 C* 分量
  pixel[2] = l; // 设置 L* 分量

  return pixel;
}

/**
 * 将 HCL 转换为 RGB
 */
function hcl2rgb(pixel: number[]): number[] {
  const h = pixel[0]; // 获取 H* 分量
  const c = pixel[1]; // 获取 C* 分量
  const l = pixel[2]; // 获取 L* 分量

  const a = Math.cos(h) * c; // 计算 a* 分量
  const b = Math.sin(h) * c; // 计算 b* 分量

  let y = (l + 16) / 116; // 计算 Y 分量
  let x = isNaN(a) ? y : y + a / 500; // 计算 X 分量
  let z = isNaN(b) ? y : y - b / 200; // 计算 Z 分量

  y = Yn * lab2xyz(y); // 将 Y 分量从 Lab 转换为 XYZ
  x = Xn * lab2xyz(x); // 将 X 分量从 Lab 转换为 XYZ
  z = Zn * lab2xyz(z); // 将 Z 分量从 Lab 转换为 XYZ

  pixel[0] = xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z); // 将 X 分量从 XYZ 转换为 RGB
  pixel[1] = xyz2rgb(-0.969266 * x + 1.8760108 * y + 0.041556 * z); // 将 Y 分量从 XYZ 转换为 RGB
  pixel[2] = xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z); // 将 Z 分量从 XYZ 转换为 RGB

  return pixel;
}

// 地图状态
const mapRef = ref<Map | null>(null); // 地图实例引用
const hue = ref(0); // 色调值
const chroma = ref(100); // 饱和度值
const lightness = ref(100); // 亮度值
const controls: ControlMap = {}; // 控件映射
let raster: RasterSource;
const createMap = () => {
  raster = new RasterSource({
    sources: [
      // 添加 Stadia Maps 图层作为底图
      new StadiaMaps({
        layer: "stamen_watercolor", // 使用 Stamen Watercolor 图层
      }),
    ],
    operation: function (pixels, data) {
      // 检查 pixels[0] 的类型，确保其为 number[]
      if (Array.isArray(pixels[0])) {
        const hcl = rgb2hcl(pixels[0]); // 将 RGB 转换为 HCL

        let h = hcl[0] + (Math.PI * data.hue) / 180; // 调整色调
        if (h < 0) {
          h += 2 * Math.PI; // 确保 H* 在 [0, 2π] 范围内
        } else if (h > 2 * Math.PI) {
          h -= 2 * Math.PI; // 确保 H* 在 [0, 2π] 范围内
        }
        hcl[0] = h;

        hcl[1] *= data.chroma / 100; // 调整饱和度
        hcl[2] *= data.lightness / 100; // 调整亮度

        return hcl2rgb(hcl); // 将 HCL 转换回 RGB
      } else {
        console.error("Unexpected type for pixels[0]:", pixels[0]);
        return pixels[0]; // 返回原像素值，避免中断操作
      }
    },
    lib: {
      rgb2hcl: rgb2hcl, // 注入颜色转换函数
      hcl2rgb: hcl2rgb,
      rgb2xyz: rgb2xyz,
      lab2xyz: lab2xyz,
      xyz2lab: xyz2lab,
      xyz2rgb: xyz2rgb,
      Xn: Xn,
      Yn: Yn,
      Zn: Zn,
      t0: t0,
      t1: t1,
      t2: t2,
      t3: t3,
      twoPi: twoPi,
    },
  });

  const map = new Map({
    layers: [
      new ImageLayer({
        source: raster, // 使用 RasterSource 作为图层源
      }),
    ],
    target: "map", // 绑定地图到 DOM 元素
    view: new View({
      center: [116.431579,39.93433], // 设置地图中心点
      zoom: 2, // 设置初始缩放级别
      maxZoom: 18, // 设置最大缩放级别
    }),
  });

  mapRef.value = map; // 将地图实例赋值给引用

  // 监听控制值的变化并更新地图
  watch(
    [hue, chroma, lightness],
    () => {
      updateMap(); // 更新地图
    },
    { immediate: true } // 立即执行一次
  );

  


  // beforeoperations是OpenLayers中的一个事件，用于在图层操作之前触发。在图层操作之前，会触发这个事件，并传入一个事件对象，其中包含了操作的数据。
  raster.on("beforeoperations", function (event) {
    const data = event.data; // 获取操作数据
    for (const id in controls) {
      data[id] = Number(controls[id]); // 将控件值传递给操作数据
    }
  });

  controls["hue"] = controlsVlaues.hueVal;
  controls["chroma"] = controlsVlaues.chromaVal;
  controls["lightness"] = controlsVlaues.lightnessVal;

  // const controlIds = ["hue", "chroma", "lightness"]; // 控件 ID 列表
  // controlIds.forEach(function (id) {
  //   const control = document.getElementById(id); // 获取控件元素
  //   const output = document.getElementById(id + "Out"); // 获取输出元素
  //   control.addEventListener("input", function () {
  //     output.innerText = control.value; // 更新输出文本
  //     raster.changed(); // 触发地图更新
  //   });
  //   output.innerText = control.value; // 初始化输出文本
  //   controls[id] = control; // 将控件元素添加到映射中
  // });
};


const changeHue = (e: Event) => {
  const target = e.target as HTMLInputElement;
  controlsVlaues.hueVal = Number(target.value);
  const id = target.id;
  controls[id] = +target.value;
  raster.changed(); // 触发地图更新
}

// 创建并初始化地图
onMounted(() => {
  createMap(); // 创建地图
});

// 更新地图的函数
function updateMap() {
  if (mapRef.value) {
    // 这里可以触发地图的重新渲染或其他必要的更新操作
    // OpenLayers通常会根据数据源的变化自动更新地图，因此这里可能不需要额外操作
    // 但为了确保，我们可以调用raster的changed方法（如果它暴露了这个方法）
    // 注意：在您的原始代码中，raster并没有直接暴露changed方法给外部调用
    // 如果需要，您可能需要修改RasterSource的实现以支持这种调用
    // 例如，通过添加一个自定义事件或方法来触发重新渲染
    // 这里仅作为示例，我们假设有一个方法可以触发更新
    // (mapRef.value as any).getLayers().item(0).getSource().changed(); // 不推荐这样做，因为这不是一个标准的API调用
    // 更合适的方法可能是重新创建RasterSource并应用到地图上，但这通常不是性能最优的做法
    // 一个更好的解决方案可能是使用OpenLayers
  }
}

</script>

<style  scoped>
.controls {
  position: absolute;
  right: 10px;
  top: 10px;
  background: rgb(0, 0, 0, .8);
  color: #FFF;
}
</style>