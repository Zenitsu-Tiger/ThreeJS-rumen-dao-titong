import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mesh, texture } from './06_复合纹理效果.js';
// 导入HDR加载器
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
const scene = new THREE.Scene();

scene.add(mesh);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff);
directionLight.position.set(100, 100, 100);
scene.add(directionLight);

const helper = new THREE.AxesHelper(100);
scene.add(helper);

// 添加地面辅助网格对象
// 参数分别是网格的尺寸和网格的间隔，网格颜色和中线颜色
/* const gridHelper=new THREE.GridHelper(600,50,0x00ffff,0x004444)
scene.add(gridHelper) */

// rgbeLoader加载hdr贴图
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/src/assets/Alex_Hart-Nature_Lab_Bones_2k.hdr', texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

let width = window.innerWidth;
let height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
camera.position.set(100, 100, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

function render() {
  // texture.offset.x += 0.01  // 注释掉这行代码停止纹理滚动
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
