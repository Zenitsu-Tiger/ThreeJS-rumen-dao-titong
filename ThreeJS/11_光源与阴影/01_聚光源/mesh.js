import * as THREE from "three";

const group = new THREE.Group();

// 创建一个平面来接收阴影
const planeGeometry = new THREE.PlaneGeometry(200, 200);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x888888,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true; // 平面接收阴影
group.add(plane);

// 创建一个立方体来投射阴影
const cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.castShadow = true; // 立方体投射阴影
cube.position.y = 10.1; // 将立方体略微抬高，防止与平面Z-fighting
group.add(cube);

export default group;
