import './style.css';
import * as THREE from 'three';
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import mesh from './mesh.js';

const scene = new THREE.Scene();

scene.add(mesh);

const ambientLight=new THREE.AmbientLight(0xffffff)
scene.add(ambientLight)


const directionLight = new THREE.DirectionalLight(0xffffff);
directionLight.position.set(200, 200, 200);
scene.add(directionLight);

const helper = new THREE.AxesHelper(100);
scene.add(helper);


const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
// 根据相机可视化控件来调试生成的相机位置
camera.position.set(-109, 40, -79);
// camera.lookAt(400, 40, 0);
camera.lookAt(-3.6, -5.4, 0.91);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height)



document.body.append(renderer.domElement);

// 相机控制器会导致camera.lookAt失效
const controls = new OrbitControls(camera, renderer.domElement);

// 为了同时使用相机控制器，我们需要同步设置相机控件的target，
// 这个代表了相机目标观察点
controls.target.set(-3.6, -5.4, 0.91);
controls.update() 

// 设置编码方式和gltf贴图保持一致，解决渲染颜色偏差问题
renderer.outputEncoding = THREE.sRGBEncoding;
function render() {
  // console.log('camera.position',camera.position);
  // console.log('controls.target',controls.target); 
  
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();


window.addEventListener('resize',()=>{
    width=window.innerWidth
    height=window.innerHeight
    camera.aspect=width/height
    camera.updateProjectionMatrix()
    renderer.setSize(width,height)
})