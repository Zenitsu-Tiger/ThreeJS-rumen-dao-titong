import * as THREE from "three";
import data from "./data.js"
const group = new THREE.Group();

const pointsArr=[]
data.forEach((e)=>{
  const v2=new THREE.Vector2(e[0],e[1])
  pointsArr.push(v2)
})
// Shape表示一个平面多边形轮廓，参数是二维向量构成的数组pointsArr
const shape=new THREE.Shape(pointsArr)

const geometry=new THREE.ShapeGeometry(shape)
// 多边形轮廓shape作为ShapeGeometry的参数，生成一个平面多边形几何体
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff,
  side:THREE.DoubleSide
})

const mesh=new THREE.Mesh(geometry,material)
const box3=new THREE.Box3()
box3.expandByObject(mesh)
const scale=new THREE.Vector3()
box3.getSize(scale)
console.log("scale",scale)
const center=new THREE.Vector3()
box3.getCenter(center)
console.log("center",center)
group.add(mesh);

export default group;
