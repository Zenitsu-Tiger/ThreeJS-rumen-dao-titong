import * as THREE from "three";

/* const pointsArr=[
  new THREE.Vector2(50,60),
  new THREE.Vector2(25,0),
  new THREE.Vector2(50,-60)
] */
const pointsArr=[
new THREE.Vector2(-50,-50),
new THREE.Vector2(-60,0),
new THREE.Vector2(0,50),
new THREE.Vector2(60,0),
new THREE.Vector2(50,-50),
]

// 基本轮廓线
/* // const geometry=new THREE.LatheGeometry(pointsArr,30,0,Math.PI)
// 做一个二维样条曲线
const curve=new THREE.SplineCurve([...pointsArr])
const arr=curve.getPoints(100)
// 参数分别是：点数组,分段
const geometry=new THREE.LatheGeometry(arr,30) */


// 多边形轮廓填充几何体
const shape=new THREE.Shape(pointsArr)
const geometry=new THREE.ShapeGeometry(shape)


// 多边形轮廓线
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff,
  side:THREE.DoubleSide,
  wireframe:true
})

const mesh=new THREE.Mesh(geometry,material)

const group = new THREE.Group();
group.add(mesh)

export default group;
  