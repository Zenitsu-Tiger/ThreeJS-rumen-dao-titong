import * as THREE from 'three'

const group=new THREE.Group()

const geometry=new THREE.BufferGeometry()
const vertices=new Float32Array([
  100,25,0,
  100,-25,25,
  100,-25,-25,
])

const attributes=new THREE.BufferAttribute(vertices,3)

geometry.attributes.position=attributes

const material=new THREE.MeshBasicMaterial({color:0x00ff00,side:THREE.DoubleSide,wireframe:true})
const mesh=new THREE.Mesh(geometry,material)

// 创建射线对象Ray
const ray=new THREE.Ray()
// 设置射线起点
// ray.origin=new THREE.Vector3(0,0,0)
// 另一种设置方法
ray.origin.set(0,0,0)

// 表示射线沿着某个方向
ray.direction=new THREE.Vector3(5,0,0).normalize()
console.log('ray',ray);

const p1=new THREE.Vector3( 100,25,0,)
const p2=new THREE.Vector3(100,-25,25,)
const p3=new THREE.Vector3(100,-25,-25,)
// 记录射线和三角形的交叉点
const point=new THREE.Vector3()
// .intersectTriangle用于实现射线与三角形相交
const result=ray.intersectTriangle(p1,p2,p3,false,point)
console.log('交叉点',result);
// 背面剔除
const r=ray.intersectTriangle(p1,p2,p3,true,point)
console.log('背面剔除',r);


group.add(mesh)

export default group