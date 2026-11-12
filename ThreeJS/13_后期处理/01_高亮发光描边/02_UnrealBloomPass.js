import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// 后处理扩展库 EffectComposer：管理整条后处理流水线
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// 渲染通道 RenderPass：流水线第一步，渲染出原始场景
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// 发光通道 UnrealBloomPass
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
// 输出通道 OutputPass：放在流水线最后，负责颜色空间转换，不加画面会偏暗
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import { model } from "./mesh.js";

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

// 创建发光通道UnrealBloomPass：参数是分辨率
// 注意：它没有selectedObjects，作用于整张画面里的亮部，不能只选某个物体
const bloomPass = new UnrealBloomPass(v2);
// 发光强度（默认1）。原来的5在颜色校正后会让整个画面糊成一片
bloomPass.strength = 1.0;
// 发光半径、亮度阈值：构造时没传会是undefined，这里显式设为0
bloomPass.radius = 0; // 光晕扩散范围
bloomPass.threshold = 0; // 亮度超过多少才发光，0表示所有像素都参与
composer.addPass(bloomPass);

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
