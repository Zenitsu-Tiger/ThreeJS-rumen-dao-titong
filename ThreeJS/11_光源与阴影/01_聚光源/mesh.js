import * as THREE from "three";

// 平面 z 方向尺寸，导出给 index.js 计算光源动画边界
export const planeZSize = 850;

const group = new THREE.Group();

// 地面：接收阴影
const planeGeometry = new THREE.PlaneGeometry(400, planeZSize);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
group.add(plane);

// 立方体模板：投射阴影（clone 会复制 castShadow）
const cubeGeometry = new THREE.BoxGeometry(50, 100, 50);
const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ffff });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.y = 50; // 高 100，抬高一半让底面贴地
cube.castShadow = true;

// 沿 z 轴排 7 个：z = -300, -200, ..., 300
for (let i = -3; i < 4; i++) {
  const mesh2 = cube.clone();
  mesh2.position.z = 100 * i;
  group.add(mesh2);
}

export default group;