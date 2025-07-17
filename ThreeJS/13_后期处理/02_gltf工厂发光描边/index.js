import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import group from "./mesh.js";
// 引入后期处理EffectComposer
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
// 伽马后期处理，用于解决屏幕显示颜色偏暗的问题
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
// 引入FXAA抗锯齿Shader
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
// 使用Shader创建后处理
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";



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


// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  // 你用了fxaa之类的就没必要开启优化锯齿
  // antialias: true, //开启优化锯齿
});
// renderer.outputEncoding 已被废弃，请使用 outputColorSpace
// renderer.outputEncoding = THREE.sRGBEncoding;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);

// 将渲染器的canvas添加到body中
document.body.appendChild(renderer.domElement);
/* 后处理流程 */
const composer=new EffectComposer(renderer)
const renderPass=new RenderPass(scene,camera)
composer.addPass(renderPass)

// 创建OutlinePass通道
const v2=new THREE.Vector2(window.innerWidth,window.innerHeight)
const outlinePass=new OutlinePass(v2,scene,camera)

outlinePass.visibleEdgeColor.set(0x00ffff)
outlinePass.edgeThickness=4
outlinePass.edgeStrength=6
composer.addPass(outlinePass)

// FXAA抗锯齿通道
const fxaaPass = new ShaderPass(FXAAShader);
const pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
composer.addPass(fxaaPass);

// 添加OutputPass, 进行颜色空间转换(伽马校正通道)，必须是最后一个Pass
const outputPass = new OutputPass();
composer.addPass(outputPass);




// 添加发光模型对象
document.getElementById('A').addEventListener('click',()=>{
const A=group.getObjectByName('设备A')
outlinePass.selectedObjects=[A]
})

document.getElementById('B').addEventListener('click', () => {
    const B = group.getObjectByName('设备B');
    outlinePass.selectedObjects = [B];
});


// 渲染循环
function render() {
  // 记得如果使用了composer，则需要使用composer.render()来渲染，而不是renderer.render()
  composer.render();
  requestAnimationFrame(render);
}
render();

const controls = new OrbitControls(camera, renderer.domElement);

// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  composer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // 更新FXAA 的分辨率
  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
  fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
};
