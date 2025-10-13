import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import mesh from './mesh.js';
// 导入HDR加载器
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
const scene = new THREE.Scene();

scene.add(mesh);
/* 创建场景fog */
// 1.线性雾
// 参数分别代表了雾的颜色，雾的开始距离，雾的结束距离
// scene.fog = new THREE.Fog(0x999999, 0.1, 50);
// 2.指数雾
// 参数分别代表了雾的颜色，雾的开始距离，雾的结束距离
scene.fog = new THREE.FogExp2(0x999999, 0.01);
scene.background = new THREE.Color(0x999999);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 1);
directionLight.position.set(100, 100, 100);
scene.add(directionLight);

const helper = new THREE.AxesHelper(100);
scene.add(helper);

// 添加地面辅助网格对象
// 参数分别是网格的尺寸和网格的间隔，网格颜色和中线颜色
/* const gridHelper=new THREE.GridHelper(600,50,0x00ffff,0x004444)
scene.add(gridHelper) */

let width = window.innerWidth;
let height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
camera.position.set(100, 100, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
