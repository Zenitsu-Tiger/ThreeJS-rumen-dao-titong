import * as THREE from "three";

const geometry = new THREE.BufferGeometry();

const pointsArr = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 100, 0),
  new THREE.Vector3(0, 100, 100),
  new THREE.Vector3(0, 0, 100),
];
geometry.setFromPoints(pointsArr);

console.log("几何体变化", geometry.attributes.position);

const material = new THREE.PointsMaterial({
  color: 0xff0000,
  size: 10,
});

const line = new THREE.Points(geometry, material);

export default line;
