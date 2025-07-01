import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import model from "./mesh.js";

//场景
const scene = new THREE.Scene();
scene.add(model); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// 添加网格辅助线（在xz平面）
/* const gridHelper = new THREE.GridHelper(200, 20);
gridHelper.position.set(0, -10, 0);
scene.add(gridHelper); */

//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffff2312ff, 0.4);
scene.add(ambient);


/* const width = window.innerWidth; //canvas画布高度
const height = window.innerHeight; //canvas画布宽度
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 8000);
camera.position.set(800, 800, 800);
camera.lookAt(0, 0, 0); */

// 正投影相机
const width=window.innerWidth
const height=window.innerHeight
const k=width/height
// 控制left right top bottom near far范围大小
const s=2000
const camera=new THREE.OrthographicCamera(-s*k,s*k,s,-s,1,8000)
camera.position.set(0,2000,0)
camera.lookAt(2000,0,2000)

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
controls.target.set(2000,0,2000)
controls.update()
// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};
