import * as THREE from 'three';
const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);

// 已知三角形的三个顶点坐标，计算其中一个顶点p1对应角度的余弦值
const p1=new THREE.Vector3(0,0,0)
const p2=new THREE.Vector3(20,0,0)
const p3=new THREE.Vector3(10,10,0)

// 这里是为了获取p1到p3和p1到p2的向量
const a=p3.clone().sub(p1)
const b=p2.clone().sub(p1) 
// 通过两个向量的单位向量来计算cos的值
const cos=a.normalize().dot(b.normalize())
// 通过反余弦计算来计算出对应的弧度
const rad=Math.acos(cos)
// 弧度转度
const deg=THREE.MathUtils.radToDeg(rad)
console.log('p1对应角度的余弦值',deg);

group.add(mesh);
export default group;
