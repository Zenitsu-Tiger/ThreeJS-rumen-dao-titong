import * as THREE from 'three';


const geometry = new THREE.BoxGeometry(50, 50, 50);
const material = new THREE.MeshLambertMaterial({
    color: 0x009999,
});
const mesh = new THREE.Mesh(geometry, material);

const mesh2 = mesh.clone();
mesh2.position.y = 100;
const mesh3 = mesh.clone();
mesh3.position.x = 100;
const model = new THREE.Group();

// 三个网格模型用于高亮发光描边测试
model.add(mesh,mesh2,mesh3);

export {model,mesh,mesh2,mesh3};