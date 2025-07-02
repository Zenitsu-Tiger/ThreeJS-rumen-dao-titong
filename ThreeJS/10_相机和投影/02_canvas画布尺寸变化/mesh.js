import * as THREE from "three";

const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(100, 100, 100);

const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
  
});

const mesh = new THREE.Mesh(geometry, material);

group.add(mesh);

export default group;
