// 引入Three.js
import * as THREE from 'three';
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

const group = new THREE.Group();
// 绕转半径
const R = 100;
// 绕转高度
const H = 30;
loader.load('../工厂.glb', function (gltf) {
  group.add(gltf.scene);
});

loader.load('./yak9.glb', function (gltf) {
  const plane = new THREE.Group();
  plane.scale.set(2, 2, 2);
  plane.add(gltf.scene);
  plane.rotation.y = Math.PI / 4;

  group.add(plane);
  const axesHelper = new THREE.AxesHelper(30);
  plane.add(axesHelper);

  // 初始位置
  plane.position.y = H;
  plane.position.x = R;

  // 战斗机加载进来默认方向
  const a = new THREE.Vector3(-1, 0, 0);

  // 绕转中心坐标
  const target = new THREE.Vector3(0, H, 0);
  // 姿态角度初始值
  const q0 = plane.quaternion.clone();
  let angle = 0;
  function loop() {
    requestAnimationFrame(loop);
    angle += 0.01;
    const x = R * Math.cos(angle);
    const z = R * Math.sin(angle);
    // 更新战斗机位置
    plane.position.x = x;
    plane.position.z = z;
    /* 沿圆心飞行的方法  */

    // 战斗机指向的方向
    const b = target.clone().sub(plane.position).normalize();
    // 生成一个四元数，使得飞机从a旋转到b
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(a, b);

    // 创建向下侧偏45度的四元数
    const rollQuaternion = new THREE.Quaternion();
    // 绕飞机自身的前进方向轴（X轴）旋转45度实现侧偏
    rollQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 6); // 45度
    const roll2Quaternion = new THREE.Quaternion();
    roll2Quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 10);
    // 组合旋转：先朝向target，再向下侧偏45度
    const newQ = q0
      .clone()
      .multiply(q)
      .multiply(rollQuaternion)
      .multiply(roll2Quaternion);
    plane.quaternion.copy(newQ);

    /* 沿切线飞行的方法, 使得模型始终保持和飞行方向一致 */
    /*     const x2 = R * Math.cos(angle + 0.001);
    const z2 = R * Math.sin(angle + 0.001);

    const b = new THREE.Vector3(x2 - x, 0, z2 - z).normalize();
    // a和b构成的旋转:四元数
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(a, b);

    const newQ = q0.clone().multiply(q);
    plane.quaternion.copy(newQ);
    */
  }
  loop();
});

export default group;
