import * as THREE from "three";

// shape是一个二维轮廓
const shape=new THREE.Shape()
// currentPoint移动到(150,0)
shape.lineTo(150,0)
// 圆弧的.arc()参数的圆心坐标是相对当前.currentPoint而言，而非坐标原点
// shape.arc(-50,0,50,0,Math.PI/2)
// 绝对圆弧的.absarc()参数的圆心坐标是相对于坐标原点而言，不会受.currentPoint影响
// shape.absarc(0,0,50,0,Math.PI/2)

console.log('currentPoint',shape.currentPoint);

shape.lineTo(0,50)
// 第二个参数是分段数，决定了光滑程度
// 数值越高给的分段数越多，越光滑
const geometry=new THREE.ShapeGeometry(shape,20)

const material=new THREE.MeshLambertMaterial({
  color:0x00ffff,

})
const mesh=new THREE.Mesh(geometry,material)

const group = new THREE.Group();
group.add(mesh)

export default group;
  