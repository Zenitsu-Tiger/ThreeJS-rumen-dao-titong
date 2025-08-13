import * as THREE from 'three';
const group = new THREE.Group();

// 4x4矩阵,mat4本质是一个单位矩阵
const mat4=new THREE.Matrix4()
// 平移矩阵
// .elements属性数组，按列输入
// mat4.elements=[1,0,0,0,0,1,0,0,0,0,1,10,50,0,0,1]
// 直接生成平移矩阵
// mat4.makeTranslation(50,0,0)
// 绕z轴旋转90度
// mat4.makeRotationZ(Math.PI/2)
// 缩放矩阵
mat4.makeScale(2,0,0)
 const p=new THREE.Vector3(50,0,0)
//  矩阵对p点坐标进行平移变化
p.applyMatrix4(mat4)
console.log('p',p);

const pointGeometry=new THREE.BufferGeometry()
const positions=new Float32Array([p.x,p.y,p.z])
pointGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3))
const pointMaterial=new THREE.PointsMaterial({
  color:0x00ffff,
  size:10
})
const point=new THREE.Points(pointGeometry,pointMaterial)

group.add(point);
export default group;
  