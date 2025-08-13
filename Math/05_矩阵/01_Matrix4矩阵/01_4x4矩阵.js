import * as THREE from 'three';
const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);

// 4x4矩阵
const mat4=new THREE.Matrix4()
// 平移矩阵
// .elements属性数组，按列输入
mat4.elements=[1,0,0,0,0,1,0,0,0,0,1,0,50,0,0,1]
group.add(mesh);
export default group;
