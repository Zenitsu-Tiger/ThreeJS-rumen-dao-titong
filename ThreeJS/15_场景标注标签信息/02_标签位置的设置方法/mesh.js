import * as THREE from 'three';
// 引入CSS2模型对象CSS2DObject
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const geometry = new THREE.ConeGeometry(40, 70, 64);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});

const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(50, 0, 50);

const meshGroup = new THREE.Group();
// mesh位置受到父对象局部坐标.position影响
meshGroup.position.x = -100;

const group = new THREE.Group();
const div = document.getElementById('tag');
const tag = new CSS2DObject(div);

mesh.add(tag);
const pos = geometry.attributes.position;
// 获取几何体索引 0 的顶点坐标（圆锥顶点 (0, 35, 0)），设为标签局部坐标
tag.position.set(pos.getX(0), pos.getY(0), pos.getZ(0));

meshGroup.add(mesh);
group.add(meshGroup);

// 本地坐标
console.log('mesh.position', mesh.position);

export default group;