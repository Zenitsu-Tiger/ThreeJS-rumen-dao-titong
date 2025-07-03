import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// 从mesh.js导入group对象和planeZSize
import group, { planeZSize } from "./mesh.js";

//场景
const scene = new THREE.Scene();
scene.add(group); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// 环境光，提供基础照明
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// 平行光
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// 设置光源的初始位置，Y轴较高以获得好的阴影角度
directionalLight.position.set(100, 100, 0);
scene.add(directionalLight);
// 将光源的目标对象也添加到场景中，这样才能一起移动
scene.add(directionalLight.target);
// 设置平行光投射阴影
directionalLight.castShadow = true;

// 利用正投影相机的特性来配置三维场景阴影的投射范围，这个范围需要足够大以包含所有立方体
directionalLight.shadow.camera.left = -200;
directionalLight.shadow.camera.right = 200;
directionalLight.shadow.camera.top = 200;
directionalLight.shadow.camera.bottom = -200;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 1000; // 稍微增大远裁剪面以适应动画

// 阴影像素决定了阴影的精度，像素越高，阴影越精细，但也会消耗更多的性能
directionalLight.shadow.mapSize.set(128, 128);
// 默认的阴影像素是512*512
console.log("阴影默认像素", directionalLight.shadow.mapSize);

// 可视化平行光阴影对应的正投影相机对象，这个用于辅助计算投影范围非常重要
const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(cameraHelper);

const width = window.innerWidth; //canvas画布高度
const height = window.innerHeight; //canvas画布宽度

const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);
camera.position.set(300, 300, 300);
camera.lookAt(0, 0, 0);

// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启优化锯齿
});
renderer.shadowMap.enabled = true; // 开启阴影渲染
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);

// 将渲染器的canvas添加到body中
document.body.appendChild(renderer.domElement);

// --- 光源动画逻辑 ---
// **核心修正：计算新的动画边界**
// 从平面的半尺寸中，减去阴影相机视口半尺寸的宽度，
// 这样就能确保是相机的边缘对齐平面的边缘，而不是中心点。
const zBoundary = planeZSize / 2 - directionalLight.shadow.camera.right;

// 2. 定义光源移动速度
let lightZSpeed = 3;
// 3. 设置光源Z轴的初始位置
directionalLight.position.z = -zBoundary;
// 注意：目标的初始Z位置也需要设置
directionalLight.target.position.z = -zBoundary;

// 渲染循环
function render() {
  /*   // 核心：同时平移光源的position和target，保持光照方向不变
  directionalLight.position.z += lightZSpeed;
  directionalLight.target.position.z += lightZSpeed;

  // 判断是否到达边界，如果到达则反转方向
  if (
    directionalLight.position.z > zBoundary ||
    directionalLight.position.z < -zBoundary
  ) {
    lightZSpeed = -lightZSpeed; // 速度取反，实现回头效果
  } */

  // 渲染场景
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
/* controls.minDistance = 100;
controls.maxDistance = 500; */

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
