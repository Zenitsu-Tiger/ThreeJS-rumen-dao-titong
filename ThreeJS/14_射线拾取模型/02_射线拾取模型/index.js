import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { group } from "./mesh.js";

//场景
const scene = new THREE.Scene();
scene.add(group); //模型对象添加到场景中

const rayCaster = new THREE.Raycaster();
rayCaster.ray.origin.set(-100, 0, 0);
rayCaster.ray.direction.set(1, 0, 0);

group.updateMatrixWorld(true);
const intersects = rayCaster.intersectObjects(group.children);
console.log("raycaster", rayCaster.ray);
console.log("intersects", intersects);

if (intersects.length > 0) {
  const nearest = intersects[0];
  nearest.object.material.color.set(0x00ff00);
  console.log("最近命中的模型：", nearest.object);
  console.log("交点与距离：", nearest.point, nearest.distance);
}

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const width = window.innerWidth;
const height = window.innerHeight;

//相机
const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);
camera.position.set(92, 113, 85);
camera.lookAt(0, 0, 0);

// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启优化锯齿
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);

// 将渲染器的canvas添加到body中
document.body.appendChild(renderer.domElement);
new OrbitControls(camera, renderer.domElement);

// 渲染循环
function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

// 画布跟随窗口变化
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
