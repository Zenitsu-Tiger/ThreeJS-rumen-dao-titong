import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import model from "./mesh.js";

//场景
const scene = new THREE.Scene();
scene.add(model); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);
//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(300, 300, 300);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// 正投影相机
const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);

camera.position.set(200, 200, 200);
// 改变相机朝向，（0，0，1）是z轴，（0，1，0）是y轴，（1，0，0）是x轴
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

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
controls.target.set(0, 0, 0);
controls.update();
// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // 1. 更新渲染器尺寸
  renderer.setSize(width, height);
  
  // 2. 更新相机的宽高比
  camera.aspect = width / height;

  // 3. 应用更改
  camera.updateProjectionMatrix();
};

document.getElementById('x').addEventListener('click',()=>{
  camera.position.set(500, 0, 0);
  camera.lookAt(0, 0, 0);
})
document.getElementById('y').addEventListener('click',()=>{
  camera.position.set(0, 500, 0);
  camera.lookAt(0, 0, 0);
})
document.getElementById('z').addEventListener('click',()=>{
  camera.position.set(0, 0, 500);
  camera.lookAt(0, 0, 0);
})