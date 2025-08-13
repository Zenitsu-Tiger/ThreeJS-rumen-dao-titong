import * as THREE from 'three';
const group = new THREE.Group();


 const p=new THREE.Vector3(50,0,0)
//  矩阵对p点坐标进行平移变化
const T=new THREE.Matrix4()
T.makeTranslation(50,0,0)
const R=new THREE.Matrix4()
R.makeRotationZ(Math.PI/2)


/* p.applyMatrix4(T)
p.applyMatrix4(R) */
// 谁优先应用谁写后面，这里是先平移，再旋转
const modelMatrix=R.clone().multiply(T)
p.applyMatrix4(modelMatrix)
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
  