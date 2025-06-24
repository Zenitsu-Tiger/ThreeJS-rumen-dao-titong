import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import group from "./mesh.js";
import gui from "./gui.js";
const scene = new THREE.Scene();

scene.add(group);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

const directionLight = new THREE.DirectionalLight(0xffffff, 2);
directionLight.position.set(100, 100, 100);
scene.add(directionLight);

// 创建环境光文件夹（暂时为空，可以后续添加控制项）
const ambientLightFolder = gui.addFolder("环境光");
ambientLightFolder.close();
// 环境光强度
ambientLightFolder.add(ambient, "intensity", 0.2);

// 创建平行光文件夹（暂时为空，可以后续添加控制项）
const directionalLightFolder = gui.addFolder("平行光");
directionalLightFolder.close();

// 平行光强度
directionalLightFolder.add(directionLight, "intensity", 0.2);
const helper = new THREE.AxesHelper(100);

const dirFolder2 = directionalLightFolder.addFolder("位置");
dirFolder2.close();

dirFolder2.add(directionLight.position, "x", -400, 400);
dirFolder2.add(directionLight.position, "y", -400, 400);
dirFolder2.add(directionLight.position, "z", -400, 400);

scene.add(helper);
const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
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
renderer.outputColorSpace = THREE.SRGBColorSpace;
const controls = new OrbitControls(camera, renderer.domElement);
