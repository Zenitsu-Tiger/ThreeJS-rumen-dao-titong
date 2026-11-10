import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// 从 mesh.js 导入 group 对象和平面的 z 方向尺寸
import group, { planeZSize } from "./mesh.js";

// 场景
const scene = new THREE.Scene();
scene.add(group);

// 辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// 环境光，提供基础照明
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// 平行光：从 (100,100,0) 照向原点，45° 斜射，高 100 的立方体影子长 100
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 100, 0);
scene.add(directionalLight);
scene.add(directionalLight.target); // target 加入场景，才能跟着移动
directionalLight.castShadow = true;

// 阴影相机（正投影相机）的范围：一个长方体盒子
// left/right/top/bottom 是"光源视角"下的方向，不是地面的 x/z
// 本场景光源与目标 z 相同，所以 left/right 恰好对应世界 z 轴
directionalLight.shadow.camera.left = -200;
directionalLight.shadow.camera.right = 200;
directionalLight.shadow.camera.top = 200;
directionalLight.shadow.camera.bottom = -200;
directionalLight.shadow.camera.near = 0.5; // 盒子沿光线方向的前边界
directionalLight.shadow.camera.far = 1000; // 盒子沿光线方向的后边界

// 阴影贴图像素：范围 400 / 128 ≈ 3.13 单位/像素，故意调低用于观察锯齿
// 默认 512（≈0.78 单位/像素），正常项目常用 1024 或 2048
directionalLight.shadow.mapSize.set(128, 128);

// 可视化阴影相机的范围
const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(cameraHelper);

const width = window.innerWidth; // canvas 画布宽度
const height = window.innerHeight; // canvas 画布高度

const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);
camera.position.set(300, 300, 300);
camera.lookAt(0, 0, 0);

// WebGL 渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.shadowMap.enabled = true; // 开启阴影渲染
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// --- 光源平移动画 ---
// 让阴影盒子的边缘对齐平面边缘：850/2 - 200 = 225
// 注意：只有当 left/right 对应世界 z 轴时（光源与目标 z 相同）这个算法才成立
const zBoundary = planeZSize / 2 - directionalLight.shadow.camera.right;
let lightZSpeed = 3;
directionalLight.position.z = -zBoundary;
directionalLight.target.position.z = -zBoundary;

// 是否播放动画：false 时光源停在 z=-225，只有 z=-300/-200/-100 三个立方体有阴影
const animate = false;

// 相机控件
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false; // 禁止右键拖拽
controls.addEventListener("change", () => {
  console.log("dis", controls.getDistance());
});

// 渲染循环
function render() {
  if (animate) {
    // 同时平移 position 和 target，保持光照方向不变
    directionalLight.position.z += lightZSpeed;
    directionalLight.target.position.z += lightZSpeed;
    // 到达边界就反向
    if (
      directionalLight.position.z > zBoundary ||
      directionalLight.position.z < -zBoundary
    ) {
      lightZSpeed = -lightZSpeed;
    }
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};