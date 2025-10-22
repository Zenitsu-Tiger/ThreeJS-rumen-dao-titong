import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
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



import group from "./mesh.js";

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
const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio); //防止输出模糊
renderer.setSize(width, height);

// 将渲染器的canvas添加到body中
document.body.appendChild(renderer.domElement);

// 创建后处理对象EffectComposer，WebGL渲染器作为参数
const composer = new EffectComposer(renderer);
// 创建一个渲染器通道，场景和相机作为参数
const renderPass = new RenderPass(scene, camera);
// 设置renderPass通道
composer.addPass(renderPass);

// 创建OutlinePass通道
const v2=new THREE.Vector2(window.innerWidth,window.innerHeight)
const outlinePass=new OutlinePass(v2,scene,camera)
outlinePass.visibleEdgeColor.set(0x00ffff)
outlinePass.edgeThickness=4
outlinePass.edgeStrength=6
composer.addPass(outlinePass)

// 创建FXAA通道
const fxaaPass=new ShaderPass(FXAAShader)
const pixelRatio=renderer.getPixelRatio()
fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
composer.addPass(fxaaPass);

// 创建输出通道
const outputPass=new OutputPass()
composer.addPass(outputPass)

// 渲染循环
function render() {
  // renderer.render(scene, camera);
  composer.render()
  requestAnimationFrame(render);
}
render();

const controls = new OrbitControls(camera, renderer.domElement);

// 射线选中模型流程全解
renderer.domElement.addEventListener('click',(event)=>{
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


// 射线拾取模型
const cunchu=group.getObjectByName('存储罐')
for(let i=0;i<cunchu.children.length;i++){
  // 先获取父对象
  const group=cunchu.children[i]
  // 再递归遍历每一个父对象中的子对象，打上标记设置其祖宗tag，方便后面拾取模型直接定位父对象
  group.traverse((obj)=>{
    if(obj.isMesh){
      obj.ancestors=group
    }
  })

}

const intersects=raycaster.intersectObjects(cunchu.children)
console.log('intersects',intersects);

if(intersects.length>0){
  // 这里如果采用[intersects[0].object]，则选中的不一定是父模型数组中的第一个，而可能是子模型数组中的第一个
outlinePass.selectedObjects=[intersects[0].object.ancestors]
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

