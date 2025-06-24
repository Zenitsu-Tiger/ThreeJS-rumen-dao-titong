// 导入样式文件
import './style.css';

// 导入Three.js核心库
import * as THREE from 'three';

// 导入轨道控制器，用于鼠标控制相机
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';

// 导入自定义的网格模型
import mesh from './mesh.js';

// 创建Three.js场景
const scene = new THREE.Scene();

// 将导入的模型添加到场景中
scene.add(mesh);

// 创建环境光，提供基础照明，强度为0.2
// 环境光会均匀照亮所有物体，不产生阴影
const ambientLight=new THREE.AmbientLight(0xffffff,0.2)
scene.add(ambientLight)

// 创建方向光，模拟太阳光，强度为5
const directionLight = new THREE.DirectionalLight(0xffffff,5);

// 设置方向光位置
directionLight.position.set(200, 200, 200);

// 启用方向光的阴影投射功能
directionLight.castShadow = true;
scene.add(directionLight);

// 创建坐标轴辅助器，长度为100，用于调试
const helper = new THREE.AxesHelper(100);
scene.add(helper);

// 获取浏览器窗口尺寸
let width = window.innerWidth;
let height = window.innerHeight;

// 创建透视相机
// 参数：视野角度60°，宽高比，近裁剪面1，远裁剪面1000
const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);

// 设置相机位置（通过相机控件调试得出的最佳位置）
camera.position.set(-109, 40, -79);

// 设置相机观察目标点
camera.lookAt(-3.6, -5.4, 0.91);

// 创建WebGL渲染器
const renderer = new THREE.WebGLRenderer();

// 设置渲染器尺寸
renderer.setSize(width, height)

// 启用阴影渲染功能
renderer.shadowMap.enabled = true;

// 设置阴影类型为PCF软阴影，效果更柔和
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 将渲染器的DOM元素添加到页面body中
document.body.append(renderer.domElement);

// 创建轨道控制器，允许用户用鼠标控制相机
const controls = new OrbitControls(camera, renderer.domElement);

// 设置控制器的目标观察点，与相机lookAt保持一致
// 这样相机控制器和lookAt可以同时工作
controls.target.set(-3.6, -5.4, 0.91);

// 更新控制器，应用设置
controls.update() 

// 设置渲染器输出色彩空间为sRGB，与GLTF模型保持一致
// 这样可以避免颜色偏差问题
renderer.outputColorSpace = THREE.SRGBColorSpace;

// 渲染循环函数
function render() {
  // 调试用：打印相机位置和观察目标（已注释）
  // console.log('camera.position',camera.position);
  // console.log('controls.target',controls.target); 
  
  // 执行渲染，将场景通过相机渲染出来
  renderer.render(scene, camera);
  
  // 请求下一帧动画，形成渲染循环
  requestAnimationFrame(render);
}

// 开始渲染循环
render();

// 监听窗口大小变化事件，实现响应式设计
window.addEventListener('resize',()=>{
    // 更新窗口尺寸变量
    width=window.innerWidth
    height=window.innerHeight
    
    // 更新相机宽高比
    camera.aspect=width/height
    
    // 更新相机投影矩阵，应用新的宽高比
    camera.updateProjectionMatrix()
    
    // 更新渲染器尺寸
    renderer.setSize(width,height)
})