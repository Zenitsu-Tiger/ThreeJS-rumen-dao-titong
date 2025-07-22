import * as THREE from 'three';
const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(50, 50, 50);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);
// 获取定点位置的合集对象
const p = mesh.geometry.attributes.position;
// 获取顶点法线的合集对象
const n = mesh.geometry.attributes.normal;

console.log('p', p);
console.log('n', n);

for (let i = 0; i < p.count; i++) {
  // 逐个获取顶点和对应的点方向
  const O = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i));
  const dir = new THREE.Vector3(n.getX(i), n.getY(i), n.getZ(i));
  // 生成箭头从O指向dir
  const arrowHelper = new THREE.ArrowHelper(dir, O, 10);
  mesh.add(arrowHelper);
}
group.add(mesh);
export default group;
