import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const group = new THREE.Group();
loader.load('./工厂.glb', (gltf) => {
  group.add(gltf.scene);

  const obj = gltf.scene.getObjectByName('设备A');
  console.log('obj', obj);

  const axesHelper = new THREE.AxesHelper(30);
  axesHelper.renderOrder = 999;
  obj.add(axesHelper);
});

export default group;
