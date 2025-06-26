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
/* const arr = [
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

const points = new THREE.Points(geometry2, material2); */

// 二维二次贝塞尔曲线
// p2是控制点，p1和p3是起点和终点
/* const p1 = new THREE.Vector2(-80, 0);
const p2 = new THREE.Vector2(20, 100);
const p3 = new THREE.Vector2(80, 0); */

// 三维二次贝塞尔曲线
/* const p1 = new THREE.Vector3(-80, 0, 0);
const p2 = new THREE.Vector3(20, 100, 0);
const p3 = new THREE.Vector3(80, 0, 100); */

// 二维三次贝塞尔曲线
/* const p1 = new THREE.Vector2(-80, 0);
const p2 = new THREE.Vector2(-40, 50);
const p3 = new THREE.Vector2(50, 50);
const p4 = new THREE.Vector2(80, 0); */

// 绘制模拟轨迹发射的曲线
const p1 = new THREE.Vector3(-100, 0, -100);
const p3 = new THREE.Vector3(100, 0, 100);
// 计算p1和p3的中间点坐标
const x2 = (p1.x + p3.x) / 2;
const z2 = (p1.z + p3.z) / 2;
const h = 120;
const p2 = new THREE.Vector3(x2, h, z2);
const arr = [p1, p2, p3];
// 三维二次贝塞尔曲线
const curve = new THREE.QuadraticBezierCurve3(p1, p2, p3);
const pointsArr = curve.getPoints(100);
// 定义线模型
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr);

const material = new THREE.LineBasicMaterial({
  color: 0xff00ff,
});
const line = new THREE.Line(geometry, material);

// 控制点的点模型
const geometry2 = new THREE.BufferGeometry();
geometry2.setFromPoints(arr);
const pointMaterial = new THREE.PointsMaterial({
  color: 0x00ffff,
  size: 10,
});
const points = new THREE.Points(geometry2, pointMaterial);

const line2 = new THREE.Line(
  geometry2,
  new THREE.LineBasicMaterial({ color: "#fff" })
);

const group = new THREE.Group();
group.add(line); // 贝塞尔曲线
group.add(points); // 控制点
group.add(line2); // 控制点连线

export default group;
