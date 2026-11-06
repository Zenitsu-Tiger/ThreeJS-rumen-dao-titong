import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import model from "./mesh.js";

// 场景
const scene = new THREE.Scene();
scene.add(model);

// 辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// 光源
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// 正投影相机
const width = window.innerWidth;
const height = window.innerHeight;
const k = width / height;
const s = 2000; // 2s = 4000 ≥ 模型宽 3700
const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 8000);
camera.position.set(0, 5000, 0); // 距离 5000 > 模型半径 2616，倾斜时也不会被切
camera.lookAt(0, 0, 0);

// 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// 轨道控制器：target 与 lookAt 保持一致
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

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
  const k = width / height;
  camera.left = -s * k;
  camera.right = s * k;
  camera.updateProjectionMatrix();
};