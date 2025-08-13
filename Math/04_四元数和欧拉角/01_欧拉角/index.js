import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import model from './mesh.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import TWEEN from '@tweenjs/tween.js';

//场景
const scene = new THREE.Scene();
scene.add(model); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(300, 25, 0x04444);
scene.add(gridHelper);
//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(40, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

// 正投影相机
const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);

camera.position.set(120, 123, 85);
camera.lookAt(0, 0, 0);

/* const dir=new THREE.Vector3(0-292,0-223,0-185)
// 归一化得到单位向量获取视线方向
dir.normalize() */

// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启优化锯齿
});
renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);

// 将渲染器的canvas添加到body中
document.body.appendChild(renderer.domElement);

function render() {
  renderer.render(scene, camera);
  TWEEN.update();
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
