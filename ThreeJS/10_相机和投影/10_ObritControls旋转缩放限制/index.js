import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import group from "./mesh.js";

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

//相机

const width = window.innerWidth; //canvas画布高度
const height = window.innerHeight; //canvas画布宽度

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

let i = 0;

// 渲染循环
function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

const controls = new OrbitControls(camera, renderer.domElement);
// 禁止右键拖拽
controls.enablePan = false;
// 禁止缩放
// controls.enableZoom = false;

// 约束controls的最大距离和最小距离
controls.minDistance = 100;
controls.maxDistance = 500;

// 设置带阻尼的惯性
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 获取相机和目标观察点的距离,一般拿来辅助设置上面的minDistance和maxDistance
// const dis = controls.getDistance();
// console.log("dis", dis);
// 在调整距离的过程中计算dis
controls.addEventListener("change", () => {
  const dis = controls.getDistance();
  console.log("dis", dis);
});

// controls.minPolarAngle = 0;
// 控制旋转范围不超过x轴以下
// 这里正值和负值都是从0到π/2
//  controls.maxPolarAngle = Math.PI / 2;

// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};
