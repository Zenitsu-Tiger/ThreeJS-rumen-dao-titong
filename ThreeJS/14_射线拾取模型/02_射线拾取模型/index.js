import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import {group,mesh1,mesh2,mesh3} from "./mesh.js";

//场景
const scene = new THREE.Scene();
scene.add(group); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const width = window.innerWidth; //canvas画布高度
const height = window.innerHeight; //canvas画布宽度

//相机
const camera = new THREE.PerspectiveCamera(90, width / height, 1, 3000);
camera.position.set(92, 113, 85);
camera.lookAt(0, 0, 0);

/* // 正投影相机
const k = width / height;
const s = 10;
const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 8000);
camera.position.set(0, 0, 200);
camera.lookAt(0, 0, 0); */

// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启优化锯齿
});
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

// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

// 射线投射器
const rayCaster=new THREE.Raycaster()
console.log('raycaster',rayCaster.ray);
// 设置射线起点
rayCaster.ray.origin.set(-100,0,0)
// 设置射线的方向，沿着x轴正方形发射
rayCaster.ray.direction.set(1,0,0)
// 射线交叉计算方法
const intersects=rayCaster.intersectObjects(group.children)
console.log('intersects',intersects)

if(intersects.length>0){
// 射线交叉返回的结果
console.log('射线交叉返回的结果',intersects[0].object.material.color.set(0x00ff00 ));
// 射线交叉点座标
console.log('射线交叉点座标',intersects[0].point);

}