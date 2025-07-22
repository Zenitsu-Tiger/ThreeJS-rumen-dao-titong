import * as THREE from 'three';
const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, 100, 0);
group.add(mesh);
export default group;
