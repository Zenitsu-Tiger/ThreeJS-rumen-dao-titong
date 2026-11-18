import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import group from "./mesh.js";
// 引入后期处理EffectComposer
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
// 颜色空间转换通道，解决屏幕显示颜色偏暗的问题
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
// 引入FXAA抗锯齿Shader
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
// 使用Shader创建后处理通道
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

//场景
const scene = new THREE.Scene();
scene.add(group); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const width = window.innerWidth; //canvas画布宽度
const height = window.innerHeight; //canvas画布高度

//相机
const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);
camera.position.set(92, 113, 85);
camera.lookAt(0, 0, 0);

// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  // 用了composer后，antialias对离屏画布不生效，抗锯齿交给后面的FXAA通道
  // antialias: true,
});
// 输出颜色空间：默认值就是SRGBColorSpace，写出来只是为了表明意图（旧写法outputEncoding已移除）
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);

// 将渲染器的canvas添加到body中
document.body.appendChild(renderer.domElement);

/* 后处理流程：Render → Outline → Output → FXAA */
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 创建OutlinePass通道
const v2 = new THREE.Vector2(width, height);
const outlinePass = new OutlinePass(v2, scene, camera);
outlinePass.visibleEdgeColor.set(0x00ffff); // 描边颜色：青色
outlinePass.edgeThickness = 4; // 描边粗细
outlinePass.edgeStrength = 6; // 描边亮度
composer.addPass(outlinePass);

// OutputPass：线性颜色 → sRGB，放在所有“效果通道”之后
const outputPass = new OutputPass();
composer.addPass(outputPass);

// FXAA抗锯齿通道：three.js官方示例的顺序是放在OutputPass之后，
// 因为FXAA是按“屏幕上看到的颜色(sRGB)”来判断边缘的
const fxaaPass = new ShaderPass(FXAAShader);
composer.addPass(fxaaPass);

// FXAA需要知道“一个像素有多大”：1 ÷ 实际像素数
function updateFXAAResolution(width, height) {
  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms["resolution"].value.x = 1 / (width * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y = 1 / (height * pixelRatio);
}
updateFXAAResolution(width, height);

// 点击按钮：给对应设备描边
function selectDevice(name) {
  const obj = group.getObjectByName(name);
  // 模型是异步加载的，加载完之前查不到对象；
  // 不判断的话会把[undefined]传给OutlinePass，渲染循环报错后直接停止
  if (!obj) return;
  outlinePass.selectedObjects = [obj];
}
document.getElementById("A").addEventListener("click", () => selectDevice("设备A"));
document.getElementById("B").addEventListener("click", () => selectDevice("设备B"));

const controls = new OrbitControls(camera, renderer.domElement);

// 渲染循环
function render() {
  // 用了composer，就用composer.render()代替renderer.render()
  composer.render();
  requestAnimationFrame(render);
}
render();

// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  composer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  updateFXAAResolution(width, height); // composer.setSize不会更新FXAA的resolution，要手动更新
};
