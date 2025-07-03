import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import model from "./mesh.js";

//场景
const scene = new THREE.Scene();
scene.add(model); //模型对象添加到场景中
const x=113.51
const y=33.88
//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);
axesHelper.position.set(x,y,0)
//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(300, 300, 300);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffff2312ff, 0.4);
scene.add(ambient);

// 正投影相机
const width = window.innerWidth;
const height = window.innerHeight;
const k = width / height;
// 控制left right top bottom near far范围大小
const s = 2.5;
const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 8000);
// camera.position.set(300, 300, 300);

camera.lookAt(x, y, 0);
camera.position.set(x, y, 300);
// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启优化锯齿
});
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
// controls是控制器，target是控制器的目标点，set是设置控制器的目标点
controls.target.set(x, y, 0);
controls.update();
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
