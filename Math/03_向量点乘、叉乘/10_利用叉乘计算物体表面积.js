// 引入Three.js
import * as THREE from 'three';
const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(50, 50, 50);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);

const pos = geometry.attributes.position;
const index = geometry.index;
let S = 0; //模型表面积
console.log('index', index);
console.log('pos', pos);

for (let i = 0; i < index.count; i += 3) {
  // 每个三角形对应的三个顶点的索引
  const i1 = index.getX(i);
  const i2 = index.getX(i + 1);
  const i3 = index.getX(i + 2);
  console.log('i1', i1, 'i2', i2, 'i3', i3);

  const p1 = new THREE.Vector3(pos.getX(i1), pos.getY(i1), pos.getZ(i1));
  const p2 = new THREE.Vector3(pos.getX(i2), pos.getY(i2), pos.getZ(i2));
  const p3 = new THREE.Vector3(pos.getX(i3), pos.getY(i3), pos.getZ(i3));
  S += AreaOfTriangle(p1, p2, p3);
  console.log('p1', p1, 'p2', p2, 'p3', p3);

  const area = AreaOfTriangle(p1, p2, p3);
  console.log('area', area);
}
console.log('S', S);

function AreaOfTriangle(p1, p2, p3) {
  const a = p2.clone().sub(p1);
  const b = p3.clone().sub(p1);

  const c = a.clone().cross(b);

  const area = c.length() * 0.5;
  return area;
}
group.add(mesh);
export default group;
