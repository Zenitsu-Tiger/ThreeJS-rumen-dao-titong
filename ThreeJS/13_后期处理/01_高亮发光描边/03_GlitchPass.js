import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// 后处理扩展库 EffectComposer：管理整条后处理流水线
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// 渲染通道 RenderPass：流水线第一步，渲染出原始场景
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// 描边通道 OutlinePass
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
// 闪屏通道 GlitchPass
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
// 输出通道 OutputPass：放在流水线最后，负责颜色空间转换，不加画面会偏暗
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import { model, mesh } from "./mesh.js";

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

const width = window.innerWidth; //canvas画布宽度
const height = window.innerHeight; //canvas画布高度

//相机
const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);
camera.position.set(92, 113, 85);
camera.lookAt(0, 0, 0);

// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启优化锯齿
});
renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);

// 将渲染器的canvas添加到body中
document.body.appendChild(renderer.domElement);

// 创建后处理对象EffectComposer，WebGL渲染器作为参数
const composer = new EffectComposer(renderer);
// 创建一个渲染通道，场景和相机作为参数
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 通道分辨率：和canvas画布尺寸一致
const v2 = new THREE.Vector2(width, height);

// 创建描边通道OutlinePass：分辨率、场景、相机作为参数
const outlinePass = new OutlinePass(v2, scene, camera);
// 通过selectedObjects指定需要高亮描边的对象（数组，可放多个）
outlinePass.selectedObjects = [mesh];
// 描边颜色
outlinePass.visibleEdgeColor.set(0x00ff00);
// 描边厚度
outlinePass.edgeThickness = 5.0;
// 描边亮度
outlinePass.edgeStrength = 6.0;
// 描边闪烁周期（秒），默认0不闪烁
outlinePass.pulsePeriod = 1.5;
composer.addPass(outlinePass);

// 创建闪屏效果通道GlitchPass
const glitchPass = new GlitchPass();
composer.addPass(glitchPass);

// 输出通道：必须是最后一个通道
const outputPass = new OutputPass();
composer.addPass(outputPass);

const controls = new OrbitControls(camera, renderer.domElement);

// 渲染循环
function render() {
  composer.render(); // 代替 renderer.render(scene, camera)
  requestAnimationFrame(render);
}
render();

// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  composer.setSize(width, height); // 后处理的离屏画布和各通道分辨率一起更新
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};
