import * as THREE from 'three';
const group = new THREE.Group();

const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshLambertMaterial({
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);

const a=new THREE.Vector3(10,10,0)
const b=new THREE.Vector3(20,0,0)
// a和b点乘运算
const result=a.dot(b)
console.log('a和b点乘运算结果',result);
console.log(a.normalize());

// 计算向量a和b的余弦值，其实就是单位向量点乘公式即可: 
const cos=a.normalize().dot(b.normalize())
console.log('a和b的余弦值',cos);
// 通过反余弦计算余弦值对应的夹角弧度大小
const rad=Math.acos(cos)
console.log('a和b的夹角弧度大小',rad );
// 通过弧度大小计算夹角角度大小
const deg=rad*180/Math.PI
console.log('a和b的夹角角度大小',deg);

group.add(mesh);
export default group;
