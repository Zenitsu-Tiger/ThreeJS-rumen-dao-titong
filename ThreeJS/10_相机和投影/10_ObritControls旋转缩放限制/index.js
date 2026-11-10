import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import group from "./mesh.js";

// 场景
const scene = new THREE.Scene();
scene.add(group); // 模型对象添加到场景中

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
camera.position.set(92, 113, 85); // 到原点距离约 168.7，在 100~500 之间
camera.lookAt(0, 0, 0);

// WebGL 渲染器设置（新版默认 sRGB 输出，不需要再设置 outputEncoding）
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 开启优化锯齿
});
renderer.setPixelRatio(window.devicePixelRatio); // 防止输出模糊
renderer.setSize(width, height);

// 将渲染器的 canvas 添加到 body 中
document.body.appendChild(renderer.domElement);

// 相机控件：必须在 render() 第一次执行之前创建，因为 render 里要用到它
const controls = new OrbitControls(camera, renderer.domElement);

// 禁止右键拖拽平移
controls.enablePan = false;
// 禁止缩放
// controls.enableZoom = false;

// 限制相机到观察点的距离：滚轮最近 100、最远 500
controls.minDistance = 100;
controls.maxDistance = 500;

// 阻尼惯性：松手后继续滑一段再停下
// 注意：开启后必须在渲染循环里每帧调用 controls.update()
controls.enableDamping = true;
controls.dampingFactor = 0.05; // 每帧剩余速度保留 95%，约 1 秒停下

// 限制上下旋转的角度（极角：从正上方 0 到正下方 π）
// controls.minPolarAngle = 0;
// controls.maxPolarAngle = Math.PI / 2; // 最多转到水平面，不能转到模型下方

// 查看相机到观察点的距离，用来辅助确定 minDistance、maxDistance
// 用 "end"（松开鼠标时触发）而不是 "change"：开启阻尼后 change 会在滑动期间每帧触发，控制台会刷屏
controls.addEventListener("end", () => {
  console.log("dis", controls.getDistance());
});

// 渲染循环
function render() {
  controls.update(); // 开启阻尼后必须每帧调用，惯性才会生效
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
