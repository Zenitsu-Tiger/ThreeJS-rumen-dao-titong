import * as THREE from "three";

// 1. 创建一个空的 BufferGeometry
// BufferGeometry 是一个高效的几何体表示，它将所有数据（如顶点位置、颜色、法线）存储在"属性"中。
const geometry = new THREE.BufferGeometry();
// CatmullRomCurve3是一个三次贝塞尔曲线
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-50, 20, 90),
  new THREE.Vector3(-10, 40, 40),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(60, -60, 0),
  new THREE.Vector3(70, 0, 80),
]);
// 平均取采样点
const pointsArr = curve.getSpacedPoints(100);

geometry.setFromPoints(pointsArr);

const pos = geometry.attributes.position;
console.log("pos", pos);
// 获取顶点的数量
const count = pos.count;
const colorsArr = [];

for (let i = 0; i < count; i++) {
  const percent = i / count;
  colorsArr.push(percent, 0, 1 - percent);
}
console.log("length", colorsArr.length);
const colors = new Float32Array(colorsArr);

// 必须通过THREE.BufferAttribute来设置颜色属性
geometry.attributes.color = new THREE.BufferAttribute(colors, 3);
// 7. 创建材质
// 使用 PointsMaterial 或 LineBasicMaterial
const material = new THREE.LineBasicMaterial({
  // 或者 THREE.PointsMaterial
  // color: 0xffff00, // 注意：当 vertexColors 为 true 时，此处的颜色设置会失效
  // 关键！告诉材质去使用 geometry.attributes.color 中定义的顶点颜色
  vertexColors: true,
  size: 20, // 仅对 PointsMaterial 有效，定义点的大小
});

// 8. 创建网格模型 (Points 或 Line)
// const mesh = new THREE.Points(geometry, material); // 如果想显示为三个彩色的点
// Line 会将顶点按顺序连接起来，形成 V0-V1-V2 的折线
const mesh = new THREE.Line(geometry, material);

// 9. 导出模型
export default mesh;
