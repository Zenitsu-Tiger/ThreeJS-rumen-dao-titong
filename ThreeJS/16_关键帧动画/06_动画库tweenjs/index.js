import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN, { Tween } from '@tweenjs/tween.js';
import group from './mesh.js';

import {
  CSS3DRenderer,
  CSS3DSprite,
} from 'three/examples/jsm/renderers/CSS3DRenderer.js';
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
scene.add(group); //模型对象添加到场景中

//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// 添加辅助网格坐标
/* const gridHelper = new THREE.GridHelper(300);
scene.add(gridHelper); */
//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 300, -300);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// 正投影相机
const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);

camera.position.set(200, 200, 200);

camera.lookAt(0, 0, 0);

// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启优化锯齿
});
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);

// 将渲染器的canvas添加到body中
document.body.appendChild(renderer.domElement);

// 后期处理
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 创建OutlinePass通道
const v2 = new THREE.Vector2(window.innerWidth, window.innerHeight);
const outlinePass = new OutlinePass(v2, scene, camera);

outlinePass.visibleEdgeColor.set(0x00ffff);
outlinePass.edgeThickness = 4;
outlinePass.edgeStrength = 6;
composer.addPass(outlinePass);

// FXAA抗锯齿通道
const fxaaPass = new ShaderPass(FXAAShader);
const pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
composer.addPass(fxaaPass);

// 添加OutputPass, 进行颜色空间转换(伽马校正通道)，必须是最后一个Pass
const outputPass = new OutputPass();
composer.addPass(outputPass);

// 添加CSS3DRenderer背景板
const css3dRenderer = new CSS3DRenderer();
css3dRenderer.setSize(width, height);
css3dRenderer.domElement.style.position = 'absolute';
css3dRenderer.domElement.style.top = '0px';
css3dRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(css3dRenderer.domElement);

// 🔑 创建CSS3D标签对象
const tagElement = document.getElementById('tag');
const tag = new CSS3DSprite(tagElement);
tag.scale.set(0.05, 0.05, 0.1); // 进一步缩小到10%
scene.add(tag); // 将CSS3D对象添加到场景中

// 添加一个变量来跟踪当前的相机动画
let currentCameraTween = null;
let opacityTween = null; // 用于管理动画，避免冲突

// 渲染循环 - 将动画更新合并到这里
function render() {
  TWEEN.update();
  css3dRenderer.render(scene, camera);
  // renderer.render(scene, camera);
  composer.render();
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
  // 重要：也要更新后期处理的分辨率
  composer.setSize(width, height);
  css3dRenderer.setSize(width, height);
  // 2. 更新相机的宽高比
  camera.aspect = width / height;
  // 3. 应用更改
  camera.updateProjectionMatrix();
};
const raycaster = new THREE.Raycaster();

const pointer = new THREE.Vector2();

const span = document.getElementById('name');

window.addEventListener('click', event => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const cunchu = group.getObjectByName('存储罐');

  // 为所有网格设置父模型引用
  for (let i = 0; i < cunchu.children.length; i++) {
    const parentGroup = cunchu.children[i];
    parentGroup.traverse(obj => {
      if (obj.isMesh) {
        obj.parentModel = parentGroup; // 设置指向真正的父模型
      }
    });
  }

  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const selectedObject = intersects[0].object;

    // 🔑 关键：查找真正的父模型
    let targetModel = null;

    if (selectedObject.parentModel) {
      targetModel = selectedObject.parentModel;
    } else {
      // 如果没有预设的parentModel，向上查找
      let current = selectedObject;
      while (current.parent && current.parent !== scene) {
        current = current.parent;
        // 检查是否是存储罐的直接子对象
        if (current.parent === cunchu) {
          targetModel = current;
          break;
        }
      }
    }
    if (targetModel) {
      outlinePass.selectedObjects = [targetModel];

      // 定位和内容设置
      const pos = new THREE.Vector3();
      span.innerHTML = targetModel.name;
      group.getObjectByName(targetModel.name + '标注').getWorldPosition(pos);
      tag.position.copy(pos);
      tag.position.y += 8; // 向上偏移
      if (tag.parent !== scene) {
        scene.add(tag);
      }
      // 2. 使用requestAnimationFrame将动画推迟到下一帧
      // 这就给了CSS3DRenderer足够的时间去把 `display` 从 `none` 改为 `block`
      requestAnimationFrame(() => {
        // 停止任何可能正在进行的旧动画
        if (opacityTween) {
          opacityTween.stop();
        }

        // ✅ 显示元素
        tagElement.style.display = 'block'; // 对应 display: 'none'
        // 或者 tagElement.style.visibility = 'visible';
        tagElement.style.pointerEvents = 'auto';
        // 现在，在一个可见的元素上开始动画
        opacityTween = new TWEEN.Tween({
          opacity: parseFloat(tagElement.style.opacity),
        })
          .to({ opacity: 1 }, 500) // 缩短动画时间以便测试
          .onUpdate(obj => {
            tagElement.style.opacity = obj.opacity;
          })
          .start();
      });

      const pos2 = pos.clone().addScalar(60);
      createCameraTween(pos2, pos);
    } else {
      hideTagWithFade();
    }
  } else {
    hideTagWithFade();
  }
});

