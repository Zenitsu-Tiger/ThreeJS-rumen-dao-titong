import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gui from "./gui.js";

const loader = new GLTFLoader();
const group = new THREE.Group();

// 1. 环境贴图：load() 返回的才是贴图，加载器本身不是贴图
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath("./环境贴图/");
// 顺序固定：[px, nx, py, ny, pz, nz] = [右, 左, 上, 下, 前, 后]
const textureCube = cubeTextureLoader.load([
  "px.jpg",
  "nx.jpg",
  "py.jpg",
  "ny.jpg",
  "pz.jpg",
  "nz.jpg",
]);
// 颜色空间（旧写法 encoding = sRGBEncoding 已删除）
textureCube.colorSpace = THREE.SRGBColorSpace;

// 2. 加载工厂模型
loader.load("./工厂.glb", (gltf) => {
  // 打印模型尺寸，作为 index.js 里设置阴影范围的依据
  const box = new THREE.Box3().setFromObject(gltf.scene);
  console.log("模型尺寸（宽×高×深）：", box.getSize(new THREE.Vector3()));

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.material.envMap = textureCube; // 环境贴图
      child.material.envMapIntensity = 1.0; // 环境贴图影响强度
      child.castShadow = true; // 投射阴影
      child.receiveShadow = true; // 接收阴影
    }
  });
  group.add(gltf.scene);

  // GUI：调节环境贴图强度（写在 load 回调里，模型加载完才有 Mesh）
  const params = { envMapIntensity: 1.0 };
  gui
    .add(params, "envMapIntensity", 0, 10)
    .name("环境贴图强度")
    .onChange((value) => {
      gltf.scene.traverse((child) => {
        if (child.isMesh) child.material.envMapIntensity = value;
      });
    });
});

export default group;