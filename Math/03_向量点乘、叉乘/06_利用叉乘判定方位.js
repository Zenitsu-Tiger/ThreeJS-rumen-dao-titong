// 引入Three.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const group = new THREE.Group();

const loader = new GLTFLoader();
const person = new THREE.Group();
group.add(person);
loader.load('../人.glb', function (gltf) {
  gltf.scene.scale.set(10, 10, 10);
  person.add(gltf.scene);
});

const geometry = new THREE.BoxGeometry(10, 10, 10);
geometry.translate(0, 0.2, 0);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);
group.add(mesh);

// 已知条件
person.position.set(0, 0, 20); //人位置

// a向量:render正前方沿着z轴负半轴
const a = new THREE.Vector3(0, 0, -30);
const arrowA = new THREE.ArrowHelper(
  a.clone().normalize(),
  person.position,
  a.length(),
  0x00ff00
);
group.add(arrowA);
// 物体在人的右侧
// mesh.position.set(20, 0, -30); //物体位置
mesh.position.set(-20, 0, -30);
// 表示人指向物体的向量
const b = mesh.position.clone().sub(person.position);
const arrowB = new THREE.ArrowHelper(
  b.clone().normalize(),
  person.position,
  b.length(),
  0xff0000
);
group.add(arrowB);

const c = a.clone().cross(b);
c.normalize();
const arrowC = new THREE.ArrowHelper(
  c.clone().normalize(),
  person.position,
  10,
  0x0000ff
);
group.add(arrowC);

if (c.y < 0) {
  console.log('物体在人的右侧');
} else {
  console.log('物体在人的左侧');
}
export default group;
