import * as THREE from "three";

import { group, pointsArr } from "./mesh.js";

// 场景
const scene = new THREE.Scene();
scene.add(group); // 管道模型添加到场景中

// 辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// 光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// 相机
const width = window.innerWidth;   // canvas 画布宽度
const height = window.innerHeight; // canvas 画布高度
const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);

// WebGL 渲染器设置（新版默认 sRGB 输出，不需要再设置 outputEncoding）
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 开启优化锯齿
  // 想把 canvas 画布上的内容下载到本地，需要把以下选项设置为 true（本章用不到）
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(window.devicePixelRatio); // 防止输出模糊
renderer.setSize(width, height);

// 将渲染器的 canvas 添加到 body 中
document.body.appendChild(renderer.domElement);

// 漫游：每帧站到第 i 个点，看向第 i+1 个点
let i = 0;
function render() {
  if (i < pointsArr.length - 1) {
    camera.position.copy(pointsArr[i]); // 站到当前点
    camera.lookAt(pointsArr[i + 1]);    // 看向下一个点 = 看向前进方向
    i += 1;
  } else {
    i = 0; // 走到终点，回到起点（曲线不闭合，会瞬间跳回）
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

// 漫游每帧都会覆盖相机的位置和朝向，不要同时使用 OrbitControls

// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};
