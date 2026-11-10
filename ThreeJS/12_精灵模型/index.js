import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// 切换示例：把 mesh.js 换成 01_精灵尺寸.js / 02_精灵标注.js 即可
import group from "./mesh.js";

// 用 01_精灵尺寸.js 验证"scale 就是尺寸"时改成 true
const USE_ORTHO = false;

// 场景
const scene = new THREE.Scene();
scene.add(group);

// 辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// 光源（只影响 Mesh，精灵不受光照影响）
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

const width = window.innerWidth; // canvas 画布宽度
const height = window.innerHeight; // canvas 画布高度

let camera;
const s = 10; // 正投影相机：上下能看到 2 × s = 20
if (USE_ORTHO) {
  const k = width / height; // 宽高比，左右能看到 2 × s × k
  camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 8000);
  camera.position.set(0, 0, 200);
} else {
  // 透视相机：near = 10，离相机不到 10 的雨滴不画，避免近处雨滴被放得很大
  // 视野 90°：距离 d 处画面上下能看到 2 × d × tan45° = 2d 高
  // 0.5 的雨滴在 d = 2 时占画面 0.5 / 4 = 1/8；在 d = 10 时只占 0.5 / 20 = 1/40
  camera = new THREE.PerspectiveCamera(90, width / height, 10, 3000);
  camera.position.set(92, 113, 85);
}
camera.lookAt(0, 0, 0);

// WebGL 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// 渲染循环
function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

const controls = new OrbitControls(camera, renderer.domElement);

// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  if (camera.isOrthographicCamera) {
    // 正投影相机：上下保持 2s，左右按新宽高比重算
    const k = width / height;
    camera.left = -s * k;
    camera.right = s * k;
  } else {
    camera.aspect = width / height;
  }
  camera.updateProjectionMatrix();
};
