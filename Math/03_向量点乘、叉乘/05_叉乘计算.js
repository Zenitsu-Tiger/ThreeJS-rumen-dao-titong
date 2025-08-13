// 引入Three.js
import * as THREE from 'three';

const group = new THREE.Group();

const a = new THREE.Vector3(50, 0, 0);
const b = new THREE.Vector3(30, 0, 30);

// 给箭头设置起点(随便指定位置)
const O = new THREE.Vector3(0, 0, 0);
// 参数分别是a对应的向量，箭头起点，箭头长度，箭头颜色
const arrowA = new THREE.ArrowHelper(
  a.clone().normalize(),
  O,
  a.length(),
  0xff0000
);
group.add(arrowA);

const arrowB = new THREE.ArrowHelper(
  b.clone().normalize(),
  O,
  b.length(),
  0x00ff00
);
group.add(arrowB);

// 创建向量C用于保存叉乘的结果
const c = new THREE.Vector3();
/* 叉乘的顺序会影响c的方向 */
// 向量a叉乘b的结果=>c
c.crossVectors(a, b);
//  向量b叉乘a的结果=>c
// c.crossVectors(b, a);
// 叉乘的另一种计算方式
// const c=a.clone().cross(b)

const arrowC = new THREE.ArrowHelper(
  c.clone().normalize(),
  O,
  c.length() / 30,
  0x0000ff
);
group.add(arrowC);

export default group;
