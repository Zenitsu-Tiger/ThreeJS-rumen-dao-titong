import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import {group,mesh1,mesh2,mesh3} from "./mesh.js";

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

/* // 正投影相机
const k = width / height;
const s = 10;
const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 8000);
camera.position.set(0, 0, 200);
camera.lookAt(0, 0, 0); */

// WebGL渲染器设置
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启优化锯齿
});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);

// 将渲染器的canvas添加到body中
document.body.appendChild(renderer.domElement);

// 渲染循环
function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

const controls = new OrbitControls(camera, renderer.domElement);

// 射线选中模型流程全解
addEventListener('click',(event)=>{
  // 1.座标转化(屏幕坐标转标准设备坐标)
  const px=event.offsetX
  const py=event.offsetY
  // 屏幕坐标px,py转WebGL标准设备坐标x,y
  // width,height表示canvas画布宽高度
  const x=(px/window.innerWidth)*2-1
  const y=-(py/window.innerHeight)*2+1

  // 2.创建一个射线投射器Raycaster
const raycaster=new THREE.Raycaster()
// setFromCamera()是用于计算射线投射器Raycaster的射线属性.ray
// 也就是在点击位置创建一条射线，用于选中拾取模型对象
// 这种方式不用定义射线起点和射线方向
raycaster.setFromCamera(new THREE.Vector2(x,y),camera)
// 获取交叉模型
const intersects=raycaster.intersectObjects(group.children)
if(intersects.length>0){
// 选中的模型第一个设置为绿色
intersects[0].object.material.color.set(0x00ff00)
// 选中的模型第二个设置为蓝色
if (intersects[1]) {
  intersects[1].object.material.color.set(0x0000ff)
}
}
})

// 画布跟随窗口变化
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

