import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import model from './mesh.js'; //模型对象
import tag from './tag.js';
import {
  CSS2DRenderer, // ← 改成 CSS2D
  CSS2DObject, // ← 改成 CSS2D
} from 'three/examples/jsm/renderers/CSS2DRenderer.js'; // ← 注意路径也改了
// 引入后期处理EffectComposer
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
// 伽马后期处理，用于解决屏幕显示颜色偏暗的问题
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
// 引入FXAA抗锯齿Shader
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
// 使用Shader创建后处理
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

//场景
const scene = new THREE.Scene();
scene.add(model); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);
// 添加一个辅助网格地面
/* const gridHelper = new THREE.GridHelper(300, 25, 0x004444, 0x004444);
scene.add(gridHelper); */

//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

//相机
const width = window.innerWidth;
const height = window.innerHeight;
/* const width = 600;
const height = 300; */
const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
camera.position.set(150, 150, 150);
camera.lookAt(0, 0, 0);

// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启优化锯齿
});
renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);
//three.js执行渲染命令会输出一个canvas画布，也就是一个HTML元素，你可以插入到web页面中
document.body.appendChild(renderer.domElement);

// 创建一个CSS2渲染器CSS2DRenderer
const css2Renderer = new CSS2DRenderer(); // ← 改成 CSS2D
css2Renderer.setSize(width, height);
document.body.appendChild(css2Renderer.domElement);

css2Renderer.domElement.style.position = 'absolute'; // ← 改变量名
css2Renderer.domElement.style.top = '0px';
css2Renderer.domElement.style.pointerEvents = 'none';

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const v2 = new THREE.Vector2(window.innerWidth, window.innerHeight);
const outlinePass = new OutlinePass(v2, scene, camera);
outlinePass.visibleEdgeColor.set(0x00ffff);
outlinePass.edgeThickness = 4;
outlinePass.edgeStrength = 6;
composer.addPass(outlinePass);

const fxaaPass = new ShaderPass(FXAAShader);
const pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms['resolution'].value.set(
  1 / (width * pixelRatio),
  1 / (height * pixelRatio)
);
composer.addPass(fxaaPass);

const outputPass = new OutputPass(scene, camera);
composer.addPass(outputPass);

// 先创建控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 渲染循环
function render() {
  controls.update();
  css2Renderer.render(scene, camera); // ← 改变量名
  // 使用后期处理渲染，而不是直接renderer.render
  composer.render();

  requestAnimationFrame(render);
}
render();

window.onresize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  css2Renderer.setSize(width, height); // ← 改变量名
  // 重要：也要更新后期处理的分辨率
  composer.setSize(width, height);

  // 如果需要，也可以单独更新OutlinePass的分辨率
  // outlinePass.setSize(width, height)
};

// 1. 创建一个射线投射器，用于拾取对象
const raycaster = new THREE.Raycaster();

// 2. 创建一个二维向量，用于存储鼠标位置
const pointer = new THREE.Vector2();

const span = document.getElementById('name');
// 3. 监听窗口的点击事件
window.addEventListener('click', (event) => {
  // 4. 标准化设备坐标 (Normalized Device Coordinates)
  // 将鼠标的屏幕坐标(x, y)转换到Three.js的[-1, 1]范围
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 5. 更新射线投射器
  // 使用新的鼠标位置和相机视角来更新射线
  raycaster.setFromCamera(pointer, camera);
  const cunchu = model.getObjectByName('存储罐');

  for (let i = 0; i < cunchu.children.length; i++) {
    const group = cunchu.children[i];
    group.traverse((obj) => {
      if (obj.isMesh) {
        obj.ancestors = group;
      }
    });
  }
  // 6. 计算与射线相交的物体
  // .intersectObjects会返回一个数组，包含所有被射线穿过的物体
  // 第二个参数true表示递归检查所有子对象
  const intersects = raycaster.intersectObjects(scene.children, true);

  // 7. 处理拾取结果
  if (intersects.length > 0) {
    // 如果拾取到了物体
    // intersects[0]是离相机最近的那个物体
    const selectedObject = intersects[0].object;

    if (selectedObject.ancestors) {
      // 8. 将拾取到的对象添加到OutlinePass的高亮列表
      outlinePass.selectedObjects = [selectedObject];
      intersects[0].object.ancestors.add(tag);
      console.log('拾取到的对象:', selectedObject.name || selectedObject);
      tag.visible = true;
      tag.element.style.display = 'block'; // ← 新增这行，显示div

      span.innerHTML = selectedObject.ancestors.name;
    } else {
      // 如果没有拾取到任何物体，清空高亮列表
      outlinePass.selectedObjects = [];
    }
  } else {
    // 如果没有拾取到任何物体，清空高亮列表
    outlinePass.selectedObjects = [];
  }
});

const close = document.getElementById('close');
close.addEventListener('click', () => {
  tag.visible = false;
  tag.element.style.display = 'none'; // ← 新增这行，隐藏div
});
