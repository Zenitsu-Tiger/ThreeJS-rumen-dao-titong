import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DSprite } from 'three/addons/renderers/CSS3DRenderer.js';
import createSprite from './spriteLot.js';
const loader = new GLTFLoader();
const group = new THREE.Group();
loader.load('./工厂.glb', gltf => {
  const scene = gltf.scene;
  group.add(scene);

  createSprite(scene.getObjectByName('设备A标注'), '警告');
  createSprite(scene.getObjectByName('设备B标注'), '故障');
});

export default group;
