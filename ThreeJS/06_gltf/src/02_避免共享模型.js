import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const model = new THREE.Group();

loader.load('/小区积木.glb', (gltf) => {
  
  // 第一步：遍历所有网格，克隆材质
  gltf.scene.traverse(child => {
    if (child.isMesh) {
      // 克隆材质，确保每个物体独立
      child.material = child.material.clone();
      
      // 可选：给材质命名，方便调试
      child.material.name = `${child.name}_Material`;
    }
  });
  
  // 第二步：现在可以安全地单独修改每个物体
  const mesh1 = gltf.scene.getObjectByName('1号楼');
  const mesh2 = gltf.scene.getObjectByName('2号楼');
  const mesh3 = gltf.scene.getObjectByName('3号楼');
  
  // 每个楼独立设置颜色
  if (mesh1) mesh1.material.color.set(0x00ff00); // 绿色
  if (mesh2) mesh2.material.color.set(0x0000ff); // 蓝色
  if (mesh3) mesh3.material.color.set(0xff0000); // 红色
  
  // 可以单独设置其他属性
  if (mesh1) {
    mesh1.material.emissive.set(0x004400); // 发光效果
    mesh1.material.metalness = 0.5;
  }
  
  model.add(gltf.scene);
});

export default model;