import * as THREE from 'three';
// 引入GLTF加载器
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 实例化一个加载器对象
const loader = new GLTFLoader();

const model = new THREE.Group();
loader.load('/小区积木.glb', gltf => {
  console.log('场景3d模型树结构', gltf.scene);
  const nameNode = gltf.scene.getObjectByName('1号楼');
  nameNode.material.color.set(0xff0000);

  const obj = gltf.scene.getObjectByName('洋房');
  console.log('obj', obj.children);
  obj.children.forEach(item => {
    item.material.color.set(0x00ff00);
  });
  model.add(gltf.scene);
});

export default model;
