import * as THREE from 'three';

const geometry=new THREE.BoxGeometry(10,10,10)
const material=new THREE.MeshLambertMaterial({
  color:0x00ffff,
})
const mesh=new THREE.Mesh(geometry,material)

mesh.position.set(1,2,3)

const group = new THREE.Group();
group.position.set(10,0,0)
group.add(mesh)


/* // 更新矩阵
mesh.updateMatrix()
// 更新组对象的世界矩阵
mesh.updateMatrixWorld() */
console.log('本地矩阵',mesh.matrix);
console.log('世界矩阵',mesh.matrixWorld);
// group世界矩阵
console.log('group世界矩阵',group.matrixWorld);




export default group;
  