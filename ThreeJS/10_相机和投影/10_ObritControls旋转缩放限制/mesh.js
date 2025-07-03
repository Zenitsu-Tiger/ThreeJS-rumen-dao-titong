import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const loader = new GLTFLoader();
const group = new THREE.Group();

loader.load("./工厂.glb", glb => {
  const mesh = glb.scene;
  group.add(mesh);
});

export default group;
