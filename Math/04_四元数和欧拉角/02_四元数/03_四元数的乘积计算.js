import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const group = new THREE.Group();
const loader = new GLTFLoader();
loader.load('./bf109.glb', gltf => {
  const model = gltf.scene;
  // model.rotation.y = -Math.PI / 2;
  model.scale.set(5, 5, 5);
  console.log('model', model);

  group.add(model);
  model.position.set(10, 50, 0);

  const axesHelper = new THREE.AxesHelper(10);
  model.add(axesHelper);

  const q1 = new THREE.Quaternion();
  // 绕z轴旋转60度
  q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 6);
  // 绕x轴旋转60度
  const q2 = new THREE.Quaternion();
  q2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 6);

  // model.quaternion.multiply(q1);
  // model.quaternion.multiply(q2);
  // model.quaternion.multiply(q2).multiply(q1);
  model.quaternion.multiply(q1).multiply(q2);
});

export default group;
