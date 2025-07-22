import * as THREE from "three";

const geometry=new THREE.SphereGeometry(5)
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff
})

const mesh1=new THREE.Mesh(geometry,material)
const mesh2=new THREE.Mesh(geometry,material)

const group=new THREE.Group()
group.add(mesh1)
group.add(mesh2)

const A=new THREE.Vector3(30,30,0)
const B=new THREE.Vector3()

/* // 起点A
const A=new THREE.Vector3(30,30,0)
// walk表示运动的位移量和向量
const walk=new THREE.Vector3(100,50,0)
// const B=new THREE.Vector3()

// 计算结束点xyz
// B.x=A.x+walk.x
// B.y=A.y+walk.y
// B.z=A.z+walk.z 
// B.addVectors(A,walk)
const B=A.clone().add(walk)
// 设置结束点
mesh1.position.copy(A)
mesh2.position.copy(B) */

/* // 假设起点坐标是(30,30,0)，以速度v运动50秒，计算运动结束为止
const A=new THREE.Vector3(30,30,0)
// 向量v代表了移动的速度，速度是根号2米每秒，方向是x,y正半轴的角平分线
const v=new THREE.Vector3(1,1,0)
// const walk=new THREE.Vector3(v.x*50,v.y*50,v.z*50)≤
const walk=v.clone().multiplyScalar(50)
const B=A.clone().add(walk)

mesh1.position.copy(B) */



//  向量长度的计算
/* const A=new THREE.Vector3(30,30,0)
const B=new THREE.Vector3()
const x1=A.x
const x2=B.x
const y1=A.y
const y2=B.y
const AO=x2-x1
const BO=y2-y1 */

// A.普通的计算对应的距离
/* // const L=Math.sqrt(AO*AO+BO*BO)
const L=Math.sqrt(Math.pow(B.x-A.x,2)+Math.pow(B.y-A.y,2))
console.log(L)
// B.用向量来计算位移量
const AB=new THREE.Vector3()
AB.x=B.x-A.x
AB.y=B.y-A.y
AB.z=B.z-A.z

// 向量的长度
const L2=AB.length()
console.log(L2) */

// C.向量减法运算
/* const AB2=new THREE.Vector3()
AB2.subVectors(B,A)
const L3=AB2.length()
console.log(L3)
console.log('AB2',AB2); */

/* // D.sub向量减法
const AB3=B.clone().sub(A)
console.log('AB3  ',AB3); */


// 速度向量的计算方式
// v代表速度向量，v的长度.length()就是速度大小
const v=new THREE.Vector3(1,1,0)
const vLength=v.length()
console.log('vLength',vLength)

// 向量归一化
// 向量归一化
v.x=v.x/vLength
v.y=v.y/vLength
v.z=v.z/vLength
console.log('v',v)
console.log('单位向量vLength',v.length())
v.normalize()
console.log('v.normalize',v)

/* 向量方向和归一化的特性 */
// 案例一，利用单位向量结合速度计算位移
const direction = new THREE.Vector3(1, 1, 0);
direction.normalize(); // direction 现在是 (0.707, 0.707, 0)，长度为1

const speed = 10;

// 用纯方向乘以你想要的速度
const velocity = direction.multiplyScalar(speed); 
// velocity 现在是 (7.07, 7.07, 0)

// 这个最终的速度向量，它的方向和 (1,1,0) 完全一样，
// 但它的长度 .length() 恰好就是 10！
console.log(velocity.length()); // 输出约等于 10


// 案例二：利用单位向量确定两个点对应的方向，并计算模型基于这个值的位移量
const BoxGeometry=new THREE.BoxGeometry(10,10,10)
const BoxMaterial=new THREE.MeshLambertMaterial({color:0x00ffff})
const BoxMesh=new THREE.Mesh(BoxGeometry,BoxMaterial)
BoxMesh.position.set(-50,0,-50)
const C=new THREE.Vector3(-50,0,-50)
const D=new THREE.Vector3(100,0,100)
const CD=D.clone().sub(C)
CD.normalize() //CD归一化，得到CD的单位向量，获取它的方向
const CDVelocity=CD.clone().multiplyScalar(100) //CDVelocity是CD的单位向量乘以速度10,沿着CD反向平移100个单位
console.log('CDVelocity的位移长度',CDVelocity.length());
// 用一个向量表示模型平移的过程，沿着CD方向平移100长度
BoxMesh.position.add(CDVelocity)
group.add(BoxMesh)


export default group;