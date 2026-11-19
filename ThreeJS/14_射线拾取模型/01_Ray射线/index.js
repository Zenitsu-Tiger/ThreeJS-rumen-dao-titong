import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import group from "./mesh.js";

// 场景：加入三角形和辅助坐标轴
const scene = new THREE.Scene();
scene.add(group);
scene.add(new THREE.AxesHelper(100));

const width = window.innerWidth; // 画布逻辑宽度
const height = window.innerHeight; // 画布逻辑高度

// 相机：沿用本章原来的观察位置
const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);
camera.position.set(92, 113, 85);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
// three@0.174.0 默认就是 sRGB 输出，显式写出以表明意图
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// MeshBasicMaterial 不受灯光影响，因此本例不需要创建光源
const controls = new OrbitControls(camera, renderer.domElement);

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
