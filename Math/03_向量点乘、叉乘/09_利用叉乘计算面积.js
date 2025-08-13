// 引入Three.js
import * as THREE from 'three';
const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(50, 50, 50);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);
// 已知三角形三个顶点的坐标，计算三角形的面积
const p1 = new THREE.Vector3(0, 0, 0);
const p2 = new THREE.Vector3(10, 0, 0);
const p3 = new THREE.Vector3(0, 10, 0);
const a = p2.clone().sub(p1);
const b = p3.clone().sub(p1);

const c = a.clone().cross(b);

const area = c.length() * 0.5;
console.log('area', area);
group.add(mesh);

export default group;
