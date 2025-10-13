import * as THREE from "three";

// shape是一个二维轮廓
const shape=new THREE.Shape()
shape.lineTo(100,0)
shape.lineTo(100,100)
shape.lineTo(0,100)

/* Shape内孔轮廓绘制 */
const path1=new THREE.Path()
path1.absarc(20,20,10)

const path2=new THREE.Path()
path2.absarc(80,20,10)

const path3=new THREE.Path()
path3.moveTo(50,50)
path3.lineTo(80,50)
path3.lineTo(80,80)
path3.lineTo(50,80)

// 三个内径轮廓分别插入到holes属性中
shape.holes.push(path1,path2,path3)

const geometry=new THREE.ShapeGeometry(shape,20)

const material=new THREE.MeshLambertMaterial({
  color:0x00ffff,
})
const mesh=new THREE.Mesh(geometry,material)

const group = new THREE.Group();
group.add(mesh)

export default group;
  