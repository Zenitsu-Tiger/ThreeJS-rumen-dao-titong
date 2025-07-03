import * as THREE from "three";

// 将平面Z轴尺寸导出，方便在index.js中用于光源动画
export const planeZSize = 850;

const group = new THREE.Group();

// 创建一个平面来接收阴影
const planeGeometry = new THREE.PlaneGeometry(400, planeZSize);
const planeMaterial = new THREE.MeshLambertMaterial({
  color: 0x999999,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;

group.add(plane);

// 创建一个立方体来投射阴影
const cubeGeometry = new THREE.BoxGeometry(50, 100, 50);
const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ffff });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

cube.position.y = 50;

// 设置产生投影的模型
cube.castShadow = true; // 立方体投射阴影
// 该平面需要设置接收其他模型产生的阴影的属性
plane.receiveShadow = true; // 平面接收阴影

for (let i = -3; i < 4; i++) {
  const mesh2 = cube.clone();
  mesh2.castShadow = true;
  mesh2.position.z = 100 * i;
  group.add(mesh2);
}
export default group;
