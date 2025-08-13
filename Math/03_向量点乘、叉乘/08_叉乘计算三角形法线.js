// 引入Three.js
import * as THREE from 'three';
const group = new THREE.Group();
const geometry = new THREE.BufferGeometry();
// 类型数组创建顶点数据
const vertices = new Float32Array([
  0, 0, 0, 50, 0, 0, 0, 100, 0, 0, 0, 10, 0, 0, 100, 50, 0, 10,
]);
// 创建属性缓冲区对象
geometry.attributes.position = new THREE.BufferAttribute(vertices, 3);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  side: THREE.FrontSide,
});

const mesh = new THREE.Mesh(geometry, material);

// 已知三角形三个顶点的坐标，计算三角形法线的方向
const p1 = new THREE.Vector3(0, 0, 0);
const p2 = new THREE.Vector3(50, 0, 0);
const p3 = new THREE.Vector3(0, 100, 0);
const a = p2.clone().sub(p1);
const b = p3.clone().sub(p2);
const c = a.clone().cross(b);
const normal = c.clone().normalize();

const arrow = new THREE.ArrowHelper(normal, p3, 50, 0x0000ff);
group.add(arrow);
group.add(mesh, arrow);

export default group;
