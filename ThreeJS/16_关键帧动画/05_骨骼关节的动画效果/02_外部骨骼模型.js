import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

const group = new THREE.Group();
const loader = new GLTFLoader();
loader.load('./骨骼动画.glb', gltf => {
  console.log('查看gltf对象结构', gltf);
  group.add(gltf.scene);

  const skeletonHelper = new THREE.SkeletonHelper(gltf.scene);
  group.add(skeletonHelper);

  const bone1 = gltf.scene.getObjectByName('Bone1');
  const bone2 = gltf.scene.getObjectByName('Bone2');
  const bone3 = gltf.scene.getObjectByName('Bone3');

  // 查看骨骼的位置，了解延伸方向
  console.log('Bone1 position:', bone1.position);
  console.log('Bone2 position:', bone2.position);
  console.log('Bone3 position:', bone3.position);

  const gui = new GUI();

  // 尝试不同的旋转轴，看哪个符合预期
  gui.add(bone1.rotation, 'x', 0, Math.PI / 6).name('关节点1-X轴');
  gui.add(bone1.rotation, 'y', 0, Math.PI / 6).name('关节点1-Y轴');
  gui.add(bone1.rotation, 'z', 0, Math.PI / 6).name('关节点1-Z轴');

  gui.add(bone2.rotation, 'x', 0, Math.PI / 6).name('关节点2-X轴');
  gui.add(bone2.rotation, 'y', 0, Math.PI / 6).name('关节点2-Y轴');
  gui.add(bone2.rotation, 'z', 0, Math.PI / 6).name('关节点2-Z轴');

  gui.add(bone3.rotation, 'x', 0, Math.PI / 6).name('关节点3-X轴');
  gui.add(bone3.rotation, 'y', 0, Math.PI / 6).name('关节点3-Y轴');
  gui.add(bone3.rotation, 'z', 0, Math.PI / 6).name('关节点3-Z轴');
});

export default group;
