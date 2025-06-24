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

  const mesh2 = gltf.scene.getObjectByName("玻璃01");
  mesh2.material = new THREE.MeshPhysicalMaterial({
    metalness: 0,
    roughness: 0,
    envMap: textureCube,
    envMapIntensity: 1,
    transmission: 1,
    ior: 1.5,
  });
});

// 导出模型组，供其他模块使用
export default model;
