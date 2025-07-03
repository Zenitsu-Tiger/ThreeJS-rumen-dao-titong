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
const ambient = new THREE.AmbientLight(0xffff2312ff, 0.4);
scene.add(ambient);

// 正投影相机
const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(45, width / height, 1, 8000);

camera.position.set(202, 123, 125);
camera.lookAt(0, 0, 0);
// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启优化锯齿
});
renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);

// 将渲染器的canvas添加到body中
document.body.appendChild(renderer.domElement);
// 圆周运动的角度起始值
let angle=0
// 相机圆周运动的半径
const R=100
// 渲染循环
function render() {
  angle+=0.01
  camera.position.x=R*Math.cos(angle)
  camera.position.z=R*Math.sin(angle)
// 必须重新执行一次camera.lookAt(0,0,0),才能始终让位置对准坐标原点
camera.lookAt(0,0,0)
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
