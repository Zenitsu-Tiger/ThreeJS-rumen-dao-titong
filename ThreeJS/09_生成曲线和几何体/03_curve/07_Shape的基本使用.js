import * as THREE from "three";

// shape是一个二维轮廓
const shape=new THREE.Shape()
// currentPoint默认值是Vector2(0,0)，currentPoint是动态的当前绘制的终点
console.log('currentPoint',shape.currentPoint);
// currentPoint移动到(10,0)，这将成为起始点
shape.moveTo(10,0)
// 绘制直线线段，起点(10,0)，终点(100,0)
shape.lineTo(100,0)
shape.lineTo(100,100)
shape.lineTo(10,100)
// shape可以自动闭合，也可以手动闭合
/* shape.lineTo(0,0)
shape.closePath() */
const geometry=new THREE.ShapeGeometry(shape)
/* const geometry=new THREE.ExtrudeGeometry(shape,{
  depth:300,
  bevelEnabled:true,
  bevelThickness:10,
  bevelSize:10,
  bevelSegments:10,
}) */
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff,

})
const mesh=new THREE.Mesh(geometry,material)

const group = new THREE.Group();
group.add(mesh)

export default group;
  