import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import group from "./mesh.js";

//场景
const scene = new THREE.Scene();
scene.add(group); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// 大幅降低环境光强度，让聚光源效果更明显
const ambient = new THREE.AmbientLight(0xffffff, 0.05);
scene.add(ambient);

// 聚光源
const spotLight = new THREE.SpotLight(0xffffff, 1);
// 手动设置光照强度
spotLight.intensity = 1000; // 大幅增加强度
// 设置聚光源的锥形角度
spotLight.angle = Math.PI / 6; // 缩小角度，让光斑更集中
// 设置聚光源的位置
spotLight.position.set(0, 50, 0);
// 设置聚光源投射阴影
spotLight.castShadow = true;
// 优化阴影贴图质量
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
// 设置聚光源的照射位置
// spotLight.target是一个模型对象Object3D，默认在坐标原点
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight.target);
// 聚光源必须手动添加到scene
scene.add(spotLight);

// 暂时移除聚光源辅助对象，避免视觉干扰
// const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);

// 聚光源辅助对象
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

const width = window.innerWidth; //canvas画布高度
const height = window.innerHeight; //canvas画布宽度

const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);
camera.position.set(92, 113, 85);
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
