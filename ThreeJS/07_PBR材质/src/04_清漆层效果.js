// 导入Three.js核心库
import * as THREE from "three";
// 导入GLTF模型加载器，用于加载.glb/.gltf格式的3D模型文件
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 导入GUI控制器
import gui from "./gui.js";

// 创建GLTF加载器实例
const loader = new GLTFLoader();

// 创建一个空的3D对象组，用于容纳加载的模型
const model = new THREE.Group();

// CubeTexture代表了立方体纹理对象，父类是纹理对象Texture
// 先设置路径
// 再加载6个方向的立方体贴图：x轴正负，y轴正负，z轴正负
const textureCube = new THREE.CubeTextureLoader()
  .setPath("./环境贴图1/")
  .load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);

loader.load("./car/轿车.glb", gltf => {
  model.add(gltf.scene);

  const mesh = gltf.scene.getObjectByName("外壳01");

  // 创建物理材质并设置初始参数
  mesh.material = new THREE.MeshPhysicalMaterial({
    color: mesh.material.color,
    metalness: 1,
    roughness: 0.5,
    // 清漆层强度
    clearcoat: 1,
    // 清漆层粗糙度
    clearcoatRoughness: 0.01,
    envMap: textureCube,
    // 环境贴图强度envMapIntensity
    envMapIntensity: 2.5,
  });

  // 创建车外壳材质控制文件夹
  const materialFolder = gui.addFolder("车外壳材质");

  // 颜色控制器
  materialFolder.addColor(mesh.material, "color").name("color");

  // 金属度控制器
  materialFolder.add(mesh.material, "metalness", 0, 1, 0.01).name("metalness");

  // 粗糙度控制器
  materialFolder.add(mesh.material, "roughness", 0, 1, 0.01).name("roughness");

  // 清漆涂层强度控制器
  materialFolder.add(mesh.material, "clearcoat", 0, 1, 0.01).name("clearcoat");

  // 清漆涂层粗糙度控制器
  materialFolder
    .add(mesh.material, "clearcoatRoughness", 0, 1, 0.01)
    .name("clearcoatRoughness");

  // 环境贴图强度控制器
  materialFolder
    .add(mesh.material, "envMapIntensity", 0, 5, 0.1)
    .name("envMapIntensity");

  // 展开材质文件夹
  materialFolder.open();
});



// 导出模型组，供其他模块使用
export default model;
