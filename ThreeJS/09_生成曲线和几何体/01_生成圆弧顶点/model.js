import * as THREE from "three";

const geometry = new THREE.BufferGeometry();

const R = 100;
const N = 50;
const sp = (2 * Math.PI) / N; //两个相邻顶点之间的弧度
const arr = [];
/* for (let i = 0; i < N; i++) {
  const angle = sp * i;
  const x = R * Math.cos(angle);
  const y = R * Math.sin(angle);
  const z = 0;
  arr.push(x, y, z);
} */

// 设置圆心坐标
const cx = 200;
const cy = 200;

for (let i = 0; i < N; i++) {
  const angle = sp * i;
  const x = cx + R * Math.cos(angle);
  const y = cy + R * Math.sin(angle);
  const z = 0;
  arr.push(x, y, z);
}

// 类型数组创建顶点数据
const vertices = new Float32Array(arr);

const attributes = new THREE.BufferAttribute(vertices, 3);

geometry.attributes.position = attributes;

const material = new THREE.LineBasicMaterial({
  color: 0xff0000,
});

const line = new THREE.LineLoop(geometry, material);

export default line;
