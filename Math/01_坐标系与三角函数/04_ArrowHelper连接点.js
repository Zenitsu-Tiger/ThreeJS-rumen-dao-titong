import * as THREE from 'three';
const group = new THREE.Group();

const A = new THREE.Vector3(0, 30, 0);
const B = new THREE.Vector3(80, 0, 0);

// 创建球体表示A点位置
const AMesh = createSphereMesh(0x00ffff, 5);
AMesh.position.copy(A);
const BMesh = createSphereMesh(0x00ff00, 5);
BMesh.position.copy(B);
function createSphereMesh(color, R) {
  const geometry = new THREE.SphereGeometry(R);
  const material = new THREE.MeshLambertMaterial({
    color: color,
    transparent: true,
    opacity: 0.8,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
const AB = B.clone().sub(A);
const L = AB.length();
const dir = AB.clone().normalize();
// 生成箭头从A指向B,第一个参数是方向向量，第二个参数是起点，第三个参数是长度
// const arrowHelper = new THREE.ArrowHelper(dir, A, L);
const arrowHelper = new THREE.ArrowHelper(dir, A, 50);

group.add(arrowHelper);

group.add(AMesh);
group.add(BMesh);
export default group;
