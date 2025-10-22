// 引入Three.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const model = new THREE.Group();

const loader = new GLTFLoader();
const person = new THREE.Group();
model.add(person);
loader.load('./人.glb', function (gltf) {
  gltf.scene.scale.set(10, 10, 10);
  person.add(gltf.scene);
});

const geometry = new THREE.BoxGeometry(2, 2, 2);
geometry.translate(0, 0.2, 0);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);
model.add(mesh);

// 已知条件
person.position.set(0, 0, 2); //人位置
mesh.position.set(2, 0, -3); //物体位置

// a向量：人的正前方沿着z轴负半轴
const a = new THREE.Vector3(0, 0, -1);
// 人指向物体的向量
const b = mesh.position.clone().sub(person.position);
console.log(b);
b.normalize();
const dot = a.dot(b);
if (dot > 0) {
  console.log('物体在人的前方');
} else {
  console.log('物体在人的后方');
}
export default model;
