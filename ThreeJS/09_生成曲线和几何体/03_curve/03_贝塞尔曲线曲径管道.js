import * as THREE from "three";

// 移除(0,0,0)点，保留4个点创建U形贝塞尔曲线
const arr = [
  new THREE.Vector3(50, 0, 0),    // 起始点
  new THREE.Vector3(10, 0, 0),    // 控制点1 - 要经过
  new THREE.Vector3(0, 0, 0),     // 控制点2
  new THREE.Vector3(0, 0, 10),    // 控制点3 - 要经过
  new THREE.Vector3(0, 0, 50),    // 结束点
]

// 使用CurvePath组合多段贝塞尔曲线
const curvePath = new THREE.CurvePath();

// 第一段：起始点 -> 控制点1
const segment1 = new THREE.QuadraticBezierCurve3(
  arr[0],  // 起始点 (50,0,0)
  new THREE.Vector3(30, 0, 0),  // 中间控制点
  arr[1]   // 控制点1 (10,0,0) - 经过此点
);

// 第二段：控制点1 -> 控制点3
const segment2 = new THREE.QuadraticBezierCurve3(
  arr[1],  // 控制点1 (10,0,0)
  arr[2],  // 控制点2 (0,0,0) 作为控制点
  arr[3]   // 控制点3 (0,0,10) - 经过此点
);

// 第三段：控制点3 -> 结束点
const segment3 = new THREE.QuadraticBezierCurve3(
  arr[3],  // 控制点3 (0,0,10)
  new THREE.Vector3(0, 0, 30),  // 中间控制点
  arr[4]   // 结束点 (0,0,50)
);

// 将所有段添加到CurvePath
curvePath.add(segment1);
curvePath.add(segment2);
curvePath.add(segment3);

// 从组合路径获取点 - 一行代码搞定！
const pointsArr = curvePath.getPoints(60);

// 创建曲线几何体
const curveGeometry = new THREE.BufferGeometry();
curveGeometry.setFromPoints(pointsArr);

// 创建控制点几何体
const controlPointsGeometry = new THREE.BufferGeometry();
controlPointsGeometry.setFromPoints(arr);



// 材质
const curveMaterial = new THREE.LineBasicMaterial({ 
  color: 0x00ffff, 
  linewidth: 2 
});

const controlPointMaterial = new THREE.PointsMaterial({
  color: 0xff00ff,
  size: 8,
  sizeAttenuation: false
});

const controlLineMaterial = new THREE.LineBasicMaterial({ 
  color: 0xffa500, 
  linewidth: 1,
  transparent: true,
  opacity: 0.5
});

// 创建对象
const curveLine = new THREE.Line(curveGeometry, curveMaterial);
const controlPoints = new THREE.Points(controlPointsGeometry, controlPointMaterial);

const group = new THREE.Group();
group.add(curveLine);
group.add(controlPoints);

export default group;
