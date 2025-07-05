import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// 代码中引入后处理扩展库EffectComposer.js
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// 引入渲染通道RenderPass
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";

import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";

import { model, mesh, mesh2, mesh3 } from "./mesh.js";

//场景
const scene = new THREE.Scene();
scene.add(model); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const width = window.innerWidth; //canvas画布高度
const height = window.innerHeight; //canvas画布宽度

//相机
const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);
camera.position.set(92, 113, 85);
camera.lookAt(0, 0, 0);

// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启优化锯齿
});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);

// 将渲染器的canvas添加到body中
document.body.appendChild(renderer.domElement);

// 创建后处理对象EffectComposer，Webgl渲染器作为参数
const composer = new EffectComposer(renderer);
// 创建一个渲染器通道，场景和相机作为参数
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
// OutlinePass的第一个参数v2的尺寸必须和canvas画布的尺寸一致
const v2 = new THREE.Vector2(window.innerWidth, window.innerHeight);
const outlinePass = new OutlinePass(v2, scene, camera);
// outlinePass要通过selectedObjects参数来指定需要高亮描边的对象
outlinePass.selectedObjects = [mesh];
// 设置描边样式
outlinePass.visibleEdgeColor.set(0x00ff00);
// 设置描边厚度
outlinePass.edgeThickness = 5.0;
// 设置描边亮度
outlinePass.edgeStrength = 6.0;
// 设置描边闪烁(感觉很重要，默认值是0不闪烁)
outlinePass.pulsePeriod = 1.5;
composer.addPass(outlinePass);

// 创建闪屏效果通道
const glitchPass = new GlitchPass();
composer.addPass(glitchPass);

// 渲染循环
function render() {
  // renderer.render(scene, camera);
  composer.render();
  requestAnimationFrame(render);
}
render();

const controls = new OrbitControls(camera, renderer.domElement);

// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};
