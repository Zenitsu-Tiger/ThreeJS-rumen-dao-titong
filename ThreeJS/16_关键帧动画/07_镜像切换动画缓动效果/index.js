import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';
import group from './mesh.js'; //模型对象

//场景
const scene = new THREE.Scene();
scene.add(group); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

//渲染器和相机
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(30, width / height, 1, 10000);
// camera.position.set(300, 300, 300);
camera.position.set(3000, 3000, 3000);
camera.lookAt(0, 0, 0);

// 视觉效果：地球从小到大出现(透视投影相机远小近大投影规律)
new TWEEN.Tween(camera.position)
  .to({ x: 30, y: 30, z: 30 }, 3000)
  .start()
  .easing(TWEEN.Easing.Quadratic.Out); //使用二次缓动函数

/**
 * 动画开始缓动方式(类比加速启动)
 * tween.easing(TWEEN.Easing.Sinusoildal.In)
 * 动画结束缓动方式(类比减速刹车
 * tween.easing(TWEEN.Easing.Sinusoidal.Out)
 * 同时设置In和Out
 * tween.easing(TWEEN.Easing.Sinusoidal.InOut)
 */
// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// 渲染循环
function render() {
  group.rotateY(0.001);
  TWEEN.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

const controls = new OrbitControls(camera, renderer.domElement);

// 画布跟随窗口变化
window.onresize = function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};
