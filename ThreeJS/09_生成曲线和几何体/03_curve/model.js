import * as THREE from "three";

/* const c1 = new THREE.Color(0xff0000);
const c2 = new THREE.Color(0x0000ff);
const c = new THREE.Color(); */

// 如果第三个值取值是0，则返回c1的颜色，如果取值是1，则返回c2的颜色，如果取值是0.5，则返回c1和c2的中间颜色
// 如果取0.1,那么就意味着c1取0.1，c2取0.9
// c.lerpColors(c1, c2, 0);
// 将 c1 修改为红色和蓝色的中间色
/**
 * 执行前：
 * c1 = 红色 (1.0, 0.0, 0.0)
 * c2 = 蓝色 (0.0, 0.0, 1.0)
 * 执行后：
 * c1 = 紫色 (0.5, 0.0, 0.5) ← c1 被修改了！
 * c2 = 蓝色 (0.0, 0.0, 1.0) ← c2 保持不变
 * lerp 与 lerpColors 的区别
 */
// c1.lerp(c2, 0.5);
// console.log("颜色插值的结果", c1.getHexString());
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
const c1 = new THREE.Color(0xff0000);
const c2 = new THREE.Color(0x0000ff);
for (let i = 0; i < count; i++) {
  const percent = i / count;
  const c = c1.clone().lerp(c2, percent);
  //   colorsArr.push(percent, 0, 1 - percent);
  colorsArr.push(c.r, c.g, c.b);
}
console.log("length", colorsArr.length);
const colors = new Float32Array(colorsArr);

// 必须通过THREE.BufferAttribute来设置颜色属性
geometry.attributes.color = new THREE.BufferAttribute(colors, 3);
// 7. 创建材质
// 使用 PointsMaterial 或 LineBasicMaterial
const material = new THREE.LineBasicMaterial({
  vertexColors: true,
  size: 20, // 仅对 PointsMaterial 有效，定义点的大小
});
const mesh = new THREE.Line(geometry, material);

// 9. 导出模型
export default mesh;
