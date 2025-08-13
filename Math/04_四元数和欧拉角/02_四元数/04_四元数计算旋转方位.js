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
  // 可视化飞机方向
  const a = new THREE.Vector3(0, 0, -1);
  // 飞机旋转后的飞行方向
  const b = new THREE.Vector3(-1, -1, -1).normalize();

  group.add(new THREE.ArrowHelper(a, model.position, 50, 0xff0000));
  group.add(new THREE.ArrowHelper(b, model.position, 50, 0x00ff00));

  const quaternion = new THREE.Quaternion();
  // 生成一个四元数，从a旋转到b
  quaternion.setFromUnitVectors(a, b);
  // 从a旋转到b的过程=>quaternion
  model.quaternion.copy(quaternion);
});

export default group;
