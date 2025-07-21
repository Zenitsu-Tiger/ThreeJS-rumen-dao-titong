import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const group = new THREE.Group();
let mixer;
loader.load('./鸟.glb', gltf => {
  const mesh = gltf.scene;
  mesh.name = 'bird';
  group.add(mesh);

  mixer = new THREE.AnimationMixer(mesh);

  const clipAction = mixer.clipAction(gltf.animations[0]);

  clipAction.play();
});
const clock = new THREE.Clock();
export { mixer, clock };
export default group;
