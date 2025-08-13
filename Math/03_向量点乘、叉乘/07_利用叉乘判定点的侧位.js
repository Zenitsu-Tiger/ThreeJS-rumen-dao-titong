// 引入Three.js
import * as THREE from 'three';
// 已知条件
// 一条线段两点坐标A、B
const A = new THREE.Vector3(0, 0, 10);
const B = new THREE.Vector3(100, 0, 10);

// 判断p1、p2两点位于线段AB同一侧，还是异侧
const p1 = new THREE.Vector3(20, 0, 40);
const p2 = new THREE.Vector3(80, 0, 40); //与p1同侧
// const p2 = new THREE.Vector3(80, 0, -30);//与p1异侧

// 小球可视化四个坐标点
const group = new THREE.Group();
const AMesh = createSphereMesh(0xffff00, 2);
AMesh.position.copy(A);
const BMesh = createSphereMesh(0xffff00, 2);
BMesh.position.copy(B);
const p1Mesh = createSphereMesh(0xff0000, 2);
p1Mesh.position.copy(p1);
const p2Mesh = createSphereMesh(0xff0000, 2);
p2Mesh.position.copy(p2);
group.add(AMesh, BMesh, p1Mesh, p2Mesh);

// Line可视化线段AB
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([A.x, A.y, A.z, B.x, B.y, B.z]);
geometry.attributes.position = new THREE.BufferAttribute(vertices, 3);
const material = new THREE.LineBasicMaterial({
  color: 0xffff00,
});
const line = new THREE.LineLoop(geometry, material);
group.add(line);

const a1 = A.clone().sub(p1);
const b1 = B.clone().sub(p1);
const a2 = A.clone().sub(p2);
const b2 = B.clone().sub(p2);
const c1 = a1.clone().cross(b1);
const c2 = a2.clone().cross(b2);
group.add(
  new THREE.ArrowHelper(a1.clone().normalize(), p1, a1.length(), 0xff0000)
);
group.add(
  new THREE.ArrowHelper(b1.clone().normalize(), p1, b1.length(), 0x00ff00)
);
group.add(
  new THREE.ArrowHelper(a2.clone().normalize(), p2, a2.length(), 0xff0000)
);
group.add(
  new THREE.ArrowHelper(b2.clone().normalize(), p2, b2.length(), 0x00ff00)
);
group.add(new THREE.ArrowHelper(c1.clone().normalize(), p1, 50, 0x0000ff));
group.add(new THREE.ArrowHelper(c2.clone().normalize(), p2, 50, 0x0000ff));

const cos = c1.normalize().dot(c2.normalize());
console.log('cos', cos);

// 方向完全一致 0度 cosθ 1
// 方向完全相反 180度 cosθ -1
// 方向垂直 90度 cosθ 0
if (cos > 0.5) {
  console.log('方向相同，两点在线段同侧');
} else {
  console.log('方向相反，两点在线段异侧');
}

// 创建小球mesh
function createSphereMesh(color, R) {
  const geometry = new THREE.SphereGeometry(R);
  const material = new THREE.MeshLambertMaterial({
    color: color,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
export default group;
