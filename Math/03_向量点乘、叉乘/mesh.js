import * as THREE from 'three';

// 已知条件
// 直线经过两点坐标A、B
const A = new THREE.Vector3(0, 0, 0);
const B = new THREE.Vector3(100, 0, 0);
// 直线外一点p
const p = new THREE.Vector3(50, 0, 30);

// 小球可视化四个坐标点
const group = new THREE.Group();
const AMesh = createSphereMesh(0xffff00, 2);
AMesh.position.copy(A);
const BMesh = createSphereMesh(0xffff00, 2);
BMesh.position.copy(B);
const pMesh = createSphereMesh(0xff0000, 2);
pMesh.position.copy(p);
group.add(AMesh, BMesh, pMesh);
// 创建小球mesh
function createSphereMesh(color, R) {
  const geometry = new THREE.SphereGeometry(R);
  const material = new THREE.MeshLambertMaterial({
    color: color,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
// ApB构建一个三角形，其中两条边构建向量a、向量b
const a = A.clone().sub(p);
const b = B.clone().sub(p);
const c = a.clone().cross(b);
const S = 0.5 * c.length(); //叉乘结果长度一半是三角形ApB的面积
// const H = S / width * 2;//点p到AB直线的距离，就是三角形ApB在AB上的高度

const AB = B.clone().sub(A);
const width = AB.length(); //AB两点距离

const H = (S / width) * 2;
console.log('H', H);

export default group;
