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

// 添加辅助网格坐标
/* const gridHelper = new THREE.GridHelper(300);
scene.add(gridHelper); */
//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 60, 50);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// 正投影相机
const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);

camera.position.set(292, 223, 185);
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

// 渲染循环 - 将动画更新合并到这里
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
// 保存视线数据
const dir = new THREE.Vector3();
// 获取相机的视线方向，这个会自动转化为单位向量
camera.getWorldDirection(dir);

const dis = dir.clone().multiplyScalar(200);
console.log('dis.length', dis.length());

/* // 相机视角平移
camera.position.add(dis); */
createTweenAnimation(camera.position, camera.position.clone().add(dis));
function createTweenAnimation(pos, targetPos) {
  new TWEEN.Tween({
    x: pos.x,
    y: pos.y,
    z: pos.z,
  })
    .to(
      {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
      },
      1500
    )
    .onUpdate(obj => {
      camera.position.set(obj.x, obj.y, obj.z);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
    })
    .start()
    .easing(TWEEN.Easing.Cubic.InOut);
}
const pos0 = camera.position.clone();
const gui = new GUI();

requestAnimationFrame(() => {
  gui
    .add({ L: 0 }, 'L', 0, 200)
    .step(1)
    .onChange(v => {
      const dis = dir.clone().multiplyScalar(v);
      const newPos = pos0.clone().add(dis);
      camera.position.copy(newPos);
    });
});
