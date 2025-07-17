import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 引入CSS2渲染器CSS2DRenderer
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import model from './mesh.js'; //模型对象

//场景
const scene = new THREE.Scene();
scene.add(model); //模型对象添加到场景中


//辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);
// 添加一个辅助网格地面
const gridHelper = new THREE.GridHelper(300, 25, 0x004444, 0x004444);
scene.add(gridHelper);

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
camera.position.set(292, 223, 185);
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
const css2Renderer = new CSS2DRenderer();
css2Renderer.setSize(width, height);
document.body.appendChild(css2Renderer.domElement);

// HTML标签<div id="tag"></div>外面父元素叠加到canvas画布上且重合
// 注意canvas网布布局方式不同，CSS相关代码写法也可能不同，不过你只要能让标签父元素叠加到canvas画布上上面且重合就行
css2Renderer.domElement.style.position = 'absolute';
css2Renderer.domElement.style.top = '0px';
css2Renderer.domElement.style.pointerEvents = 'none';
// 改变canvas画布在网页位置，标签父元素css2Renderer.domElement也要重新定位
//  renderer.domElement.style.marginTop = '200px';
//  css2Renderer.domElement.style.top = '200px'; 

// 渲染循环
function render() {
    css2Renderer.render(scene, camera);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
render();


const controls = new OrbitControls(camera, renderer.domElement);


window.onresize=()=>{
  const width=window.innerWidth
  const height=window.innerHeight
  camera.aspect=width/height
  camera.updateProjectionMatrix()
  renderer.setSize(width,height)
  css2Renderer.setSize(width,height)

}