import * as THREE from "three";

const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(100, 100, 100);

const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});

const mesh = new THREE.Mesh(geometry, material);

const box3 = new THREE.Box3();
// 计算模型包围盒
box3.expandByObject(mesh);
console.log("box3", box3);

const scale = new THREE.Vector3();

// 获取包围盒的尺寸
box3.getSize(scale);
console.log("scale", scale);
// 获取包围盒的中心点的座标
const center = new THREE.Vector3();
box3.getCenter(center);
console.log("center", center);

group.add(mesh);

export default group;
