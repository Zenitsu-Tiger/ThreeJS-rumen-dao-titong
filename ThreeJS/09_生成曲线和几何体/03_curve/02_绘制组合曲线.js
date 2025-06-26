import * as THREE from "three";

const R = 80; //先设置圆弧半径
const H = 200; //设置直线的高度

const line1 = new THREE.LineCurve(
  new THREE.Vector2(R, H),
  new THREE.Vector2(R, 0)
);
const arc = new THREE.ArcCurve(0, 0, R, 0, Math.PI, true);

const line2 = new THREE.LineCurve(
  new THREE.Vector2(-R, 0),
  new THREE.Vector2(-R, H)
);
// CurvePath创建组合曲线对象
const CurvePath = new THREE.CurvePath();
// line1,arc,line2拼接出来一个U型轮廓曲线，注意顺序
CurvePath.curves.push(line1, arc, line2);
// 三维样条曲线
const pointsArr = CurvePath.getPoints(30);
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr);

const material = new THREE.LineBasicMaterial({
  color: 0x00fffff,
});

const material2 = new THREE.PointsMaterial({
  color: 0xff00ff,
  size: 10,
});

// 点模型对象
const points = new THREE.Points(geometry, material2);

const line = new THREE.Line(geometry, material);

const group = new THREE.Group();
group.add(line);
group.add(points);
export default group;