// 🔑 创建一个全新的、专门用于淡出隐藏的函数
function hideTagWithFade() {
  if (opacityTween) {
    opacityTween.stop();
  }

  outlinePass.selectedObjects = [];
  tagElement.style.pointerEvents = 'none';

  const currentOpacity = tagElement.style.opacity;
  console.log('当前opacity:', currentOpacity);
  console.log('parseFloat结果:', parseFloat(currentOpacity));

  const startOpacity = parseFloat(currentOpacity) || 1;
  console.log('动画起始值:', startOpacity);

  opacityTween = new TWEEN.Tween({
    opacity: startOpacity,
  })
    .to({ opacity: 0 }, 500)
    .onUpdate(obj => {
      console.log('动画中opacity:', obj.opacity); // 🔑 看看这行有没有输出
      tagElement.style.opacity = obj.opacity;

      // 🔑 检查设置后的实际值
      console.log('设置后的实际值:', tagElement.style.opacity);
    })
    .onComplete(() => {
      console.log('淡出动画完成');
      // scene.remove(tag);
      tagElement.style.display = 'none';
    })
    .start();

  console.log('动画已启动'); // 🔑 确认动画启动了
}

// 🔑 修改 `close` 按钮的逻辑
const close = document.getElementById('close');
close.addEventListener('click', event => {
  event.stopPropagation();
  event.preventDefault();

  // 现在它会触发带淡出效果的隐藏，并移动相机
  hideTagWithFade();

  createCameraTween(
    new THREE.Vector3(200, 200, 200),
    new THREE.Vector3(0, 0, 0)
  );
});

// 🔑 修改所有按钮的清空状态逻辑
function clearAllStates() {
  // 这个函数现在只做一件事：隐藏标签
  hideTagWithFade();
  // 注意：我们不再在这里调用 TWEEN.removeAll()，因为它太具有破坏性了
}

document.getElementById('A').addEventListener('click', event => {
  event.stopPropagation();
  event.preventDefault();

  const pos = new THREE.Vector3();
  const A = group.getObjectByName('设备A标注');
  A.getWorldPosition(pos);
  const pos2 = pos.clone().addScalar(30);
  createCameraTween(pos2, pos);
});

document.getElementById('B').addEventListener('click', event => {
  event.stopPropagation();
  event.preventDefault();

  const pos = new THREE.Vector3();
  const B = group.getObjectByName('设备B标注');
  B.getWorldPosition(pos);
  const pos2 = pos.clone().addScalar(30);
  createCameraTween(pos2, pos);
});

document.getElementById('car').addEventListener('click', event => {
  event.stopPropagation();
  event.preventDefault();

  const pos = new THREE.Vector3();
  const car = group.getObjectByName('停车场标注');
  car.getWorldPosition(pos);
  const pos2 = pos.clone().addScalar(30);
  createCameraTween(pos2, pos);
});

document.getElementById('all').addEventListener('click', event => {
  event.stopPropagation();
  event.preventDefault();

  clearAllStates(); // 现在这只会优雅地隐藏标签

  const cameraPos = new THREE.Vector3(200, 200, 200);
  const lookAtTarget = new THREE.Vector3(0, 0, 0);
  createCameraTween(cameraPos, lookAtTarget);
});
// 相机动画函数，从A点飞行到B点，A点表示相机当前所处状态
// pos:三维向量Vector3,表示动画结束的时候相机的位置
// target:三维向量Vector3，表示相机动画结束lookAt指向的目标观察点

function createCameraTween(endPos, endTarget) {
  // TWEEN.removeAll(); // 🔑 暂时注释掉这行

  new TWEEN.Tween({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
    tx: controls.target.x,
    ty: controls.target.y,
    tz: controls.target.z,
  })
    .to(
      {
        x: endPos.x,
        y: endPos.y,
        z: endPos.z,
        tx: endTarget.x,
        ty: endTarget.y,
        tz: endTarget.z,
      },
      2000
    )
    .onUpdate(obj => {
      camera.position.set(obj.x, obj.y, obj.z);
      camera.lookAt(obj.tx, obj.ty, obj.tz);
      controls.target.set(obj.tx, obj.ty, obj.tz);
      controls.update();
    })
    .start();
}
