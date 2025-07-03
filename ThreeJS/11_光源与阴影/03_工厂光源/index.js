import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import group from "./mesh.js";
import gui from "./gui.js";
//场景
const scene = new THREE.Scene();
scene.add(group); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
// 添加gui
gui.add(ambient, "intensity", 0, 10).name("环境光强度");
const width = window.innerWidth; //canvas画布高度
const height = window.innerHeight; //canvas画布宽度

// 平行光默认指向座标原点
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 60, 0);
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  5
);
scene.add(directionalLightHelper);

// 添加平行光的阴影效果
// directionalLight.castShadow = true;

// 创建一个GUI文件夹来组织平行光相关的控制器
const lightFolder = gui.addFolder("平行光调试");

// 1. 将强度控制器添加到文件夹中
lightFolder.add(directionalLight, "intensity", 0, 10).name("光照强度");

// 2. 创建一个对象来集中管理光源位置参数
const lightPositionControl = {
  R: 100, // 半径
  angle: 0, // 角度
};

// 3. 定义一个函数，用于根据R和angle更新光源位置
function updateLightPosition() {
  const x = lightPositionControl.R * Math.cos(lightPositionControl.angle);
  const z = lightPositionControl.R * Math.sin(lightPositionControl.angle);
  directionalLight.position.x = x;
  directionalLight.position.z = z;
  directionalLightHelper.update(); // 光源位置变化，辅助对象也需要更新
}
updateLightPosition(); // 初始化一次位置

// 4. 在文件夹中为R和angle创建滑块，并在变化时调用更新函数
lightFolder
  .add(lightPositionControl, "R", 0, 300)
  .name("半径 (R)")
  .onChange(updateLightPosition);
lightFolder
  .add(lightPositionControl, "angle", 0, 2 * Math.PI)
  .name("角度 (angle)")
  .onChange(updateLightPosition);

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
