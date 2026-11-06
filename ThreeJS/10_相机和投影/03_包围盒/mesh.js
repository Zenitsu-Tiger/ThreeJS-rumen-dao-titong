import * as THREE from "three";

const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(100, 100, 100);
const material = new THREE.MeshLambertMaterial({ color: 0x00ffff });
const mesh = new THREE.Mesh(geometry, material);

// 计算模型包围盒
const box3 = new THREE.Box3();
box3.setFromObject(mesh);
console.log("box3", box3); // min (-50,-50,-50)，max (50,50,50)

// 获取包围盒的尺寸
const size = new THREE.Vector3();
box3.getSize(size);
console.log("size", size); // (100, 100, 100)

// 获取包围盒的中心点坐标
const center = new THREE.Vector3();
box3.getCenter(center);
console.log("center", center); // (0, 0, 0)

// 把模型中心挪到原点（本例中心已在原点，挪完不变；外部模型才看得出效果）
mesh.position.sub(center);
box3.setFromObject(mesh); // 挪完重新计算

group.add(mesh);

// 可视化包围盒
const box3Helper = new THREE.Box3Helper(box3, 0xffff00);
group.add(box3Helper);

export default group;