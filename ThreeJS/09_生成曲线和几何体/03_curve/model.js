import * as THREE from "three";

// 生成椭圆曲线
// const arc = new THREE.EllipseCurve(0, 0, 120, 50);
// 获取椭圆曲线上的随机点
// const pointsArr = arc.getPoints(50);
// 获取椭圆曲线上的等分点
// const pointsArr = arc.getSpacedPoints(50);
// console.log("椭圆曲线上获取的坐标", pointsArr);

// 生成圆弧曲线
// const arc = new THREE.ArcCurve(0, 0, 50, 0, 0.5 * Math.PI);
// const pointsArr = arc.getPoints(50);
// const geometry = new THREE.BufferGeometry();
// geometry.setFromPoints(pointsArr);
// setFromPoints相当于使用pointsArr中的坐标来创建几何体
/* const positions = new Float32Array(pointsArr.length * 2);
for (let i = 0; i < pointsArr.length; i++) {
  positions[i * 2] = pointsArr[i].x;
  positions[i * 2 + 1] = pointsArr[i].y;
}
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 2)); */

// 生成不规则的三维样条曲线
const arr = [
  new THREE.Vector3(-50, 20, 90),
  new THREE.Vector3(-10, 40, 40),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(60, -60, 0),
  new THREE.Vector3(70, 0, 80),
];

const curve = new THREE.CatmullRomCurve3(arr);
const pointsArr = curve.getPoints(50);
// 定义线模型
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr);

const material = new THREE.LineBasicMaterial({
  color: 0xff0000,
});
const line = new THREE.Line(geometry, material);

// 用点模型可视化样条曲线经过的顶点位置
const geometry2 = new THREE.BufferGeometry();
geometry2.setFromPoints(arr);
const material2 = new THREE.PointsMaterial({
  color: 0xff00ff,
  size: 10,
});

const points = new THREE.Points(geometry2, material2);

const group = new THREE.Group();
group.add(line);
group.add(points);

export default group;
