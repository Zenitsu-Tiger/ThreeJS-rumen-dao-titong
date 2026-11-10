import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import group from "./mesh.js";
import gui from "./gui.js";

// 场景
const scene = new THREE.Scene();
scene.add(group);

// 辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// 环境光
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
gui.add(ambient, "intensity", 0, 10).name("环境光强度");

// ---------- 按模型尺寸算阴影参数 ----------
// 模型约 2000 × 17 × 2000（mesh.js 里 Box3 打印出来的值）
const MODEL_HALF = 1000; // 模型半宽：2000 / 2
// 光源绕 y 轴转到斜 45° 时，要盖住的是对角线：1000 × 1.414 ≈ 1415
const SHADOW_HALF = Math.ceil(MODEL_HALF * Math.SQRT2);
const LIGHT_Y = 900; // 光源高度

// 平行光（默认照向原点）
const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  50
);
scene.add(directionalLightHelper);

// ---------- GUI：光源位置 ----------
const lightFolder = gui.addFolder("平行光调试");
lightFolder.add(directionalLight, "intensity", 0, 10).name("光照强度");

// R = 光源离 y 轴的水平距离，angle = 绕 y 轴转的角度
// R 要大于模型半对角线 1415，整个模型才都在光源前方
const lightPositionControl = {
  R: 1500,
  angle: 0,
};

function updateLightPosition() {
  directionalLight.position.set(
    lightPositionControl.R * Math.cos(lightPositionControl.angle),
    LIGHT_Y,
    lightPositionControl.R * Math.sin(lightPositionControl.angle)
  );
  directionalLightHelper.update(); // 光源位置变了，辅助对象也要更新
}
updateLightPosition();

lightFolder
  .add(lightPositionControl, "R", 0, 3000)
  .name("水平距离 (R)")
  .onChange(updateLightPosition);
lightFolder
  .add(lightPositionControl, "angle", 0, 2 * Math.PI)
  .name("角度 (angle)")
  .onChange(updateLightPosition);

// ---------- 阴影 ----------
directionalLight.castShadow = true;

const cam = directionalLight.shadow.camera;
cam.left = -SHADOW_HALF;
cam.right = SHADOW_HALF;
cam.top = SHADOW_HALF;
cam.bottom = -SHADOW_HALF;
cam.near = 1;
// 最远的点：光源距离（R=3000 时约 3132）+ 模型半对角线 1415 ≈ 4547
cam.far = 5000;

// 精度：范围宽 2830 / 2048 ≈ 1.38 单位一格
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.radius = 3; // 阴影边缘模糊程度

// 阴影范围辅助框（创建时会自动更新一次投影矩阵）
const cameraHelper = new THREE.CameraHelper(cam);
scene.add(cameraHelper);

// 之后再改范围：投影矩阵和辅助框都要手动更新
function updateShadowCamera() {
  cam.updateProjectionMatrix();
  cameraHelper.update();
}

// ---------- GUI：阴影范围 ----------
const shadowFolder = gui.addFolder("平行光阴影");
const shadowControl = { half: SHADOW_HALF };
shadowFolder
  .add(shadowControl, "half", 50, 2000)
  .name("范围半宽")
  .onChange((v) => {
    cam.left = -v;
    cam.right = v;
    cam.top = v;
    cam.bottom = -v;
    updateShadowCamera();
  });
shadowFolder.add(cam, "far", 100, 6000).name("far").onChange(updateShadowCamera);

// ---------- 相机、渲染器 ----------
const width = window.innerWidth; // canvas 画布宽度
const height = window.innerHeight; // canvas 画布高度

const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);
camera.position.set(100, 100, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true; // 开启阴影
renderer.shadowMap.type = THREE.VSMShadowMap; // 柔和的阴影边缘
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// 相机控件
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false; // 禁止右键拖拽

// 渲染循环
function render() {
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