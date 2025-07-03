import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gui from "./gui.js";
const loader = new GLTFLoader();

const group = new THREE.Group();

// 1. 创建一个立方体贴图加载器
const textureCube = new THREE.CubeTextureLoader();
// 2. 设置环境贴图的基础路径
textureCube.setPath("./环境贴图/");
// 3. 加载六张环境贴图图片，注意顺序必须是 [px, nx, py, ny, pz, nz]
textureCube.load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);
// 4. 设置正确的颜色编码，以获得更逼真的PBR渲染效果
textureCube.encoding = THREE.sRGBEncoding;

// 使用GLTFLoader加载模型
loader.load("./工厂.glb", gltf => {
  console.log("场景3D模型数据", gltf.scene);
  group.add(gltf.scene);
  // 5. 遍历Gltf模型中的所有网格（Mesh）
  gltf.scene.traverse(obj => {
    if (obj.isMesh) {
      // 6. 将加载的环境贴图赋值给网格材质的envMap属性
      obj.material.envMap = textureCube;
      // 7. 设置环境贴图对模型材质的影响强度
      obj.material.envMapIntensity = 1.0;
    }
  });

  // 添加gui的调试配置(记得加载load里面)
  const obj = {
    envMapIntensity: 1.0,
  };
  gui.add(obj, "envMapIntensity", 0, 10).onChange(value => {
    gltf.scene.traverse(obj => {
      if (obj.isMesh) {
        obj.material.envMapIntensity = value;
      }
    });
  });
});
export default group;
