import * as THREE from 'three';
// A表示3D空间一个点的位置坐标
const A = new THREE.Vector3(30, 0, 0);

const group = new THREE.Group();
// 黄色小球可视化坐标点A
const Amesh = createSphereMesh(0xffff00, 2);
Amesh.position.copy(A);
group.add(Amesh);
// 创建小球mesh
function createSphereMesh(color, R) {
  const geometry = new THREE.SphereGeometry(R);
  const material = new THREE.MeshLambertMaterial({
    color: color,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
// 创建一个四元素对象，表示姿态角度
const quaternion = new THREE.Quaternion();
// 旋转度数:Math.PI/2
quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
// a点坐标绕z轴旋转90度
const B = A.clone().applyQuaternion(quaternion);
console.log('B', B); //查看旋转后坐标

//红色小球可视化坐标点B
const Bmesh = createSphereMesh(0xff0000, 2);
Bmesh.position.copy(B);
group.add(Bmesh);
export default group;
