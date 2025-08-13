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

  /*   欧拉角的旋转应用
  const Euler = new THREE.Euler();
  // 旋转顺序不同，效果不一样
  Euler.order = 'XYZ';
  // Euler.order = 'YXZ';

  // 绕x旋转指定度数
  // model.rotation.x=Math.PI/3
  Euler.x = Math.PI / 3;
  // 绕y旋转指定度数
  Euler.y = Math.PI / 3;

  model.rotation.copy(Euler); */

  /* 四元数的旋转应用 */
  const quaternion = new THREE.Quaternion();
  // 绕x轴旋转90度
  // quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
  quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 6);
  model.quaternion.copy(quaternion);
});

export default group;
